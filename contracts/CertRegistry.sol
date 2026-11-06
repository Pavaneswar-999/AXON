// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title CertRegistry
 * @dev Production Zero-Knowledge Decentralized Certificate Registry
 * Only 32-byte cryptographic Merkle roots and revoked leaf hashes reside on-chain.
 * Student PII is hashed client-side with random 32-byte cryptographic salts.
 */
contract CertRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct BatchRoot {
        bytes32 merkleRoot;
        uint256 blockTimestamp;
        string ipfsMetadataHash;
        bool active;
    }

    // Root hash => Batch information
    mapping(bytes32 => BatchRoot) public batchRoots;
    // Revocation status: Leaf Hash => isRevoked
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
}
