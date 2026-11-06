import { keccak256, encodePacked, Hex } from 'viem';
import { MerkleTree } from 'merkletreejs';

/**
 * AXON // REGISTRY v1.0
 * Zero-Knowledge Cryptographic Engine
 * "Transmit proof. Verify across the network."
 */

export interface StudentCertificateRecord {
  certId: string;
  recipientName: string;
  recipientIdentifier: string;
  courseDegree: string;
  issueDate: string;
  institutionDid: string;
}

export interface IssuedPassPayload {
  leaf: Hex;
  salt: Hex;
  merkleProof: Hex[];
  root: Hex;
  record: StudentCertificateRecord;
  axonVersion?: string;
}

export function generateCryptoSalt(): Hex {
  const randomBytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    const cryptoNode = require('crypto');
    const bytes = cryptoNode.randomBytes(32);
    for (let i = 0; i < 32; i++) randomBytes[i] = bytes[i];
  }
  return `0x${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}` as Hex;
}

export function computeLeaf(record: StudentCertificateRecord, salt: Hex): Hex {
  return keccak256(
    encodePacked(
      ['string', 'string', 'string', 'string', 'bytes32'],
      [record.certId, record.recipientIdentifier, record.courseDegree, record.institutionDid, salt]
    )
  );
}

export function generateBatchMerkleTree(records: Array<{ record: StudentCertificateRecord; salt: Hex }>) {
  const leaves = records.map(item => computeLeaf(item.record, item.salt));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot() as Hex;

  const passes: IssuedPassPayload[] = records.map(item => {
    const leaf = computeLeaf(item.record, item.salt);
    const proof = tree.getHexProof(leaf) as Hex[];
    return {
      axonVersion: '1.0.0',
      leaf,
      salt: item.salt,
      merkleProof: proof,
      root,
      record: item.record
    };
  });

  return { tree, root, passes };
}

export function verifyMerkleProof(leaf: Hex, proof: Hex[], root: Hex): boolean {
  let computedHash = leaf;
  for (const proofElement of proof) {
    const computedNum = BigInt(computedHash);
    const proofNum = BigInt(proofElement);
    if (computedNum <= proofNum) {
      computedHash = keccak256(encodePacked(['bytes32', 'bytes32'], [computedHash, proofElement]));
    } else {
      computedHash = keccak256(encodePacked(['bytes32', 'bytes32'], [proofElement, computedHash]));
    }
  }
  return computedHash.toLowerCase() === root.toLowerCase();
}
