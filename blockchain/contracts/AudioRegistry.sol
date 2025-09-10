// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AudioRegistry {
    struct Audio {
        string filename;
        string ipfsHash;
        uint256 timestamp;
        address owner;
    }

    mapping(string => Audio) private audioFiles; // Keep mapping for quick lookup
    string[] private audioHashes; // Store IPFS hashes to track total count

    event AudioRegistered(string ipfsHash, string filename, uint256 timestamp, address owner);

    function registerAudio(string memory _filename, string memory _ipfsHash) public {
        require(bytes(audioFiles[_ipfsHash].ipfsHash).length == 0, "Audio already exists!");

        audioFiles[_ipfsHash] = Audio({
            filename: _filename,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            owner: msg.sender
        });

        audioHashes.push(_ipfsHash); // Store hash to keep track of total audios

        emit AudioRegistered(_ipfsHash, _filename, block.timestamp, msg.sender);
    }

    function getAudio(string memory _ipfsHash) public view returns (string memory, uint256, address) {
        require(bytes(audioFiles[_ipfsHash].ipfsHash).length > 0, "Audio not found!");
        Audio memory audio = audioFiles[_ipfsHash];
        return (audio.filename, audio.timestamp, audio.owner);
    }

    function getTotalAudios() public view returns (uint256) {
        return audioHashes.length; // Return total count
    }

    function getAudioByIndex(uint256 index) public view returns (string memory, string memory, uint256, address) {
        require(index < audioHashes.length, "Invalid index!");
        string memory ipfsHash = audioHashes[index];
        Audio memory audio = audioFiles[ipfsHash];
        return (audio.filename, audio.ipfsHash, audio.timestamp, audio.owner);
    }
}
