/**
 * StaggeredMenu Component (Exact React-Bits Implementation)
 * Features GSAP timelines, rolling text 'Menu' <-> 'Close', rotating plus-to-cross icon,
 * pre-layer curtains, staggered item reveals, and numbering counters.
 */

(function (global) {
  'use strict';

  class StaggeredMenu {
    constructor(options = {}) {
      this.options = Object.assign({
        position: 'right',
        colors: ['#02110c', '#0a2318', '#143827', '#1a422f'],
        items: [],
        socialItems: [],
        displaySocials: true,
        displayItemNumbering: true,
        logoUrl: 'assets/logo-white.png',
        menuButtonColor: '#ffffff',
        openMenuButtonColor: '#ffffff',
        accentColor: '#59d499',
        changeMenuColorOnOpen: true,
        isFixed: true,
        closeOnClickAway: true,
        onMenuOpen: () => {},
        onMenuClose: () => {}
      }, options);

      this.open = false;
      this.busy = false;
      this.render();
      this.initGsap();
    }

    render() {
      const existing = document.getElementById('staggeredMenuRoot');
      if (existing) existing.remove();

      const wrapper = document.createElement('div');
      wrapper.id = 'staggeredMenuRoot';
      wrapper.className = `staggered-menu-wrapper fixed-wrapper ${this.options.position === 'left' ? 'pos-left' : 'pos-right'}`;
      wrapper.setAttribute('data-position', this.options.position);
      if (this.options.accentColor) {
        wrapper.style.setProperty('--sm-accent', this.options.accentColor);
      }

      // Prelayers with emerald palette
      const prelayersHtml = (this.options.colors && this.options.colors.length ? this.options.colors.slice(0, 4) : ['#02110c', '#0a2318', '#143827', '#1a422f'])
        .map(c => `<div class="sm-prelayer" style="background: ${c}"></div>`)
        .join('');

      // Items with explicit right-aligned number element
      const itemsHtml = this.options.items.map((it, idx) => `
        <li class="sm-panel-itemWrap">
          <a class="sm-panel-item" href="${it.link || '#'}" data-index="${idx + 1}" data-target="${it.target || ''}">
            <span class="sm-panel-itemLabel">${it.label}</span>
            <span class="sm-panel-number" aria-hidden="true">${String(idx + 1).padStart(2, '0')}</span>
          </a>
        </li>
      `).join('');

      // Socials
      const socialsHtml = this.options.displaySocials && this.options.socialItems.length > 0 ? `
        <div class="sm-socials" aria-label="Social links">
          <h3 class="sm-socials-title">Protocol Network</h3>
          <ul class="sm-socials-list" role="list">
            ${this.options.socialItems.map(s => `
              <li class="sm-socials-item">
                <a href="${s.link}" target="_blank" rel="noopener noreferrer" class="sm-socials-link">
                  ${s.label}
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : '';

      // Check if trigger button is already embedded in the header
      const existingToggleBtn = document.getElementById('smToggleBtn');

      wrapper.innerHTML = `
        <div class="sm-prelayers" id="smPrelayers" aria-hidden="true">
          ${prelayersHtml}
        </div>

        ${existingToggleBtn ? '' : `
        <header class="staggered-menu-header" aria-label="Main navigation header">
          <div class="sm-logo" aria-label="Logo">
            <img
              src="${this.options.logoUrl}"
              alt="AXON Logo"
              class="sm-logo-img"
              draggable="false"
            />
          </div>
          <button
            id="smToggleBtn"
            class="sm-toggle"
            aria-label="Open menu"
            type="button"
          >
            <span class="sm-toggle-textWrap" aria-hidden="true">
              <span class="sm-toggle-textInner" id="smToggleTextInner">
                <span class="sm-toggle-line">Menu</span>
              </span>
            </span>
            <span class="sm-icon" id="smToggleIcon" aria-hidden="true">
              <span class="sm-icon-line" id="plusH"></span>
              <span class="sm-icon-line sm-icon-line-v" id="plusV"></span>
            </span>
          </button>
        </header>
        `}

        <aside id="staggeredMenuPanel" class="staggered-menu-panel" aria-hidden="true">
          <div class="sm-panel-top-bar">
            <span class="sm-panel-badge">AXON // REGISTRY</span>
            <button class="sm-panel-close-btn" id="smPanelCloseBtn" type="button" aria-label="Close menu">
              <span>Close</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="sm-panel-inner">
            <ul class="sm-panel-list" role="list" ${this.options.displayItemNumbering ? 'data-numbering="true"' : ''}>
              ${itemsHtml}
            </ul>

            <!-- Cockpit Preferences (Atmosphere & Typography Moved from Dashboard) -->
            <div class="sm-preferences-box">
              <div class="sm-pref-header-row">
                <span class="sm-pref-badge">COCKPIT PREFERENCES</span>
              </div>
              <div class="sm-pref-item">
                <span class="sm-pref-label">Atmosphere Palette:</span>
                <div class="luxury-swatches-strip sm-swatches">
                  <button type="button" class="swatch-capsule active" data-color="emerald" title="Dark Emerald Atmosphere">
                    <span class="swatch-pill-indicator emerald"></span>
                    <span class="swatch-text">Dark Emerald</span>
                  </button>
                  <button type="button" class="swatch-capsule" data-color="olive" title="Olive Green Accent">
                    <span class="swatch-pill-indicator olive"></span>
                    <span class="swatch-text">Olive Green</span>
                  </button>
                  <button type="button" class="swatch-capsule" data-color="cream" title="Cream Beige High-Contrast">
                    <span class="swatch-pill-indicator cream"></span>
                    <span class="swatch-text">Cream Beige</span>
                  </button>
                  <button type="button" class="swatch-capsule" data-color="balatro" title="Liquid WebGL Shader">
                    <span class="swatch-pill-indicator balatro"></span>
                    <span class="swatch-text">Liquid Shader</span>
                  </button>
                </div>
              </div>

              <div class="sm-pref-item">
                <span class="sm-pref-label">Typography System:</span>
                <div class="font-styles-picker sm-fonts">
                  <button type="button" class="font-chip-btn active" data-theme="luxury">Quiet Luxury</button>
                  <button type="button" class="font-chip-btn" data-theme="avantgarde">Avant-Garde</button>
                  <button type="button" class="font-chip-btn" data-theme="cybernetic">Dot-Matrix</button>
                  <button type="button" class="font-chip-btn" data-theme="swiss">Swiss Tech</button>
                </div>
              </div>
            </div>

            ${socialsHtml}
          </div>
        </aside>
      `;

      document.body.appendChild(wrapper);

      if (typeof window.initThemeControls === 'function') {
        window.initThemeControls();
      }

      this.wrapper = wrapper;
      this.panel = wrapper.querySelector('#staggeredMenuPanel');
      this.preContainer = wrapper.querySelector('#smPrelayers');
      this.preLayers = Array.from(wrapper.querySelectorAll('.sm-prelayer'));
      this.toggleBtn = existingToggleBtn || wrapper.querySelector('#smToggleBtn');
      this.textInner = document.getElementById('smToggleTextInner') || wrapper.querySelector('#smToggleTextInner');
      this.icon = document.getElementById('smToggleIcon') || wrapper.querySelector('#smToggleIcon');
      this.plusH = document.getElementById('plusH') || wrapper.querySelector('#plusH');
      this.plusV = document.getElementById('plusV') || wrapper.querySelector('#plusV');
      this.navLinks = wrapper.querySelectorAll('.sm-panel-item');

      const panelCloseBtn = wrapper.querySelector('#smPanelCloseBtn');
      if (panelCloseBtn) {
        panelCloseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.close();
        });
      }
    }

    initGsap() {
      if (typeof gsap === 'undefined') return;

      const offscreen = this.options.position === 'left' ? -100 : 100;
      gsap.set([this.panel, ...this.preLayers], { xPercent: offscreen, opacity: 1 });
      if (this.preContainer) gsap.set(this.preContainer, { xPercent: 0, opacity: 1 });
      gsap.set(this.plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(this.plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(this.icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(this.textInner, { yPercent: 0 });
      gsap.set(this.toggleBtn, { color: this.options.menuButtonColor });

      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      if (this.options.closeOnClickAway) {
        document.addEventListener('mousedown', (e) => {
          if (!this.open) return;
          if (this.panel && !this.panel.contains(e.target) && this.toggleBtn && !this.toggleBtn.contains(e.target)) {
            this.close();
          }
        });
      }

      this.navLinks.forEach((link, idx) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const itemDef = this.options.items[idx];
          if (itemDef && typeof itemDef.onClick === 'function') {
            itemDef.onClick();
          }
          this.close();
        });
      });
    }

    buildOpenTimeline() {
      if (typeof gsap === 'undefined') return null;
      const offscreen = this.options.position === 'left' ? -100 : 100;

      const itemEls = Array.from(this.panel.querySelectorAll('.sm-panel-itemLabel'));
      const numberEls = Array.from(this.panel.querySelectorAll('.sm-panel-number'));
      const socialTitle = this.panel.querySelector('.sm-socials-title');
      const socialLinks = Array.from(this.panel.querySelectorAll('.sm-socials-link'));

      if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
      if (numberEls.length) gsap.set(numberEls, { opacity: 0, x: 20 });
      if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
      if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

      const tl = gsap.timeline({ paused: true });

      this.preLayers.forEach((layer, i) => {
        tl.fromTo(layer, { xPercent: offscreen }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
      });

      const lastTime = this.preLayers.length ? (this.preLayers.length - 1) * 0.07 : 0;
      const panelInsertTime = lastTime + (this.preLayers.length ? 0.08 : 0);
      const panelDuration = 0.65;

      tl.fromTo(this.panel, { xPercent: offscreen }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime);

      if (itemEls.length) {
        const itemsStartRatio = 0.15;
        const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
        tl.to(itemEls, {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        }, itemsStart);

        if (numberEls.length) {
          tl.to(numberEls, {
            duration: 0.55,
            ease: 'power2.out',
            opacity: 1,
            x: 0,
            stagger: { each: 0.08, from: 'start' }
          }, itemsStart + 0.08);
        }
      }

      if (socialTitle || socialLinks.length) {
        const socialsStart = panelInsertTime + panelDuration * 0.4;
        if (socialTitle) {
          tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);
        }
        if (socialLinks.length) {
          tl.to(socialLinks, {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' }
          }, socialsStart + 0.04);
        }
      }

      return tl;
    }

    animateText(opening) {
      if (typeof gsap === 'undefined' || !this.textInner) return;
      const current = opening ? 'Menu' : 'Close';
      const target = opening ? 'Close' : 'Menu';
      const seq = [current, target === 'Close' ? 'Menu' : 'Close', current, target];
      this.textInner.innerHTML = seq.map(s => `<span class="sm-toggle-line">${s}</span>`).join('');

      gsap.set(this.textInner, { yPercent: 0 });
      const finalShift = ((seq.length - 1) / seq.length) * 100;
      gsap.to(this.textInner, {
        yPercent: -finalShift,
        duration: 0.65,
        ease: 'power4.out'
      });
    }

    animateIcon(opening) {
      if (typeof gsap === 'undefined' || !this.icon) return;
      if (opening) {
        gsap.to(this.icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
      } else {
        gsap.to(this.icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
      }
    }

    openMenu() {
      if (this.busy) return;
      this.busy = true;
      this.open = true;
      this.wrapper.setAttribute('data-open', 'true');
      this.wrapper.style.pointerEvents = 'auto';

      const tl = this.buildOpenTimeline();
      if (tl) {
        tl.eventCallback('onComplete', () => { this.busy = false; });
        tl.play(0);
      } else {
        this.busy = false;
      }

      this.animateIcon(true);
      this.animateText(true);
      if (this.options.changeMenuColorOnOpen && typeof gsap !== 'undefined') {
        gsap.to(this.toggleBtn, { color: this.options.openMenuButtonColor, delay: 0.18, duration: 0.3 });
      }
      this.options.onMenuOpen?.();
    }

    closeMenu() {
      if (!this.open) return;
      this.open = false;
      this.wrapper.removeAttribute('data-open');

      if (typeof gsap !== 'undefined') {
        const offscreen = this.options.position === 'left' ? -100 : 100;
        gsap.to([...this.preLayers, this.panel], {
          xPercent: offscreen,
          duration: 0.32,
          ease: 'power3.in',
          overwrite: 'auto',
          onComplete: () => {
            this.wrapper.style.pointerEvents = 'none';
            this.busy = false;
          }
        });
      }

      this.animateIcon(false);
      this.animateText(false);
      if (this.options.changeMenuColorOnOpen && typeof gsap !== 'undefined') {
        gsap.to(this.toggleBtn, { color: this.options.menuButtonColor, duration: 0.3 });
      }
      this.options.onMenuClose?.();
    }

    toggle() {
      if (this.open) this.closeMenu();
      else this.openMenu();
    }

    close() {
      this.closeMenu();
    }
  }

  global.StaggeredMenu = StaggeredMenu;
})(window);
