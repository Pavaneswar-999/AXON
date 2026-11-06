/**
 * Balatro WebGL2 Background Component
 * Exact React-Bits specification provided by user
 * Features WebGL2 GPGPU fluid field, Balatro swirling paint shader, click twirls & CRT screen.
 */

(function (global) {
  'use strict';

  const PIXEL_BUDGET = 2.4e6;
  const MAX_TWIRLS = 4;
  const FIELD_SCALE = 8;
  const STIR_RADIUS = 90;

  const VERTEX = `#version 300 es
  const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  void main() {
    gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
  }`;

  const FIELD = `#version 300 es
  precision highp float;
  uniform sampler2D uPrev;
  uniform vec2 uSize;
  uniform vec2 uCss;
  uniform vec2 uFrom;
  uniform vec2 uTo;
  uniform vec2 uPush;
  uniform float uRadius;
  uniform float uDecay;
  out vec4 fragColor;

  void main() {
    vec2 cell = gl_FragCoord.xy / uSize;
    vec2 p = vec2(cell.x, 1.0 - cell.y) * uCss;
    vec2 seg = uTo - uFrom;
    float len2 = max(dot(seg, seg), 1e-6);
    float h = clamp(dot(p - uFrom, seg) / len2, 0.0, 1.0);
    vec2 gap = p - uFrom - seg * h;
    vec2 delta = uPush * exp(-dot(gap, gap) / (uRadius * uRadius));
    vec2 src = p - delta;
    vec2 prev = texture(uPrev, vec2(src.x / uCss.x, 1.0 - src.y / uCss.y)).xy;
    fragColor = vec4((prev + delta) * uDecay, 0.0, 1.0);
  }`;

  const PAINT = `#version 300 es
  precision highp float;
  uniform vec2 uCss;
  uniform vec2 uCanvas;
  uniform float uBlock;
  uniform float uFlow;
  uniform float uSpin;
  uniform vec2 uOffset;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uContrast;
  uniform float uLighting;
  uniform float uSwirl;
  uniform float uScale;
  uniform int uDetail;
  uniform sampler2D uField;
  uniform float uFieldOn;
  uniform vec4 uTwirls[${MAX_TWIRLS}];
  uniform float uReveal;
  uniform float uLight;
  uniform float uOpacity;
  out vec4 fragColor;

  vec3 paint(vec2 screenSize, vec2 coords) {
    vec2 uv = (coords - 0.5 * screenSize) / length(screenSize) - uOffset;
    float radius = length(uv);
    float speed = uSpin + 302.2;
    float angle = atan(uv.y, uv.x) + speed - 20.0 * (uSwirl * radius + (1.0 - uSwirl));
    vec2 mid = (screenSize / length(screenSize)) / 2.0;
    uv = vec2(radius * cos(angle) + mid.x, radius * sin(angle) + mid.y) - mid;

    uv *= 30.0 / uScale;
    speed = uFlow;
    vec2 uv2 = vec2(uv.x + uv.y);
    for (int i = 0; i < 8; i++) {
      if (i >= uDetail) break;
      uv2 += sin(max(uv.x, uv.y)) + uv;
      uv += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));
      uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }

    float contrastMod = 0.25 * uContrast + 0.5 * uSwirl + 1.2;
    float amount = min(2.0, max(0.0, length(uv) * 0.035 * contrastMod));
    float c1 = max(0.0, 1.0 - contrastMod * abs(1.0 - amount));
    float c2 = max(0.0, 1.0 - contrastMod * abs(amount));
    float c3 = 1.0 - min(1.0, c1 + c2);
    float light = (uLighting - 0.2) * max(c1 * 5.0 - 4.0, 0.0) + uLighting * max(c2 * 5.0 - 4.0, 0.0);
    vec3 gap = uLight > 0.5 ? mix(uColor3, vec3(1.0), 0.9) : uColor3;
    float base = 0.3 / uContrast;
    vec3 color = base * uColor1 + (1.0 - base) * (uColor1 * c1 + uColor2 * c2 + gap * c3) + light;
    return mix(gap, color, uReveal);
  }

  void main() {
    vec2 cell = floor(gl_FragCoord.xy) + 0.5;
    vec2 p = vec2(cell.x, uCanvas.y - cell.y) * uBlock;
    if (uFieldOn > 0.5) {
      p -= texture(uField, vec2(p.x / uCss.x, 1.0 - p.y / uCss.y)).xy;
    }
    for (int i = 0; i < ${MAX_TWIRLS}; i++) {
      vec4 twirl = uTwirls[i];
      if (twirl.w <= 0.0) continue;
      vec2 rel = p - twirl.xy;
      float turn = twirl.z * exp(-dot(rel, rel) / (twirl.w * twirl.w));
      float c = cos(turn);
      float s = sin(turn);
      p = twirl.xy + vec2(c * rel.x - s * rel.y, s * rel.x + c * rel.y);
    }
    vec3 color = paint(uCss, vec2(p.x, uCss.y - p.y));
    float grain = (fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
    color = clamp(color + grain, 0.0, 1.0);
    fragColor = vec4(color * uOpacity, uOpacity);
  }`;

  const SCREEN = `#version 300 es
  precision highp float;
  uniform sampler2D uPaint;
  uniform vec2 uCanvas;
  uniform vec2 uSource;
  uniform float uDevice;
  uniform float uCrt;
  out vec4 fragColor;

  float smoother(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  void main() {
    vec2 device = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y);
    vec2 cell = floor(device / uDevice);
    vec4 texel = texture(uPaint, vec2((cell.x + 0.5) / uSource.x, 1.0 - (cell.y + 0.5) / uSource.y));
    vec3 color = texel.rgb;
    float glow = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float period = max(uDevice, 3.0);
    float row = fract(device.y / period);
    float line = smoother(0.5, 0.92, row) * (1.0 - smoother(0.92, 1.0, row));
    color *= 1.0 - uCrt * 0.34 * line * (1.0 - 0.7 * glow);
    vec2 screen = gl_FragCoord.xy / uCanvas;
    float edge = smoother(0.0, 0.18, screen.x) * smoother(0.0, 0.18, 1.0 - screen.x);
    edge *= smoother(0.0, 0.24, screen.y) * smoother(0.0, 0.24, 1.0 - screen.y);
    color *= mix(1.0, 0.78 + 0.22 * edge, uCrt);
    color *= 1.0 + uCrt * 0.1;
    fragColor = vec4(min(color, vec3(texel.a)), texel.a);
  }`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const parseColor = value => {
    const text = String(value || '').trim();
    const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
    if (hex) {
      const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];
      return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16) / 255);
    }
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
    if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(parseFloat(channel) / 255, 0, 1));
    return null;
  };

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const link = (gl, source) => {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, source);
    const program = vertex && fragment ? gl.createProgram() : null;
    if (!vertex || !fragment || !program) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      return null;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let index = 0; index < count; index++) {
      const info = gl.getActiveUniform(program, index);
      if (info) uniforms[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  };

  const smoother = t => {
    const x = clamp(t, 0, 1);
    return x * x * x * (x * (x * 6 - 15) + 10);
  };

  class Balatro {
    constructor(canvas, props = {}) {
      this.canvas = canvas;
      this.container = canvas.parentElement || document.body;

      this.settings = {
        color1: parseColor(props.color1 || '#051c14') || [0.02, 0.11, 0.08],
        color2: parseColor(props.color2 || '#16422d') || [0.09, 0.26, 0.18],
        color3: parseColor(props.color3 || '#020906') || [0.01, 0.04, 0.02],
        contrast: clamp(props.contrast !== undefined ? props.contrast : 3.5, 0.5, 10),
        lighting: clamp(props.lighting !== undefined ? props.lighting : 0.4, 0, 1.5),
        swirl: clamp(props.swirl !== undefined ? props.swirl : 0.25, 0, 1),
        speed: Math.max(0, props.speed !== undefined ? props.speed : 1),
        rotation: clamp(props.rotationSpeed || 0, -10, 10),
        scale: clamp(props.scale || 1, 0.2, 5),
        detail: clamp(Math.round(props.detail || 5), 1, 8),
        offset: Array.isArray(props.offset) ? [Number(props.offset[0]) || 0, Number(props.offset[1]) || 0] : [0, 0],
        pixelSize: clamp(props.pixelSize !== undefined ? props.pixelSize : 1.5, 0, 24),
        crt: clamp(props.crt || 0, 0, 1),
        mouse: props.mouseInteraction !== undefined ? props.mouseInteraction : true,
        strength: clamp(props.mouseStrength !== undefined ? props.mouseStrength : 1, 0, 3),
        clickSwirl: props.clickSwirl !== undefined ? props.clickSwirl : true,
        intro: props.intro !== undefined ? props.intro : true,
        light: props.lightMode || false,
        opacity: clamp(props.opacity !== undefined ? props.opacity : 1, 0, 1),
        maxRatio: clamp(props.maxDevicePixelRatio || 2, 0.5, 3)
      };

      this.initWebGL();
    }

    initWebGL() {
      const gl = this.canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance'
      });
      if (!gl) {
        console.warn('WebGL2 not supported');
        return;
      }
      this.gl = gl;

      this.paintProgram = link(gl, PAINT);
      this.screenProgram = link(gl, SCREEN);
      if (!this.paintProgram || !this.screenProgram) return;

      const floatTargets = !!(
        gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')
      );
      this.fieldProgram = floatTargets ? link(gl, FIELD) : null;

      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.vao = gl.createVertexArray();
      this.view = { cssWidth: 1, cssHeight: 1, block: 1, device: 1, width: 1, height: 1, crt: false };
      this.paintTarget = { texture: gl.createTexture(), framebuffer: gl.createFramebuffer(), width: 0, height: 0 };
      this.field = { width: 0, height: 0, targets: [], energy: 0 };
      this.pointer = { x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, inside: false, ready: false };
      this.steer = { value: 0 };
      this.twirls = [];
      this.twirlData = new Float32Array(MAX_TWIRLS * 4);
      this.flow = 14;
      this.spin = 0;
      this.opening = this.settings.intro && !this.reduced ? 0 : 1;
      this.raf = 0;
      this.last = performance.now();
      this.visible = true;
      this.pageVisible = document.visibilityState !== 'hidden';
      this.lost = false;

      this.bindListeners();
      this.resize();
      this.wake();
    }

    makeTarget(width, height) {
      const gl = this.gl;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { texture, framebuffer };
    }

    dropField() {
      const gl = this.gl;
      this.field.targets.forEach(target => {
        gl.deleteTexture(target.texture);
        gl.deleteFramebuffer(target.framebuffer);
      });
      this.field.targets = [];
      this.field.width = 0;
      this.field.height = 0;
      this.field.energy = 0;
    }

    resize() {
      const gl = this.gl;
      const s = this.settings;
      const cssWidth = Math.max(1, window.innerWidth);
      const cssHeight = Math.max(1, window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, s.maxRatio);
      const budget = Math.ceil(Math.sqrt((cssWidth * cssHeight * dpr * dpr) / PIXEL_BUDGET) - 0.05);
      const device = Math.max(s.pixelSize > 0 ? Math.round(s.pixelSize * dpr) : 1, budget, 1);
      const width = Math.max(1, Math.ceil((cssWidth * dpr) / device));
      const height = Math.max(1, Math.ceil((cssHeight * dpr) / device));
      const crt = s.crt > 0;
      const canvasWidth = crt ? width * device : width;
      const canvasHeight = crt ? height * device : height;

      if (this.canvas.width !== canvasWidth || this.canvas.height !== canvasHeight) {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
      }
      this.canvas.style.width = `${(width * device) / dpr}px`;
      this.canvas.style.height = `${(height * device) / dpr}px`;
      this.canvas.style.imageRendering = !crt && s.pixelSize > 0 && device >= 2 ? 'pixelated' : 'auto';

      if (crt && (this.paintTarget.width !== width || this.paintTarget.height !== height)) {
        gl.bindTexture(gl.TEXTURE_2D, this.paintTarget.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.paintTarget.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.paintTarget.texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.paintTarget.width = width;
        this.paintTarget.height = height;
      }

      this.view.cssWidth = cssWidth;
      this.view.cssHeight = cssHeight;
      this.view.block = device / dpr;
      this.view.device = device;
      this.view.width = width;
      this.view.height = height;
      this.view.crt = crt;

      if (!this.fieldProgram) return;
      const fieldWidth = clamp(Math.ceil(cssWidth / FIELD_SCALE), 8, 320);
      const fieldHeight = clamp(Math.ceil(cssHeight / FIELD_SCALE), 8, 320);
      if (fieldWidth === this.field.width && fieldHeight === this.field.height) return;
      this.dropField();
      this.field.width = fieldWidth;
      this.field.height = fieldHeight;
      this.field.targets = [this.makeTarget(fieldWidth, fieldHeight), this.makeTarget(fieldWidth, fieldHeight)];
    }

    stir(fromX, fromY, toX, toY, pushX, pushY, decay) {
      if (!this.fieldProgram) return;
      const gl = this.gl;
      const [read, write] = this.field.targets;
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
      gl.viewport(0, 0, this.field.width, this.field.height);
      gl.useProgram(this.fieldProgram.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read.texture);
      const u = this.fieldProgram.uniforms;
      gl.uniform1i(u.uPrev, 0);
      gl.uniform2f(u.uSize, this.field.width, this.field.height);
      gl.uniform2f(u.uCss, this.view.cssWidth, this.view.cssHeight);
      gl.uniform2f(u.uFrom, fromX, fromY);
      gl.uniform2f(u.uTo, toX, toY);
      gl.uniform2f(u.uPush, pushX, pushY);
      gl.uniform1f(u.uRadius, STIR_RADIUS);
      gl.uniform1f(u.uDecay, decay);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.field.targets = [write, read];
    }

    frame(now) {
      this.raf = 0;
      if (this.lost) return;
      const gl = this.gl;
      const s = this.settings;
      const dt = clamp((now - this.last) / 1000 || 0, 0, 0.05);
      this.last = Math.max(this.last, now);
      const pace = this.reduced ? 0.2 : 1;
      this.flow += dt * s.speed * 7 * pace;
      this.spin += dt * s.rotation * 0.2 * pace;
      if (this.opening < 1) this.opening = Math.min(1, this.opening + dt / 2.2);

      const tracking = s.mouse && this.pointer.inside;
      const steerTarget = tracking ? (this.pointer.x / this.view.cssWidth - 0.5) * 0.35 * s.strength : 0;
      this.steer.value += (steerTarget - this.steer.value) * (1 - Math.exp(-dt / 0.8));

      gl.bindVertexArray(this.vao);
      if (this.fieldProgram && this.field.targets.length) {
        const dx = this.pointer.x - this.pointer.lastX;
        const dy = this.pointer.y - this.pointer.lastY;
        const moved = tracking && this.pointer.ready && (dx !== 0 || dy !== 0);
        const decay = Math.exp(-dt / 1.6);
        if (moved || this.field.energy > 0.05) {
          const amount = 0.85 * s.strength * (this.reduced ? 0.4 : 1);
          const travel = moved ? Math.hypot(dx, dy) * amount : 0;
          const steps = Math.max(1, Math.ceil(travel / (STIR_RADIUS * 0.3)));
          for (let step = 0; step < steps; step++) {
            const a = step / steps;
            const b = (step + 1) / steps;
            this.stir(
              this.pointer.lastX + dx * a,
              this.pointer.lastY + dy * a,
              this.pointer.lastX + dx * b,
              this.pointer.lastY + dy * b,
              moved ? dx * (b - a) * amount : 0,
              moved ? dy * (b - a) * amount : 0,
              step === steps - 1 ? decay : 1
            );
          }
          this.field.energy = this.field.energy * decay + travel;
          if (this.field.energy <= 0.05) {
            this.field.targets.forEach(target => {
              gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
              gl.clearColor(0, 0, 0, 0);
              gl.clear(gl.COLOR_BUFFER_BIT);
            });
          }
        }
      }
      this.pointer.lastX = this.pointer.x;
      this.pointer.lastY = this.pointer.y;

      for (let index = this.twirls.length - 1; index >= 0; index--) {
        this.twirls[index].age += dt;
        if (this.twirls[index].age >= 3.2) this.twirls.splice(index, 1);
      }
      this.twirlData.fill(0);
      this.twirls.forEach((twirl, index) => {
        const t = twirl.age;
        const rise = smoother(t / 0.25);
        const fall = 1 - smoother((t - 0.25) / 2.95);
        this.twirlData[index * 4] = twirl.x;
        this.twirlData[index * 4 + 1] = twirl.y;
        this.twirlData[index * 4 + 2] = twirl.direction * 1.9 * rise * fall;
        this.twirlData[index * 4 + 3] = 150 * (1 + 0.6 * smoother(t / 3.2));
      });

      const eased = 1 - Math.pow(1 - this.opening, 3);
      const unwind = 1 - eased;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.view.crt ? this.paintTarget.framebuffer : null);
      gl.viewport(0, 0, this.view.width, this.view.height);
      gl.useProgram(this.paintProgram.program);
      const u = this.paintProgram.uniforms;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.field.targets.length ? this.field.targets[0].texture : null);
      gl.uniform1i(u.uField, 0);
      gl.uniform1f(u.uFieldOn, this.field.targets.length && this.field.energy > 0.05 ? 1 : 0);
      gl.uniform2f(u.uCss, this.view.cssWidth, this.view.cssHeight);
      gl.uniform2f(u.uCanvas, this.view.width, this.view.height);
      gl.uniform1f(u.uBlock, this.view.block);
      gl.uniform1f(u.uFlow, this.flow);
      gl.uniform1f(u.uSpin, -0.4 + this.spin + this.steer.value + 2.6 * unwind * unwind);
      gl.uniform2f(u.uOffset, s.offset[0], s.offset[1]);
      gl.uniform3f(u.uColor1, s.color1[0], s.color1[1], s.color1[2]);
      gl.uniform3f(u.uColor2, s.color2[0], s.color2[1], s.color2[2]);
      gl.uniform3f(u.uColor3, s.color3[0], s.color3[1], s.color3[2]);
      gl.uniform1f(u.uContrast, s.contrast);
      gl.uniform1f(u.uLighting, s.lighting);
      gl.uniform1f(u.uSwirl, Math.min(1, s.swirl + 0.55 * unwind));
      gl.uniform1f(u.uScale, s.scale);
      gl.uniform1i(u.uDetail, s.detail);
      gl.uniform4fv(u.uTwirls, this.twirlData);
      gl.uniform1f(u.uReveal, smoother(this.opening / 0.45));
      gl.uniform1f(u.uLight, s.light ? 1 : 0);
      gl.uniform1f(u.uOpacity, s.opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (this.view.crt) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.useProgram(this.screenProgram.program);
        const v = this.screenProgram.uniforms;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.paintTarget.texture);
        gl.uniform1i(v.uPaint, 0);
        gl.uniform2f(v.uCanvas, this.canvas.width, this.canvas.height);
        gl.uniform2f(v.uSource, this.view.width, this.view.height);
        gl.uniform1f(v.uDevice, this.view.device);
        gl.uniform1f(v.uCrt, s.crt);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      const settling = Math.abs(steerTarget - this.steer.value) > 0.0005 || this.field.energy > 0.05 || this.twirls.length > 0;
      const busy = s.speed > 0 || s.rotation !== 0 || this.opening < 1 || settling;
      if (busy && this.visible && this.pageVisible) this.raf = requestAnimationFrame(t => this.frame(t));
    }

    wake() {
      if (this.raf || this.lost || !this.visible || !this.pageVisible) return;
      this.last = performance.now();
      this.raf = requestAnimationFrame(t => this.frame(t));
    }

    bindListeners() {
      window.addEventListener('resize', () => {
        this.resize();
        this.wake();
      });

      const locate = event => {
        return {
          x: event.clientX,
          y: event.clientY,
          inside: true
        };
      };

      window.addEventListener('pointermove', event => {
        const spot = locate(event);
        if (!this.pointer.ready || !this.pointer.inside) {
          this.pointer.lastX = spot.x;
          this.pointer.lastY = spot.y;
        }
        this.pointer.vx = spot.x - this.pointer.x;
        this.pointer.x = spot.x;
        this.pointer.y = spot.y;
        this.pointer.inside = spot.inside;
        this.pointer.ready = true;
        this.wake();
      }, { passive: true });

      window.addEventListener('pointerdown', event => {
        const s = this.settings;
        if (!s.clickSwirl || this.reduced) return;
        const spot = locate(event);
        this.twirls.push({ x: spot.x, y: spot.y, age: 0, direction: this.pointer.vx < 0 ? 1 : -1 });
        if (this.twirls.length > MAX_TWIRLS) this.twirls.shift();
        this.wake();
      }, { passive: true });
    }

    setColors(c1, c2, c3) {
      if (c1) this.settings.color1 = parseColor(c1) || this.settings.color1;
      if (c2) this.settings.color2 = parseColor(c2) || this.settings.color2;
      if (c3) this.settings.color3 = parseColor(c3) || this.settings.color3;
      this.wake();
    }

    setPreset(name) {
      if (name === 'balatro') {
        // Live Vivid WebGL Liquid Swirl - Exact React-Bits Balatro configuration
        this.setColors('#DE443B', '#006BB4', '#162325');
        this.settings.contrast = 3.5;
        this.settings.swirl = 0.25;
        this.settings.speed = 1.0;
        this.settings.rotation = 0.0;
        this.settings.scale = 1.0;
        this.settings.detail = 5;
        this.settings.lighting = 0.4;
        this.settings.pixelSize = 1.5;
        this.settings.mouseStrength = 1.0;
        this.settings.clickSwirl = true;
        this.settings.light = false;
        this.settings.crt = 0.0;
      } else if (name === 'emerald') {
        // Deep Velvet Emerald Atmosphere
        this.setColors('#02140c', '#0f3a24', '#010805');
        this.settings.contrast = 2.8;
        this.settings.swirl = 0.22;
        this.settings.speed = 0.4;
        this.settings.lighting = 0.35;
        this.settings.mouseStrength = 1.0;
      } else if (name === 'olive') {
        // Rich Tactical Olive Atmosphere
        this.setColors('#1a422f', '#2d6a4a', '#06160c');
        this.settings.contrast = 3.2;
        this.settings.swirl = 0.35;
        this.settings.speed = 0.6;
        this.settings.lighting = 0.4;
        this.settings.mouseStrength = 1.1;
      } else if (name === 'cream') {
        // Warm Cream Contrast Atmosphere
        this.setColors('#f3ebd6', '#2a5a3f', '#06160c');
        this.settings.contrast = 3.6;
        this.settings.swirl = 0.3;
        this.settings.speed = 0.5;
        this.settings.lighting = 0.45;
        this.settings.mouseStrength = 1.0;
      }
      this.wake();
    }
  }

  global.Balatro = Balatro;
})(window);
