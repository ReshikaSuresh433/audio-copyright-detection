# 🎵 Blockchain-Based Audio Copyright Protection

A decentralized system to protect digital audio using **perceptual hashing, blockchain, and IPFS**. The project integrates **Panako 2.0** and **OLAF** for audio fingerprinting, IPFS for secure storage, and **Ethereum smart contracts** for ownership verification and royalty distribution.

---

## 🚀 Features
- 🔐 **Audio Fingerprinting** with Panako 2.0 + OLAF  
- 📦 **Decentralized Storage** using IPFS  
- ⛓️ **Smart Contracts** on Ethereum (Solidity)  
- 💰 **Automated Royalty Distribution** via smart contracts  
- 🌐 **User Interface** built with React.js & MetaMask  
- 🖥️ **Backend** powered by Flask + Web3.py  

---

## 🏗️ Architecture
1. Artist uploads audio + metadata.  
2. System generates perceptual hash with Panako + OLAF.  
3. Similarity check against blockchain registry.  
4. If unique → audio stored on IPFS, hash stored on blockchain.  
5. Smart contract handles ownership & royalty distribution.  

---

## 📂 Tech Stack
- **Frontend:** React.js, MetaMask, Web3.js  
- **Backend:** Flask, Web3.py  
- **Blockchain:** Ethereum (Ganache / Sepolia), Solidity, Truffle  
- **Audio Processing:** Panako 2.0, OLAF  
- **Storage:** IPFS Desktop  

---

## ⚙️ Installation
```bash
# Clone the repository
git clone https://github.com/your-username/audio-copyright-detection.git
cd audio-copyright-detection

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
