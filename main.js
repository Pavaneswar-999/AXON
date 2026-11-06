/**
 * AXON // REGISTRY v1.0
 * Zero-Knowledge Decentralized Certificate Registry
 * Cockpit Core Controller & Client-Side Cryptographic Engine
 * "Transmit proof. Verify across the network."
 */

(function () {
  'use strict';

  // ==============================================================================
  // 1. SOUND SYNTHESIZER (WEB AUDIO API TACTILE FEEDBACK)
  // ==============================================================================
  let audioCtx = null;
  let isSoundEnabled = false; // Start muted, play on click
  let ambientAudio = null;

  function getAmbientAudio() {
    const el = document.getElementById('ambientAudioPlayer');
    if (el) {
      el.loop = true;
      el.volume = 0.7;
      return el;
    }
    if (!ambientAudio && typeof Audio !== 'undefined') {
      ambientAudio = new Audio('assets/ambient.mp3?v=axon4.0');
      ambientAudio.loop = true;
      ambientAudio.volume = 0.7;
      ambientAudio.preload = 'auto';
    }
    return ambientAudio;
  }

  function startPeacefulAmbient() {
    try {
      const audio = getAmbientAudio();
      if (audio) {
        audio.volume = 0.7;
        if (audio.readyState === 0) {
          audio.load();
        }
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('[AXON AUDIO] Ambient music track playing successfully');
          }).catch(err => {
            console.warn('[AXON AUDIO] Audio playback notice:', err);
            try {
              if (!ambientAudio) {
                ambientAudio = new Audio('assets/ambient.mp3?v=axon4.0');
                ambientAudio.loop = true;
                ambientAudio.volume = 0.7;
              }
              ambientAudio.play().then(() => {
                console.log('[AXON AUDIO] Fallback Audio instance playing');
              }).catch(e2 => {
                console.warn('[AXON AUDIO] Fallback audio notice:', e2);
              });
            } catch (e3) {
              console.error(e3);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  function stopPeacefulAmbient() {
    try {
      const el = document.getElementById('ambientAudioPlayer');
      if (el) el.pause();
      if (ambientAudio) ambientAudio.pause();
      console.log('[AXON AUDIO] All ambient audio paused');
    } catch (e) {
      console.warn('Audio pause error:', e);
    }
  }

  function playTactileClick() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  function playSuccessChime() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Emerald harmonic chord)
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.07);
        
        const startTime = audioCtx.currentTime + idx * 0.07;
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch (e) {}
  }

  function playRevokeAlert() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.setValueAtTime(120, audioCtx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);
    } catch (e) {}
  }

  // ==============================================================================
  // 2. RAYCAST FLOATING TOAST SYSTEM (NO BROWSER POPUPS)
  // ==============================================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-pill ${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#59d499" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff6363" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    } else {
      iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  }

  // ==============================================================================
  // 3. CRYPTOGRAPHIC ENGINE (KECCAK-256 & COMMUTATIVE SORTED MERKLE TREES)
  // ==============================================================================
  function getKeccak() {
    if (typeof window !== 'undefined' && typeof window.keccak256 === 'function') {
      return window.keccak256;
    }
    if (typeof keccak256 === 'function') {
      return keccak256;
    }
    throw new Error('Keccak-256 cryptographic module is not loaded');
  }

  function hexToBytes(hex) {
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
    const len = clean.length / 2;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  function bytesToHex(bytes) {
    return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function generateCryptoSalt() {
    const randomBytes = new Uint8Array(32);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randomBytes);
    } else {
      for (let i = 0; i < 32; i++) randomBytes[i] = Math.floor(Math.random() * 256);
    }
    return bytesToHex(randomBytes);
  }

  /**
   * Exact leaf computation matching Solidity CertRegistry.sol:
   * keccak256(abi.encodePacked(certId, recipientIdentifier, courseDegree, institutionDid, salt))
   */
  function computeLeaf(record, saltHex) {
    const hasher = getKeccak();
    const encoder = new TextEncoder();
    const strBytes = encoder.encode(
      record.certId + record.recipientIdentifier + record.courseDegree + record.institutionDid
    );
    const saltBytes = hexToBytes(saltHex);
    
    const packed = new Uint8Array(strBytes.length + saltBytes.length);
    packed.set(strBytes, 0);
    packed.set(saltBytes, strBytes.length);

    return '0x' + hasher(packed);
  }

  /**
   * Commutative Keccak256 matching OpenZeppelin MerkleProof.sol:
   * a < b ? keccak256(a + b) : keccak256(b + a)
   */
  function hashPair(aHex, bHex) {
    const hasher = getKeccak();
    const aClean = aHex.startsWith('0x') ? aHex.slice(2).toLowerCase() : aHex.toLowerCase();
    const bClean = bHex.startsWith('0x') ? bHex.slice(2).toLowerCase() : bHex.toLowerCase();

    let first = aClean;
    let second = bClean;

    if (aClean > bClean) {
      first = bClean;
      second = aClean;
    }

    const firstBytes = hexToBytes(first);
    const secondBytes = hexToBytes(second);
    const combined = new Uint8Array(firstBytes.length + secondBytes.length);
    combined.set(firstBytes, 0);
    combined.set(secondBytes, firstBytes.length);

    return '0x' + hasher(combined);
  }

  /**
   * Builds a binary Merkle Tree and returns root and individual proofs
   */
  function buildBatchMerkleTree(items) {
    if (!items || items.length === 0) {
      throw new Error('Cannot construct Merkle tree with 0 leaves');
    }

    const leaves = items.map(item => ({
      ...item,
      leaf: computeLeaf(item.record, item.salt)
    }));

    let currentLevel = leaves.map(l => l.leaf);
    const levels = [currentLevel];

    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          nextLevel.push(hashPair(currentLevel[i], currentLevel[i + 1]));
        } else {
          nextLevel.push(hashPair(currentLevel[i], currentLevel[i]));
        }
      }
      currentLevel = nextLevel;
      levels.push(currentLevel);
    }

    const root = levels[levels.length - 1][0];

    const passes = leaves.map((leafObj, leafIdx) => {
      const proof = [];
      let idx = leafIdx;

      for (let i = 0; i < levels.length - 1; i++) {
        const level = levels[i];
        const isRightNode = idx % 2 === 1;
        const pairIdx = isRightNode ? idx - 1 : idx + 1;

        if (pairIdx < level.length) {
          proof.push(level[pairIdx]);
        } else {
          proof.push(level[idx]);
        }
        idx = Math.floor(idx / 2);
      }

      return {
        axonVersion: '1.0.0',
        leaf: leafObj.leaf,
        salt: leafObj.salt,
        merkleProof: proof,
        root: root,
        record: leafObj.record
      };
    });

    return { root, passes, leaves, levels };
  }

  function verifyProof(leaf, proof, root) {
    let computed = leaf;
    for (let i = 0; i < proof.length; i++) {
      computed = hashPair(computed, proof[i]);
    }
    return computed.toLowerCase() === root.toLowerCase();
  }

  // ==============================================================================
  // 4. ON-CHAIN STATE REGISTRY (AxonRegistry.sol MIRROR)
  // ==============================================================================
  const registryState = {
    batchRoots: {},
    revokedLeaves: {}
  };

  function contractRegisterBatchRoot(root, ipfsHash) {
    if (registryState.batchRoots[root]) {
      throw new Error('BatchAlreadyExists: Root already anchored on-chain');
    }
    const timestamp = Math.floor(Date.now() / 1000);
    registryState.batchRoots[root] = {
      merkleRoot: root,
      blockTimestamp: timestamp,
      ipfsMetadataHash: ipfsHash,
      active: true
    };
    return { root, timestamp, ipfsHash };
  }

  function contractRevokeCertificate(leafHash, reason) {
    registryState.revokedLeaves[leafHash.toLowerCase()] = {
      isRevoked: true,
      reason: reason || 'Administrative sanction or credential superseded',
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  function contractVerifyCredential(root, leaf, proof) {
    const batch = registryState.batchRoots[root];
    if (!batch || !batch.active) {
      return { isValid: false, isRevoked: false, error: 'BatchNotFound: Merkle root not found in AxonRegistry contract' };
    }

    const rev = registryState.revokedLeaves[leaf.toLowerCase()];
    if (rev && rev.isRevoked) {
      return { isValid: false, isRevoked: true, reason: rev.reason, timestamp: batch.blockTimestamp };
    }

    const isProofValid = verifyProof(leaf, proof, root);
    if (!isProofValid) {
      return { isValid: false, isRevoked: false, error: 'InvalidMerkleProof: Leaf and verification nodes mismatch root' };
    }

    return { isValid: true, isRevoked: false, timestamp: batch.blockTimestamp };
  }

  // ==============================================================================
  // 5. SAMPLE PRELOADED PASSES & SEED DATA
  // ==============================================================================
  let samplePasses = [];

  function initSampleData() {
    const rawRecords = [
      {
        record: {
          certId: 'AXON-MIT-2026-091',
          recipientName: 'Elena Rostova',
          recipientIdentifier: 'DID:mit.edu:id:99812-ER',
          courseDegree: 'M.Sc. Quantum Computing & Zero-Knowledge Systems',
          issueDate: '2026-06-12',
          institutionDid: 'did:web:mit.edu'
        },
        salt: '0x3a91f58b7c42e109d846104c9e830172bf40521e893049581726354819203847'
      },
      {
        record: {
          certId: 'AXON-STANFORD-2026-882',
          recipientName: 'Marcus Vance',
          recipientIdentifier: 'DID:stanford.edu:fellow:882-MV',
          courseDegree: 'Fellowship in Autonomous Systems & Applied Cryptography',
          issueDate: '2026-05-20',
          institutionDid: 'did:web:stanford.edu'
        },
        salt: '0x8f27301c948b52e0491823746591028374651928374650192837465019283746'
      },
      {
        record: {
          certId: 'AXON-OXFORD-2026-441',
          recipientName: 'Sophia Al-Mansoor',
          recipientIdentifier: 'DID:oxford.ac.uk:dphil:441-SM',
          courseDegree: 'D.Phil in Mathematical Logic & Neural Privacy',
          issueDate: '2026-04-15',
          institutionDid: 'did:web:oxford.ac.uk'
        },
        salt: '0x1029384756102938475610293847561029384756102938475610293847561029'
      },
      {
        record: {
          certId: 'AXON-ETHZ-2026-118',
          recipientName: 'Lucas Lindqvist',
          recipientIdentifier: 'DID:ethz.ch:student:772-LL',
          courseDegree: 'Master of Science in Distributed Ledger Engineering',
          issueDate: '2026-03-30',
          institutionDid: 'did:web:ethz.ch'
        },
        salt: '0x99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa'
      }
    ];

    const batch = buildBatchMerkleTree(rawRecords);
    samplePasses = batch.passes;

    contractRegisterBatchRoot(batch.root, 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco');

    // Also anchor the standalone test pass roots
    try {
      contractRegisterBatchRoot('0x5b38aa4d69bc539a2b851b22e03254dd9d18e5b61f2fbb1b9319fcb15093e42a', 'QmElenaRostovaVerifiedMerkleRootIPFS2026');
    } catch (e) {}
    try {
      contractRegisterBatchRoot('0x5458639a9f9117fecdfa672b581cb144974d65e24e55651b57739fdd2634af3e', 'QmEvelynReedDoctorateProofAnchorIPFS2026');
    } catch (e) {}

    // Revoke Sophia Al-Mansoor's pass to demonstrate revocation detection
    const sophiaLeaf = samplePasses[2].leaf;
    contractRevokeCertificate(sophiaLeaf, 'Credential superseded by postdoctoral fellowship issuance');
  }

  // ==============================================================================
  // 6. DOM ELEMENTS & NAVIGATION
  // ==============================================================================
  let currentActivePass = null;
  let currentVerificationResult = null;

  const navButtons = document.querySelectorAll('.nav-dock-btn');
  const viewSections = {
    verify: document.getElementById('view-verify'),
    issuer: document.getElementById('view-issuer'),
    audit: document.getElementById('view-audit')
  };

  function switchView(targetView) {
    playTactileClick();
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === targetView);
    });

    Object.keys(viewSections).forEach(key => {
      if (viewSections[key]) {
        viewSections[key].style.display = (key === targetView) ? 'flex' : 'none';
      }
    });

    const activeText = document.getElementById('activeSectionText');
    if (activeText) {
      if (targetView === 'verify') activeText.innerText = 'Verify Pass';
      else if (targetView === 'issuer') activeText.innerText = 'Batch Issuer Portal';
      else if (targetView === 'audit') activeText.innerText = 'Audit Trail & Explorer';
    }

    if (targetView === 'audit') {
      renderAuditLedger();
    }
  }
  window.switchView = switchView;

  const dropzone = document.getElementById('verifyDropzone');
  const fileInput = document.getElementById('credentialFileInput');
  const statusBanner = document.getElementById('statusBanner');
  const certContainer = document.getElementById('certContainer');
  const compactBar = document.getElementById('verifyCompactBar');
  const compactTitle = document.getElementById('compactPassTitle');
  const compactStatus = document.getElementById('compactStatusPill');

  window.copyTextToClipboard = function(text, label) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label || 'Hash'} copied to clipboard`, 'info');
      playTactileClick();
    }
  };

  function resetVerificationView() {
    currentActivePass = null;
    currentVerificationResult = null;
    if (compactBar) compactBar.style.display = 'none';
    if (certContainer) {
      certContainer.style.display = 'none';
      certContainer.innerHTML = '';
    }
    if (statusBanner) statusBanner.style.display = 'none';
    if (dropzone) dropzone.style.display = 'block';
  }

  // ==============================================================================
  // 7. 3D TILT CERTIFICATE RENDERER
  // ==============================================================================
  function renderCertificate(payload, verifyResult) {
    currentActivePass = payload;
    currentVerificationResult = verifyResult;

    if (!certContainer) return;
    certContainer.style.display = 'block';

    const isValid = verifyResult && verifyResult.isValid && !verifyResult.isRevoked;
    const isRevoked = verifyResult && verifyResult.isRevoked;
    const timestampStr = verifyResult && verifyResult.timestamp 
      ? new Date(verifyResult.timestamp * 1000).toUTCString()
      : new Date().toUTCString();

    // Condense view: hide large dropzone and show sleek compact verification toolbar
    if (dropzone) dropzone.style.display = 'none';
    if (compactBar) {
      compactBar.style.display = 'flex';
      if (compactTitle) {
        compactTitle.innerText = payload.record ? payload.record.recipientName : 'Active Pass';
      }
      if (compactStatus) {
        compactStatus.className = `compact-pass-status-pill ${isValid ? 'verified' : isRevoked ? 'revoked' : ''}`;
        compactStatus.innerText = isValid ? 'Verified ✓' : isRevoked ? 'Revoked ✗' : 'Invalid Proof';
      }
    }

    certContainer.innerHTML = `
      <div class="certificate-perspective-wrap" id="certPerspectiveWrap">
        <div class="premium-cert-card raycast-key-card" id="premiumCard">
          <div class="cert-holographic-foil" id="certHoloFoil"></div>
          <div class="silk-ambient-gradient"></div>
          <div class="cert-axon-watermark"></div>

          <!-- Header -->
          <div class="cert-header-row">
            <div class="cert-institution-meta">
              <div class="cert-seal-hexagon">
                <img src="assets/logo-white.webp" alt="Axon Seal" class="cert-seal-icon-img" />
              </div>
              <div>
                <p class="cert-eyebrow">Zero-Knowledge Validated Credential</p>
                <h4 class="cert-institution-name">${escapeHtml(payload.record.institutionDid)}</h4>
              </div>
            </div>

            <div>
              ${isValid ? `
                <span class="cert-status-badge verified">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Proof Valid (O(log N))
                </span>
              ` : isRevoked ? `
                <span class="cert-status-badge revoked">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Revoked on Registry
                </span>
              ` : `
                <span class="cert-status-badge" style="background:#111214; border:1px solid #ff6363; color:#ff6363;">
                  Invalid Proof
                </span>
              `}
            </div>
          </div>

          <!-- Student & Degree Content -->
          <div class="cert-body-content">
            <div class="cert-conferred-label">Conferred To</div>
            <h3 class="cert-student-name">${escapeHtml(payload.record.recipientName)}</h3>
            <p class="cert-recipient-id">${escapeHtml(payload.record.recipientIdentifier)}</p>

            <div class="cert-conferred-label" style="margin-top: 18px;">Conferred Degree / Title</div>
            <p class="cert-degree-title">${escapeHtml(payload.record.courseDegree)}</p>
          </div>

          <!-- Proof Drawer -->
          <div class="cert-proof-drawer">
            <div class="proof-row">
              <span class="proof-label">ROOT HASH:</span>
              <span class="proof-val" title="${payload.root}">${payload.root}</span>
            </div>
            <div class="proof-row">
              <span class="proof-label">LEAF COMMITMENT:</span>
              <span class="proof-val" title="${payload.leaf}">${payload.leaf}</span>
            </div>
            <div class="proof-row">
              <span class="proof-label">PROOF DEPTH:</span>
              <span class="proof-val green-highlight">${payload.merkleProof.length} Verification Nodes (2^${payload.merkleProof.length} Capacity)</span>
            </div>
            <div class="proof-row">
              <span class="proof-label">CHAIN TIMESTAMP:</span>
              <span class="proof-val" style="color: #ffffff;">${timestampStr}</span>
            </div>
            ${isRevoked && verifyResult.reason ? `
              <div class="proof-row" style="margin-top: 4px; border-top: 1px solid rgba(255,99,99,0.2); padding-top: 6px;">
                <span class="proof-label" style="color: #ff6363;">REVOCATION REASON:</span>
                <span class="proof-val" style="color: #ff6363;">${escapeHtml(verifyResult.reason)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Card Actions -->
          <div class="cert-card-actions">
            <button class="btn-cert-secondary" id="btnDownloadPass">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export JSON Pass
            </button>
            <button class="btn-cert-secondary" id="btnCopyLeaf">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy Leaf Hash
            </button>
            <button class="btn-cert-secondary" onclick="window.print()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
          </div>
        </div>
      </div>
    `;

    init3DTilt();

    const btnDownload = document.getElementById('btnDownloadPass');
    if (btnDownload) {
      btnDownload.onclick = () => {
        playTactileClick();
        downloadJsonFile(`${payload.record.certId}.json`, JSON.stringify(payload, null, 2));
        showToast(`Pass exported for ${payload.record.recipientName}`, 'success');
      };
    }

    const btnCopy = document.getElementById('btnCopyLeaf');
    if (btnCopy) {
      btnCopy.onclick = () => {
        playTactileClick();
        navigator.clipboard.writeText(payload.leaf);
        showToast('Leaf hash copied to clipboard', 'info');
        btnCopy.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#59d499" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
        setTimeout(() => {
          btnCopy.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Leaf Hash`;
        }, 1800);
      };
    }
  }

  function init3DTilt() {
    const wrap = document.getElementById('certPerspectiveWrap');
    const card = document.getElementById('premiumCard');
    const holo = document.getElementById('certHoloFoil');
    if (!wrap || !card) return;

    function handleMouseMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = -(y / (rect.height / 2)) * 7;
      const rotY = (x / (rect.width / 2)) * 7;

      card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01, 1.01, 1.01)`;

      if (holo) {
        const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;
        holo.style.background = `radial-gradient(circle at ${mouseXPercent}% ${mouseYPercent}%, rgba(255,255,255,0.18) 0%, rgba(89,212,153,0.12) 35%, transparent 70%)`;
      }
    }

    function handleMouseLeave() {
      card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
      if (holo) {
        holo.style.background = `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(89, 212, 153, 0.08) 50%, transparent 100%)`;
      }
    }

    function handleMouseEnter() {
      card.style.transition = 'transform 0.05s ease-out';
    }

    wrap.onmousemove = handleMouseMove;
    wrap.onmouseleave = handleMouseLeave;
    wrap.onmouseenter = handleMouseEnter;
  }

  // ==============================================================================
  // 8. VERIFICATION HANDLER
  // ==============================================================================
  function verifyPassPayload(payload) {
    if (!payload.leaf || !payload.root || !payload.merkleProof || !payload.record) {
      showStatusBanner('Invalid AXON credential format. Missing cryptographic leaf, root, or proof nodes.', 'error');
      showToast('Validation Error: Invalid credential schema', 'error');
      playRevokeAlert();
      return;
    }

    const res = contractVerifyCredential(payload.root, payload.leaf, payload.merkleProof);

    if (res.isValid) {
      showStatusBanner(`Cryptographic verification confirmed against Merkle root ${payload.root.slice(0, 16)}...`, 'success');
      showToast(`Verified Pass for ${payload.record.recipientName}`, 'success');
      playSuccessChime();
    } else if (res.isRevoked) {
      showStatusBanner(`REVOCATION ALERT: Certificate leaf ${payload.leaf.slice(0, 14)}... has been revoked on-chain. Reason: ${res.reason}`, 'error');
      showToast(`Revocation Alert: Certificate is Revoked`, 'error');
      playRevokeAlert();
    } else {
      showStatusBanner(`Verification Error: ${res.error || 'Proof verification failed.'}`, 'error');
      showToast('Verification Failed: Root mismatch or invalid proof', 'error');
      playRevokeAlert();
    }

    renderCertificate(payload, res);
  }

  function showStatusBanner(msg, type) {
    if (!statusBanner) return;
    statusBanner.style.display = 'flex';
    statusBanner.className = `status-banner ${type}`;
    statusBanner.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
        ${type === 'error' 
          ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' 
          : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
      </svg>
      <span>${escapeHtml(msg)}</span>
    `;
  }

  function handleFile(file) {
    if (!file) return;

    // Check if the file is non-JSON (like an image or PDF)
    const fileName = file.name || '';
    const isImageOrPdf = (file.type && (file.type.includes('image') || file.type.includes('pdf'))) ||
      fileName.endsWith('.pdf') || fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');

    if (isImageOrPdf) {
      showStatusBanner(
        `Non-Cryptographic File Detected (${escapeHtml(fileName)}). Decentralized blockchain verification requires the tamper-proof cryptographic pass (.json) containing the 32-byte Merkle proof branch and recipient salt. Click 'Download Sample Pass' below to test, or create your pass in the Batch Issuer Portal.`,
        'error'
      );
      showToast('Please select a cryptographic pass file (.json)', 'error');
      playRevokeAlert();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        verifyPassPayload(parsed);
      } catch (err) {
        showStatusBanner('Failed to parse JSON file: ' + err.message, 'error');
        showToast('JSON parse error: ' + err.message, 'error');
        playRevokeAlert();
      }
    };
    reader.readAsText(file);
  }

  if (dropzone && fileInput) {
    // Forward any click on dropzone directly to native file input dialog
    dropzone.addEventListener('click', (e) => {
      if (e.target && e.target.closest && e.target.closest('#btnDownloadSamplePass')) {
        return; // Download button handled independently
      }
      fileInput.click();
    });

    const btnBrowse = document.getElementById('btnBrowseDevice');
    if (btnBrowse) {
      btnBrowse.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    const btnDownloadSample = document.getElementById('btnDownloadSamplePass');
    if (btnDownloadSample) {
      btnDownloadSample.addEventListener('click', (e) => {
        e.stopPropagation();
        playTactileClick();
        if (samplePasses && samplePasses.length > 0) {
          downloadJsonFile(`${samplePasses[0].record.certId}.json`, JSON.stringify(samplePasses[0], null, 2));
          showToast(`Sample Pass downloaded to your device! Upload it to verify.`, 'success');
        }
      });
    }

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragging');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('is-dragging');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragging');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    const btnVerifyAnother = document.getElementById('btnVerifyAnother');
    if (btnVerifyAnother) {
      btnVerifyAnother.addEventListener('click', (e) => {
        e.stopPropagation();
        playTactileClick();
        fileInput.click();
      });
    }

    const btnResetCert = document.getElementById('btnResetCert');
    if (btnResetCert) {
      btnResetCert.addEventListener('click', (e) => {
        e.stopPropagation();
        playTactileClick();
        resetVerificationView();
        showToast('Returned to dropzone', 'info');
      });
    }

    // Allow dropping a file anywhere on the verify view
    const verifyViewElem = document.getElementById('view-verify');
    if (verifyViewElem) {
      verifyViewElem.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      verifyViewElem.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      });
    }
  }

  // ==============================================================================
  // 9. BATCH ISSUER CONTROLLER (WITH CSV IMPORT & SAMPLE CSV)
  // ==============================================================================
  let issuerStudents = [
    {
      certId: 'AXON-HARVARD-2026-001',
      recipientName: 'Claire Beauchamp',
      recipientIdentifier: 'DID:harvard.edu:id:7781-CB',
      courseDegree: 'Master in Biomedical Data Science',
      institutionDid: 'did:web:harvard.edu'
    },
    {
      certId: 'AXON-CAMBRIDGE-2026-002',
      recipientName: 'Tariq Al-Fassi',
      recipientIdentifier: 'DID:cam.ac.uk:id:4490-TF',
      courseDegree: 'Ph.D. in High-Assurance Cryptographic Protocols',
      institutionDid: 'did:web:cam.ac.uk'
    },
    {
      certId: 'AXON-BERKELEY-2026-003',
      recipientName: 'Chloe Dupont',
      recipientIdentifier: 'DID:berkeley.edu:id:2201-CD',
      courseDegree: 'B.Sc. in Distributed Systems & Fault Tolerance',
      institutionDid: 'did:web:berkeley.edu'
    },
    {
      certId: 'AXON-TSINGHUA-2026-004',
      recipientName: 'Wei Zhang',
      recipientIdentifier: 'DID:tsinghua.edu.cn:id:8832-WZ',
      courseDegree: 'Master in Quantum Cryptanalysis & Privacy',
      institutionDid: 'did:web:tsinghua.edu.cn'
    }
  ];

  let latestBatchTree = null;

  function renderIssuerTable() {
    const tbody = document.getElementById('issuerTableBody');
    if (!tbody) return;

    tbody.innerHTML = issuerStudents.map((st, i) => `
      <tr>
        <td style="font-family: var(--font-mono); color: var(--color-smoke);">${escapeHtml(st.certId)}</td>
        <td style="font-weight: 500; color: #ffffff;">${escapeHtml(st.recipientName)}</td>
        <td style="font-family: var(--font-mono); font-size: 11px; color: var(--color-ash);">${escapeHtml(st.recipientIdentifier)}</td>
        <td>${escapeHtml(st.courseDegree)}</td>
        <td style="font-family: var(--font-mono); font-size: 11px; color: var(--color-smoke);">${escapeHtml(st.institutionDid)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn-cert-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.instantVerifyStudent(${i})" title="Instant Verify in 3D Card">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#59d499" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Verify
            </button>
            <button class="btn-cert-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.exportSinglePass(${i})" title="Download JSON Pass">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> JSON
            </button>
            <button style="background:transparent; border:none; color:var(--color-coral-pulse); cursor:pointer; padding:4px;" onclick="window.removeStudent(${i})" title="Remove">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    const countElem = document.getElementById('issuerBatchCount');
    if (countElem) countElem.innerText = issuerStudents.length;

    const depthElem = document.getElementById('merkleDepthDisplay');
    if (depthElem) {
      const n = Math.ceil(Math.log2(Math.max(1, issuerStudents.length)));
      const capacity = Math.pow(2, n);
      depthElem.innerText = `2^${n} = ${capacity} Leaves`;
    }
  }

  window.removeStudent = function (idx) {
    playTactileClick();
    issuerStudents.splice(idx, 1);
    renderIssuerTable();
    showToast('Record removed from queue', 'info');
  };

  window.instantVerifyStudent = function (idx) {
    playTactileClick();
    if (!latestBatchTree) {
      // Assemble tree automatically
      const itemsWithSalts = issuerStudents.map(st => ({
        record: st,
        salt: generateCryptoSalt()
      }));
      latestBatchTree = buildBatchMerkleTree(itemsWithSalts);
      // Register root
      try {
        contractRegisterBatchRoot(latestBatchTree.root, 'QmAutoGeneratedBatchIpfsHash' + Date.now());
      } catch (e) {}
    }

    const pass = latestBatchTree.passes[idx];
    if (pass) {
      switchView('verify');
      verifyPassPayload(pass);
    }
  };

  window.exportSinglePass = function (idx) {
    playTactileClick();
    if (!latestBatchTree) {
      const itemsWithSalts = issuerStudents.map(st => ({
        record: st,
        salt: generateCryptoSalt()
      }));
      latestBatchTree = buildBatchMerkleTree(itemsWithSalts);
      try {
        contractRegisterBatchRoot(latestBatchTree.root, 'QmAutoGeneratedBatchIpfsHash' + Date.now());
      } catch (e) {}
    }

    const pass = latestBatchTree.passes[idx];
    if (pass) {
      downloadJsonFile(`${pass.record.certId}.json`, JSON.stringify(pass, null, 2));
      showToast(`Exported pass for ${pass.record.recipientName}`, 'success');
    }
  };

  // CSV Import Parser
  const csvFileInput = document.getElementById('csvFileInput');
  if (csvFileInput) {
    csvFileInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length < 2) {
            showToast('CSV must contain a header and at least one student record', 'error');
            return;
          }

          let addedCount = 0;
          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
            if (parts.length >= 2) {
              issuerStudents.push({
                certId: parts[0] || `AXON-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
                recipientName: parts[1] || 'Anonymous Recipient',
                recipientIdentifier: parts[2] || `DID:axon.net:id:${Math.floor(10000 + Math.random() * 90000)}`,
                courseDegree: parts[3] || 'Accredited Program',
                institutionDid: parts[4] || 'did:web:axon.registry'
              });
              addedCount++;
            }
          }
          renderIssuerTable();
          playSuccessChime();
          showToast(`Imported ${addedCount} student records from CSV`, 'success');
        } catch (err) {
          showToast('Failed to parse CSV: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    };
  }

  // Sample CSV Downloader
  const btnDownloadSampleCsv = document.getElementById('btnDownloadSampleCsv');
  if (btnDownloadSampleCsv) {
    btnDownloadSampleCsv.onclick = () => {
      playTactileClick();
      const csvContent = 
`certId,recipientName,recipientIdentifier,courseDegree,institutionDid
AXON-OXFORD-2026-101,Alexander Wright,DID:oxford.ac.uk:id:AW-992,Ph.D. in Zero-Knowledge Cryptography,did:web:oxford.ac.uk
AXON-STANFORD-2026-102,Kavita Ramanujan,DID:stanford.edu:id:KR-441,Master in Autonomous Agent Architecture,did:web:stanford.edu
AXON-MIT-2026-103,Jean-Paul Sartre,DID:mit.edu:id:JS-882,B.Sc. in Computational Complexity,did:web:mit.edu
AXON-TOKYO-2026-104,Ren Tanaka,DID:u-tokyo.ac.jp:id:RT-551,Master in Post-Quantum Lattice Cryptography,did:web:u-tokyo.ac.jp`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'axon_students_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded axon_students_template.csv', 'info');
    };
  }

  const btnAddRecord = document.getElementById('btnAddRecord');
  if (btnAddRecord) {
    btnAddRecord.onclick = () => {
      playTactileClick();
      const name = document.getElementById('inName').value.trim();
      const id = document.getElementById('inId').value.trim();
      const course = document.getElementById('inCourse').value.trim();
      const inst = document.getElementById('inInst').value.trim();

      if (!name || !course) {
        showToast('Please provide student name and degree title', 'error');
        return;
      }

      issuerStudents.push({
        certId: `AXON-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
        recipientName: name,
        recipientIdentifier: id || `DID:axon.net:id:${Math.floor(10000 + Math.random() * 90000)}`,
        courseDegree: course,
        institutionDid: inst || 'did:web:axon.registry'
      });

      document.getElementById('inName').value = '';
      document.getElementById('inId').value = '';
      document.getElementById('inCourse').value = '';
      document.getElementById('inInst').value = '';

      renderIssuerTable();
      showToast(`Record added for ${name}`, 'success');
    };
  }

  const btnGenerateMerkle = document.getElementById('btnGenerateMerkle');
  if (btnGenerateMerkle) {
    btnGenerateMerkle.onclick = () => {
      playTactileClick();
      if (issuerStudents.length === 0) {
        showToast('Add at least 1 student record to assemble a Merkle tree', 'error');
        return;
      }

      const itemsWithSalts = issuerStudents.map(st => ({
        record: st,
        salt: generateCryptoSalt()
      }));

      latestBatchTree = buildBatchMerkleTree(itemsWithSalts);

      const rootDisplay = document.getElementById('computedRootDisplay');
      if (rootDisplay) rootDisplay.innerText = latestBatchTree.root;

      const btnCommit = document.getElementById('btnCommitContract');
      if (btnCommit) {
        btnCommit.disabled = false;
        btnCommit.style.background = 'var(--color-olive-core)';
        btnCommit.style.color = 'var(--color-cream-beige)';
      }

      const btnExportPasses = document.getElementById('btnExportPasses');
      if (btnExportPasses) {
        btnExportPasses.disabled = false;
        btnExportPasses.style.background = 'var(--color-obsidian)';
        btnExportPasses.style.color = 'var(--color-mist)';
      }

      playSuccessChime();
      showToast(`Assembled Merkle Tree with ${issuerStudents.length} leaves`, 'success');
    };
  }

  const btnCommitContract = document.getElementById('btnCommitContract');
  if (btnCommitContract) {
    btnCommitContract.onclick = () => {
      playTactileClick();
      if (!latestBatchTree) return;
      try {
        const dummyIpfs = 'Qm' + Array.from({length: 44}, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');
        contractRegisterBatchRoot(latestBatchTree.root, dummyIpfs);
        playSuccessChime();
        btnCommitContract.innerText = 'Root Anchored On-Chain ✓';
        btnCommitContract.style.background = 'var(--color-olive-core)';
        btnCommitContract.style.color = 'var(--color-emerald-valid)';
        showToast('Root anchored to AxonRegistry.sol successfully!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }

  const btnExportPasses = document.getElementById('btnExportPasses');
  if (btnExportPasses) {
    btnExportPasses.onclick = () => {
      playTactileClick();
      if (!latestBatchTree || !latestBatchTree.passes) return;
      downloadJsonFile('axon_batch_passes.json', JSON.stringify(latestBatchTree.passes, null, 2));
      showToast(`Exported all ${latestBatchTree.passes.length} passes`, 'success');
    };
  }

  const btnCopyRoot = document.getElementById('btnCopyRoot');
  if (btnCopyRoot) {
    btnCopyRoot.onclick = () => {
      const rootText = document.getElementById('computedRootDisplay')?.innerText?.trim();
      if (rootText) {
        window.copyTextToClipboard(rootText, 'Merkle root');
      }
    };
  }

  const computedRootDisplay = document.getElementById('computedRootDisplay');
  if (computedRootDisplay) {
    computedRootDisplay.onclick = () => {
      const rootText = computedRootDisplay.innerText.trim();
      if (rootText) {
        window.copyTextToClipboard(rootText, 'Merkle root');
      }
    };
  }

  // ==============================================================================
  // 10. AUDIT TRAIL & REVOCATION EXPLORER
  // ==============================================================================
  function renderAuditLedger() {
    const rootsContainer = document.getElementById('auditRootsList');
    if (rootsContainer) {
      const rootsArr = Object.values(registryState.batchRoots);
      if (rootsArr.length === 0) {
        rootsContainer.innerHTML = `<p style="color:var(--color-smoke); font-size:12.5px;">No Merkle roots registered yet.</p>`;
      } else {
        rootsContainer.innerHTML = rootsArr.map(b => `
          <div class="audit-root-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-family:var(--font-mono); font-size:10.5px; color:var(--color-emerald-valid); font-weight:600; letter-spacing:0.04em;">● ON-CHAIN BATCH</span>
              <span style="font-family:var(--font-mono); font-size:10px; color:var(--color-smoke);">${new Date(b.blockTimestamp * 1000).toLocaleString()}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:rgba(0,0,0,0.3); padding:7px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
              <span style="font-family:var(--font-mono); font-size:11px; color:#ffffff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${b.merkleRoot}">${b.merkleRoot}</span>
              <button class="btn-cert-secondary btn-sm" onclick="window.copyTextToClipboard('${b.merkleRoot}', 'Root hash')" style="padding:2px 8px; font-size:10.5px;" title="Copy Root">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              </button>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-family:var(--font-mono); font-size:10px; color:var(--color-smoke); margin-top:8px;">
              <span>IPFS: <span style="color:var(--color-ash);">${b.ipfsMetadataHash.slice(0, 20)}...</span></span>
              <span style="color:var(--color-emerald-valid);">Status: Verified</span>
            </div>
          </div>
        `).join('');
      }
    }

    const revContainer = document.getElementById('auditRevocationsList');
    if (revContainer) {
      const revEntries = Object.entries(registryState.revokedLeaves);
      if (revEntries.length === 0) {
        revContainer.innerHTML = `<p style="color:var(--color-smoke); font-size:12.5px;">No credentials revoked.</p>`;
      } else {
        revContainer.innerHTML = revEntries.map(([leaf, r]) => `
          <div class="audit-revocation-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-family:var(--font-mono); font-size:10.5px; color:var(--color-coral-pulse); font-weight:600; letter-spacing:0.04em;">✕ REVOKED LEAF</span>
              <span style="font-family:var(--font-mono); font-size:10px; color:var(--color-smoke);">${new Date(r.timestamp * 1000).toLocaleTimeString()}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:rgba(0,0,0,0.3); padding:7px 10px; border-radius:6px; border:1px solid rgba(255,99,99,0.15);">
              <span style="font-family:var(--font-mono); font-size:11px; color:#ff8585; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${leaf}">${leaf}</span>
              <button class="btn-cert-secondary btn-sm" onclick="window.copyTextToClipboard('${leaf}', 'Leaf hash')" style="padding:2px 8px; font-size:10.5px; border-color:rgba(255,99,99,0.3);" title="Copy Leaf">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              </button>
            </div>
            <div style="font-size:11.5px; color:var(--color-ash); margin-top:8px;">
              <span style="color:var(--color-smoke); font-size:10.5px; text-transform:uppercase;">Reason:</span> ${escapeHtml(r.reason)}
            </div>
          </div>
        `).join('');
      }
    }
  }

  const btnSubmitRevoke = document.getElementById('btnSubmitRevoke');
  if (btnSubmitRevoke) {
    btnSubmitRevoke.onclick = () => {
      playTactileClick();
      const leaf = document.getElementById('inRevokeLeaf').value.trim();
      const reason = document.getElementById('inRevokeReason').value.trim();

      if (!leaf || !leaf.startsWith('0x') || leaf.length !== 66) {
        showToast('Please input a valid 32-byte hexadecimal leaf hash (0x + 64 characters)', 'error');
        return;
      }

      contractRevokeCertificate(leaf, reason);
      playRevokeAlert();
      document.getElementById('inRevokeLeaf').value = '';
      document.getElementById('inRevokeReason').value = '';
      renderAuditLedger();
      showToast('Certificate leaf revoked on-chain', 'error');

      if (currentActivePass && currentActivePass.leaf.toLowerCase() === leaf.toLowerCase()) {
        verifyPassPayload(currentActivePass);
      }
    };
  }

  // ==============================================================================
  // 11. SOLIDITY & ABI CODE MODAL
  // ==============================================================================
  const contractSoliditySource = 
`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title AxonRegistry
 * @notice Zero-Knowledge Decentralized Credential Registry
 * @dev Only 32-byte cryptographic Merkle roots and revoked leaf hashes reside on-chain.
 * Student PII is hashed client-side with random 32-byte cryptographic salts.
 * Transmit proof. Verify across the network.
 */
contract AxonRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct BatchRoot {
        bytes32 merkleRoot;
        uint256 blockTimestamp;
        string ipfsMetadataHash;
        bool active;
    }

    mapping(bytes32 => BatchRoot) public batchRoots;
    mapping(bytes32 => bool) public revokedLeaves;

    event BatchRegistered(bytes32 indexed merkleRoot, string ipfsHash, uint256 indexed timestamp);
    event CertificateRevoked(bytes32 indexed leafHash, string reason);
    event RoleGrantedCustom(address indexed account, bytes32 role);

    error BatchAlreadyExists(bytes32 root);
    error BatchNotFound(bytes32 root);
    error CertificateIsRevoked(bytes32 leaf);
    error InvalidMerkleProof();
    error ZeroHashNotAllowed();

    constructor(address rootAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, rootAdmin);
        _grantRole(ISSUER_ROLE, rootAdmin);
    }

    function registerBatchRoot(bytes32 _merkleRoot, string calldata _ipfsMetadataHash) external onlyRole(ISSUER_ROLE) {
        if (_merkleRoot == bytes32(0)) revert ZeroHashNotAllowed();
        if (batchRoots[_merkleRoot].merkleRoot != bytes32(0)) revert BatchAlreadyExists(_merkleRoot);

        batchRoots[_merkleRoot] = BatchRoot({
            merkleRoot: _merkleRoot,
            blockTimestamp: block.timestamp,
            ipfsMetadataHash: _ipfsMetadataHash,
            active: true
        });

        emit BatchRegistered(_merkleRoot, _ipfsMetadataHash, block.timestamp);
    }

    function revokeCertificate(bytes32 _leafHash, string calldata _reason) external onlyRole(ISSUER_ROLE) {
        revokedLeaves[_leafHash] = true;
        emit CertificateRevoked(_leafHash, _reason);
    }

    function verifyCredential(
        bytes32 _merkleRoot,
        bytes32 _leaf,
        bytes32[] calldata _proof
    ) external view returns (bool isValid, bool isRevoked, uint256 timestamp) {
        BatchRoot memory batch = batchRoots[_merkleRoot];
        if (!batch.active) revert BatchNotFound(_merkleRoot);
        if (revokedLeaves[_leaf]) return (false, true, batch.blockTimestamp);

        bool proofValid = MerkleProof.verify(_proof, _merkleRoot, _leaf);
        if (!proofValid) revert InvalidMerkleProof();

        return (true, false, batch.blockTimestamp);
    }
}`;

  const contractAbiJson = JSON.stringify([
    { "type": "constructor", "inputs": [{ "name": "rootAdmin", "type": "address" }] },
    { "type": "function", "name": "registerBatchRoot", "inputs": [{ "name": "_merkleRoot", "type": "bytes32" }, { "name": "_ipfsMetadataHash", "type": "string" }], "outputs": [] },
    { "type": "function", "name": "revokeCertificate", "inputs": [{ "name": "_leafHash", "type": "bytes32" }, { "name": "_reason", "type": "string" }], "outputs": [] },
    { "type": "function", "name": "verifyCredential", "inputs": [{ "name": "_merkleRoot", "type": "bytes32" }, { "name": "_leaf", "type": "bytes32" }, { "name": "_proof", "type": "bytes32[]" }], "outputs": [{ "name": "isValid", "type": "bool" }, { "name": "isRevoked", "type": "bool" }, { "name": "timestamp", "type": "uint256" }], "stateMutability": "view" },
    { "type": "event", "name": "BatchRegistered", "inputs": [{ "name": "merkleRoot", "type": "bytes32", "indexed": true }, { "name": "ipfsHash", "type": "string" }, { "name": "timestamp", "type": "uint256", "indexed": true }] },
    { "type": "event", "name": "CertificateRevoked", "inputs": [{ "name": "leafHash", "type": "bytes32", "indexed": true }, { "name": "reason", "type": "string" }] }
  ], null, 2);

  const deploymentScriptGuide = 
`// Hardhat Deployment Script: scripts/deploy.js
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AxonRegistry with account:", deployer.address);

  const AxonRegistry = await ethers.getContractFactory("AxonRegistry");
  const registry = await AxonRegistry.deploy(deployer.address);
  await registry.waitForDeployment();

  console.log("AxonRegistry deployed to:", await registry.getAddress());
}

main().catch(console.error);

// Run on Testnets:
// npx hardhat run scripts/deploy.js --network sepolia
// npx hardhat run scripts/deploy.js --network amoy`;

  let currentModalTab = 'solidity';
  let renderModalTabGlobal = null;

  function openContractModal(tab = 'solidity') {
    playTactileClick();
    const modal = document.getElementById('contractModalBackdrop');
    if (modal) {
      if (typeof renderModalTabGlobal === 'function') {
        renderModalTabGlobal(tab);
      }
      modal.classList.add('active');
    }
  }
  window.openContractModal = openContractModal;

  function initContractModal() {
    const modal = document.getElementById('contractModalBackdrop');
    const openBtn = document.getElementById('btnOpenContractModal');
    const closeBtn = document.getElementById('btnCloseModal');
    const contentArea = document.getElementById('modalContentArea');
    const tabButtons = document.querySelectorAll('.modal-tab-btn');
    const copyBtn = document.getElementById('btnCopyModalContent');

    if (!modal) return;

    function renderModalTab(tab) {
      currentModalTab = tab;
      tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
      if (!contentArea) return;

      if (tab === 'solidity') {
        contentArea.innerHTML = `<pre class="code-pre-box">${escapeHtml(contractSoliditySource)}</pre>`;
      } else if (tab === 'abi') {
        contentArea.innerHTML = `<pre class="code-pre-box">${escapeHtml(contractAbiJson)}</pre>`;
      } else {
        contentArea.innerHTML = `<pre class="code-pre-box">${escapeHtml(deploymentScriptGuide)}</pre>`;
      }
    }
    renderModalTabGlobal = renderModalTab;

    if (openBtn) {
      openBtn.onclick = () => {
        openContractModal('solidity');
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        playTactileClick();
        modal.classList.remove('active');
      };
    }

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    };

    tabButtons.forEach(btn => {
      btn.onclick = () => {
        playTactileClick();
        renderModalTab(btn.dataset.tab);
      };
    });

    if (copyBtn) {
      copyBtn.onclick = () => {
        playTactileClick();
        let text = contractSoliditySource;
        if (currentModalTab === 'abi') text = contractAbiJson;
        else if (currentModalTab === 'deploy') text = deploymentScriptGuide;

        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'info');
      };
    }
  }

  // ==============================================================================
  // 12. WEB3 WALLET CONNECTION (EIP-1193 / METAMASK)
  // ==============================================================================
  async function initWallet() {
    const walletBtn = document.getElementById('btnWalletConnect');
    const walletLabel = document.getElementById('walletLabel');
    if (!walletBtn) return;

    walletBtn.onclick = async () => {
      playTactileClick();
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts[0]) {
            const acc = accounts[0];
            const shortAcc = acc.slice(0, 6) + '...' + acc.slice(-4);
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            let netName = 'EVM';
            if (chainId === '0xaa36a7' || chainId === '11155111') netName = 'Sepolia';
            else if (chainId === '0x13882' || chainId === '80002') netName = 'Amoy';
            else if (chainId === '0x1') netName = 'Mainnet';

            walletLabel.innerText = `${shortAcc} (${netName})`;
            walletBtn.classList.add('connected');
            showToast(`Connected to ${netName}: ${shortAcc}`, 'success');
          }
        } catch (err) {
          showToast('Wallet connection rejected: ' + err.message, 'error');
        }
      } else {
        showToast('Running in Zero-Gas Local Simulation Mode', 'info');
      }
    };
  }

  // ==============================================================================
  // 13. LUXURY THEME & FONT ENGINE
  // ==============================================================================
  const fontChips = document.querySelectorAll('.font-chip-btn');
  fontChips.forEach(chip => {
    chip.addEventListener('click', () => {
      playTactileClick();
      fontChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const theme = chip.dataset.theme;
      document.body.dataset.fontTheme = theme;

      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle) {
        if (theme === 'luxury') heroTitle.style.fontFamily = "'Playfair Display', serif";
        else if (theme === 'avantgarde') heroTitle.style.fontFamily = "'Syne', sans-serif";
        else if (theme === 'cybernetic') heroTitle.style.fontFamily = "'BubbledotICG-FinePos', 'Geist Pixel Circle', monospace";
        else heroTitle.style.fontFamily = "'Inter', sans-serif";
      }

      if (currentActivePass && currentVerificationResult) {
        renderCertificate(currentActivePass, currentVerificationResult);
      }
    });
  });

  let balatroInstance = null;
  let staggeredMenuInstance = null;

  function initThemeControls() {
    const swatchCapsules = document.querySelectorAll('.swatch-capsule');
    const fontChipButtons = document.querySelectorAll('.font-chip-btn');
    const ambientBleed = document.getElementById('ambientBleed');

    swatchCapsules.forEach(swatch => {
      swatch.onclick = (e) => {
        if (e) e.stopPropagation();
        playTactileClick();
        swatchCapsules.forEach(s => s.classList.toggle('active', s.dataset.color === swatch.dataset.color));
        const colorType = swatch.dataset.color;

        if (balatroInstance && typeof balatroInstance.setPreset === 'function') {
          balatroInstance.setPreset(colorType);
        }

        document.body.dataset.atmosphere = colorType;

        if (colorType === 'balatro') {
          showToast('Liquid Shader Activated (Balatro Crimson-Cobalt Swirl)', 'success');
        } else if (colorType === 'emerald') {
          showToast('Dark Emerald Velvet Atmosphere', 'info');
        } else if (colorType === 'olive') {
          showToast('Olive Green Protocol Atmosphere', 'info');
        } else if (colorType === 'cream') {
          showToast('Cream Beige High-Contrast Atmosphere', 'info');
        }

        if (ambientBleed) {
          if (colorType === 'balatro') {
            ambientBleed.style.background = 'radial-gradient(ellipse at center, rgba(222, 68, 59, 0.28) 0%, rgba(0, 107, 180, 0.18) 45%, rgba(22, 35, 37, 0.45) 80%, transparent 100%)';
          } else if (colorType === 'emerald') {
            ambientBleed.style.background = 'radial-gradient(ellipse at center, rgba(2, 17, 12, 0.75) 0%, rgba(26, 66, 47, 0.25) 55%, transparent 80%)';
          } else if (colorType === 'olive') {
            ambientBleed.style.background = 'radial-gradient(ellipse at center, rgba(45, 106, 74, 0.55) 0%, rgba(2, 17, 12, 0.2) 55%, transparent 80%)';
          } else if (colorType === 'cream') {
            ambientBleed.style.background = 'radial-gradient(ellipse at center, rgba(243, 235, 214, 0.28) 0%, rgba(26, 66, 47, 0.2) 55%, transparent 80%)';
          }
        }
      };
    });

    fontChipButtons.forEach(btn => {
      btn.onclick = (e) => {
        if (e) e.stopPropagation();
        playTactileClick();
        fontChipButtons.forEach(b => b.classList.toggle('active', b.dataset.theme === btn.dataset.theme));
        document.body.dataset.fontTheme = btn.dataset.theme;
        showToast(`Typography Theme: ${btn.innerText}`, 'success');
      };
    });
  }

  window.initThemeControls = initThemeControls;

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    soundToggleBtn.onclick = () => {
      isSoundEnabled = !isSoundEnabled;
      soundToggleBtn.classList.toggle('playing', isSoundEnabled);
      soundToggleBtn.classList.toggle('active', isSoundEnabled);
      soundToggleBtn.title = isSoundEnabled ? 'Pause Ambient Music' : 'Play Ambient Music';
      soundToggleBtn.innerHTML = isSoundEnabled
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      if (isSoundEnabled) {
        startPeacefulAmbient();
        showToast('Ambient Music Playing', 'info');
      } else {
        stopPeacefulAmbient();
        showToast('Ambient Music Paused', 'info');
      }
    };
  }

  // ==============================================================================
  // 14. ATMOSPHERIC LUXURY CANVAS (SILK PARALLAX & LUMINOUS EMBER PARTICLES)
  // ==============================================================================
  function initAtmosphericCanvas() {
    const canvas = document.getElementById('scannerCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 46;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.35 + 0.12),
        speedX: (Math.random() - 0.5) * 0.18,
        opacity: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.4 ? 'rgba(89, 212, 153,' : 'rgba(243, 235, 214,'
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 3;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const silkBg = document.getElementById('bgLuxurySilk');
      if (silkBg) {
        const offsetX = (e.clientX - width / 2) * -0.015;
        const offsetY = (e.clientY - height / 2) * -0.015;
        silkBg.style.transform = `scale(1.03) translate(${offsetX}px, ${offsetY}px)`;
      }
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric cursor light pool
      const lightGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 450);
      lightGrad.addColorStop(0, 'rgba(26, 66, 47, 0.2)');
      lightGrad.addColorStop(0.5, 'rgba(2, 17, 12, 0.08)');
      lightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, width, height);

      // Gentle floating luminous particles
      for (let p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#59d499';
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  // ==============================================================================
  // 15. UTILITIES & INITIALIZATION
  // ==============================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function downloadJsonFile(filename, text) {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function bindSampleButtons() {
    const btnElena = document.getElementById('btnSampleElena');
    if (btnElena) {
      btnElena.onclick = () => {
        playTactileClick();
        verifyPassPayload(samplePasses[0]);
      };
    }

    const btnMarcus = document.getElementById('btnSampleMarcus');
    if (btnMarcus) {
      btnMarcus.onclick = () => {
        playTactileClick();
        verifyPassPayload(samplePasses[1]);
      };
    }

    const btnSophia = document.getElementById('btnSampleSophia');
    if (btnSophia) {
      btnSophia.onclick = () => {
        playTactileClick();
        verifyPassPayload(samplePasses[2]);
      };
    }

    const btnCorrupted = document.getElementById('btnSampleCorrupted');
    if (btnCorrupted) {
      btnCorrupted.onclick = () => {
        playTactileClick();
        const tampered = JSON.parse(JSON.stringify(samplePasses[0]));
        tampered.record.recipientName = 'Eve Mallory (Tampered Identity)';
        tampered.leaf = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        verifyPassPayload(tampered);
      };
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });

  const btnLogoHome = document.getElementById('btnLogoHome');
  if (btnLogoHome) {
    btnLogoHome.onclick = () => {
      playTactileClick();
      switchView('verify');
      if (samplePasses.length > 0) {
        verifyPassPayload(samplePasses[0]);
      }
    };
  }

  window.addEventListener('DOMContentLoaded', () => {
    initSampleData();
    initAtmosphericCanvas();
    bindSampleButtons();
    renderIssuerTable();
    initContractModal();
    initWallet();

    // Initialize React-Bits Balatro WebGL2 Component
    const balatroCanvas = document.getElementById('balatroCanvas');
    if (balatroCanvas && typeof Balatro !== 'undefined') {
      try {
        balatroInstance = new Balatro(balatroCanvas, {
          color1: '#051c14', // Deep Emerald
          color2: '#16422d', // Rich Olive
          color3: '#020906', // Obsidian Void
          swirl: 0.25,
          pixelSize: 1.5,
          mouseInteraction: true,
          contrast: 3.5,
          lighting: 0.4,
          speed: 1.0,
          rotationSpeed: 0.0,
          scale: 1.0,
          detail: 5,
          crt: 0.0,
          mouseStrength: 1.0,
          clickSwirl: true,
          intro: true,
          lightMode: false
        });
      } catch (e) {
        console.warn('Balatro Shader init warning:', e);
      }
    }

    // Initialize React-Bits StaggeredMenu
    if (typeof StaggeredMenu !== 'undefined') {
      try {
        staggeredMenuInstance = new StaggeredMenu({
          position: 'right',
          displaySocials: true,
          displayItemNumbering: true,
          menuButtonColor: '#ffffff',
          openMenuButtonColor: '#ffffff',
          changeMenuColorOnOpen: true,
          colors: ['#02110c', '#0a2318', '#143827', '#1a422f'],
          logoUrl: 'assets/logo.webp',
          accentColor: '#59d499',
          items: [
            {
              label: 'Verify Pass',
              target: 'verify',
              onClick: () => (window.switchView ? window.switchView('verify') : switchView('verify'))
            },
            {
              label: 'Batch Issuer Portal',
              target: 'issuer',
              onClick: () => (window.switchView ? window.switchView('issuer') : switchView('issuer'))
            },
            {
              label: 'Audit Trail & Explorer',
              target: 'audit',
              onClick: () => (window.switchView ? window.switchView('audit') : switchView('audit'))
            },
            {
              label: 'Smart Contract',
              target: 'contract',
              onClick: () => (window.openContractModal ? window.openContractModal('solidity') : openContractModal('solidity'))
            },
            {
              label: 'Contract ABI',
              target: 'abi',
              onClick: () => (window.openContractModal ? window.openContractModal('abi') : openContractModal('abi'))
            }
          ],
          socialItems: [
            { label: 'GitHub', link: 'https://github.com' },
            { label: 'Twitter', link: 'https://twitter.com' },
            { label: 'LinkedIn', link: 'https://linkedin.com' },
            { label: 'Ethereum', link: 'https://ethereum.org' }
          ],
          onMenuOpen: () => playTactileClick(),
          onMenuClose: () => playTactileClick()
        });

        const btnOpenMenu = document.getElementById('btnOpenStaggeredMenu');
        if (btnOpenMenu) {
          btnOpenMenu.onclick = (e) => {
            e.stopPropagation();
            playTactileClick();
            staggeredMenuInstance.toggle();
          };
        }

        // Initialize Theme Controls for swatches and fonts inside menu panel
        initThemeControls();
      } catch (e) {
        console.warn('StaggeredMenu init warning:', e);
      }
    }

    if (samplePasses.length > 0) {
      verifyPassPayload(samplePasses[0]);
    }
  });

})();
