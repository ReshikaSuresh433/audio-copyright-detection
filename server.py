from flask import Flask, request, jsonify
import os
import librosa
import numpy as np
import sqlite3
from werkzeug.utils import secure_filename
from flask_cors import CORS
import json
from scipy.spatial.distance import cosine, euclidean
from web3 import Web3
import subprocess  
import uuid

app = Flask(__name__)
CORS(app, supports_credentials=True)

UPLOAD_FOLDER = "uploaded_audio"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize Web3
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))  
if not w3.is_connected():
    raise ConnectionError("❌ Web3 connection failed. Ensure Ganache is running.")

# Load Contract ABI and Address
CONTRACT_PATH = "frontend/src/contracts/AudioRegistry.json"
try:
    with open(CONTRACT_PATH) as f:
        contract_data = json.load(f)
    contract_address = "0xA897650E58597a338F423D1753b6082D3c25415D"
    contract_abi = contract_data["abi"]
    instance = w3.eth.contract(address=contract_address, abi=contract_abi)
    w3.eth.default_account = w3.eth.accounts[0]
except Exception as e:
    raise FileNotFoundError(f"❌ Error loading contract: {e}")

# Database setup
DB_PATH = "audio_database.db"
with sqlite3.connect(DB_PATH) as conn:
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audio_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE,
        mfcc TEXT,
        ipfs_hash TEXT,
        blockchain_tx TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()

def get_mfcc(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=22050)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        
        
        mfcc = (mfcc - np.mean(mfcc, axis=1, keepdims=True)) / np.std(mfcc, axis=1, keepdims=True)
        
        
        mfcc_flattened = mfcc.flatten()
        return json.dumps(mfcc_flattened.tolist())
    except Exception as e:
        print(f"❌ Error processing MFCC: {e}")
        return None

def compute_similarity(vec1, vec2):
    try:
        vec1 = np.array(vec1).flatten()  
        vec2 = np.array(vec2).flatten()  
        
        cosine_sim = 1 - cosine(vec1, vec2)
        euclidean_dist = euclidean(vec1, vec2)
        return (cosine_sim * 0.6) + ((1 / (1 + euclidean_dist)) * 0.4)
    except Exception as e:
        print(f"❌ Error in similarity calculation: {e}")
        return 0

def check_audio_similarity(audio_path):
    new_audio_mfcc = get_mfcc(audio_path)
    if not new_audio_mfcc:
        return 0

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT filename, mfcc FROM audio_metadata")
        existing_audios = cursor.fetchall()

    for filename, mfcc_str in existing_audios:
        try:
            stored_mfcc = np.array(json.loads(mfcc_str)).flatten()  
            new_audio_vec = np.array(json.loads(new_audio_mfcc)).flatten()  

            similarity = compute_similarity(new_audio_vec, stored_mfcc)
            if similarity >= 0.50:
                return similarity * 100
        except Exception as e:
            print(f"❌ Error processing stored MFCC for {filename}: {e}")
    return 0

def upload_to_ipfs(file_path):
    """Uploads a file to IPFS using the IPFS CLI."""
    try:
        result = subprocess.run(
            ["ipfs", "add", "-Q", file_path], capture_output=True, text=True
        )
        if result.returncode == 0:
            ipfs_hash = result.stdout.strip()
            print(f"✅ IPFS Upload Successful! Hash: {ipfs_hash}")
            return ipfs_hash
        else:
            print(f"❌ IPFS Upload Failed: {result.stderr}")
            return None
    except Exception as e:
        print(f"❌ Error running IPFS CLI: {e}")
        return None

def store_audio_metadata(filename, file_path, ipfs_hash, tx_hash):
    mfcc_vector = get_mfcc(file_path)
    if mfcc_vector is None:
        return

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM audio_metadata WHERE filename = ?", (filename,))
        cursor.execute("""
            INSERT INTO audio_metadata (filename, mfcc, ipfs_hash, blockchain_tx)
            VALUES (?, ?, ?, ?)
        """, (filename, mfcc_vector, ipfs_hash, tx_hash))
        conn.commit()

@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(file_path)

    print(f"📁 File saved locally: {file_path}")
    similarity = check_audio_similarity(file_path)
    if similarity >= 75:
        os.remove(file_path)
        print("❌ Audio too similar, not uploading.")
        return jsonify({"message": "Audio too similar.", "similarity": similarity}), 400

    ipfs_hash = upload_to_ipfs(file_path)
    if not ipfs_hash:
        return jsonify({"error": "IPFS upload failed"}), 500

    print(f"✅ IPFS Upload Successful! Hash: {ipfs_hash}")

    try:
        tx_hash = instance.functions.registerAudio(filename, ipfs_hash).transact({"from": w3.eth.accounts[0]})
        tx_hash_hex = tx_hash.hex()
        print(f"✅ Blockchain TX Hash: {tx_hash_hex}")
    except Exception as e:
        print(f"❌ Blockchain registration failed: {e}")
        return jsonify({"error": "Blockchain registration failed", "details": str(e)}), 500

    store_audio_metadata(unique_filename, file_path, ipfs_hash, tx_hash_hex)

    return jsonify({"message": "Audio stored!", "ipfs_hash": ipfs_hash, "tx_hash": tx_hash_hex}), 200

@app.route("/api/audios", methods=["GET"])
def get_audios():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT filename, ipfs_hash, blockchain_tx, timestamp FROM audio_metadata")
        audios = [
            {"filename": row[0], "ipfs_hash": row[1], "blockchain_tx": row[2], "timestamp": row[3]}
            for row in cursor.fetchall()
        ]
    
    return jsonify(audios), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
