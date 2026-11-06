# AXON

> **Zero-Knowledge Decentralized Certificate Registry & Verification Protocol**

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Contracts_v5.0-4E5EE4?logo=openzeppelin)](https://openzeppelin.com/contracts/)
[![Cryptography](https://img.shields.io/badge/Hashing-Keccak--256-59d499)](#cryptographic-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Protocol-Active_v1.0-59d499)](#)

AXON is a decentralized credential issuance and verification protocol that eliminates trust assumptions in academic and enterprise certifications. By leveraging commutative Keccak-256 Merkle trees and on-chain root anchoring, AXON enables instant, gasless client-side verification while ensuring zero Personally Identifiable Information (PII) is ever exposed on the public ledger.

---

## Architecture Overview

Traditional credential verification relies either on centralized proprietary databases prone to tampering and downtime, or naively publishes student records directly on-chain, violating data privacy regulations (GDPR/FERPA).

AXON decouples **credential data** from **authenticity proofs**:

1. **Zero-Knowledge Privacy**: Only a 32-byte Merkle root representing an entire graduation cohort or issuance batch is committed to the blockchain (`AxonRegistry.sol`). No names, student IDs, or grade information are stored on-chain.
2. **Gasless Client-Side Verification**: Verifiers validate cryptographic passes (`.json` credential files) entirely client-side. The engine computes the Keccak-256 leaf hash, traverses the multi-step audit path, and confirms the computed root against the immutable contract registry in `< 10ms`.
3. **Targeted Revocation Registry**: Individual credentials can be invalidated on-chain by leaf hash with structured reason codes without invalidating the rest of the batch or re-anchoring the tree.

---

## Key Features

- **Standardized Merkle Proofs**: 100% compliant with OpenZeppelin `MerkleProof.sol` v5.0 specifications using commutative leaf ordering to mitigate second pre-image attacks.
- **Gas-Free Verification Vault**: Drag-and-drop validation interface that operates without requiring users to connect a Web3 wallet or pay transaction fees.
- **Batch Issuer Engine**: Institutional portal allowing universities to ingest candidate rosters, compute cryptographic trees, export verifiable student passes, and anchor roots.
- **Interactive Holographic Certificate Inspection**: Real-time 3D perspective tilt physics with cryptographic watermarks, valid/revoked state telemetry, and pass export.
- **Granular Revocation Management**: On-chain cryptographic registry allowing authorized issuers to revoke compromised or superseded credentials.
- **Neo-Brutalist Interface**: High-contrast dark emerald and obsidian terminal theme with WebGL2 Balatro liquid simulation shaders and GSAP staggered navigation.

---

## Cryptographic Architecture

```
                    [ 32-byte Anchored Batch Root ]  <-- Stored On-Chain
                                 /       \
                       [Node AB]           [Node CD]
                        /     \             /     \
                    [Leaf A] [Leaf B]   [Leaf C] [Leaf D]
                       |        |          |        |
                     Pass A   Pass B     Pass C   Pass D
```

### 1. Leaf Canonicalization
Each credential leaf is deterministically generated from its canonical JSON data:

$$\text{Leaf} = \text{Keccak-256}(\text{CanonicalData})$$

### 2. Commutative Pair Sorting
To guarantee deterministic traversal and eliminate ordering ambiguities:

$$\text{Parent}(A, B) = \text{Keccak-256}(\min(A, B) \parallel \max(A, B))$$

### 3. Verification Condition
A credential pass is cryptographically valid if and only if:

$$\text{verify}(\text{proof}, \text{root}, \text{leaf}) = \text{true} \quad \land \quad \text{isRevoked}(\text{leaf}) = \text{false}$$

---

## Repository Structure

```
├── contracts/
│   ├── AxonRegistry.sol       # Core registry contract with root anchoring & revocation
│   └── CertRegistry.sol       # Legacy reference registry
├── scripts/
│   └── deploy.js              # Hardhat deployment script
├── lib/
│   ├── balatroShader.js       # WebGL2 procedural liquid shader component
│   ├── staggeredMenu.js       # GSAP-driven responsive navigation menu
│   └── sha3.js                # Keccak-256 cryptographic hashing engine
├── assets/                    # Favicons, vector marks, and audio assets
├── index.html                 # Verification Cockpit & Issuer application
├── main.js                    # Web3 vault logic, Merkle traversal, and state management
├── styles.css                 # Neo-Brutalist design system stylesheet
├── sample_verified_pass.json  # Cryptographic test credential
├── hardhat.config.js          # Hardhat configuration (Solidity 0.8.20)
└── package.json               # Dependencies and build scripts
```

---

## Getting Started

### Prerequisites
- Node.js `v18.0.0+`
- Python `3.10+` (optional, for local development server)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Pavaneswar-999/AXON.git
cd AXON

# Install dependencies
npm install
```

### 2. Run Local Development Server
```bash
# Start local development server
npm run dev
# or: python server.py
# or: npx serve -l 3030 .
```

Open `http://localhost:3030` in your browser.

### 3. Smart Contract Compilation
```bash
# Compile Solidity contracts
npm run compile
```

---

## Test Vectors

The verification vault includes pre-configured cryptographic test vectors for evaluation:

| Target Pass | Issuing Entity | Verification Status | Test Purpose |
| :--- | :--- | :--- | :--- |
| **Elena Rostova** | MIT | `VALID` | Baseline valid proof traversal against Root 0 |
| **Marcus Vance** | Stanford University | `VALID` | Multi-leaf verification against Root 1 |
| **Sophia Al-Mansoor** | Oxford University | `REVOKED` | On-chain revocation registry detection |
| **Tampered Proof** | Fraud Simulation | `REJECTED` | Mismatched leaf hash and invalid Merkle root |

---

## Security Model

- **No Private Keys Exposed**: The frontend operates strictly as an auditing verification vault. Signing and anchoring operations are gated by authorized institutional keys.
- **Tamper Evidence**: Any single-byte modification to student credentials (e.g., GPA, degree classification, issuance timestamp) invalidates the leaf hash and causes Merkle proof verification to fail with mathematical certainty.
- **On-Chain Immutability**: Anchored roots cannot be overwritten or modified once committed to the Ethereum state trie.

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
