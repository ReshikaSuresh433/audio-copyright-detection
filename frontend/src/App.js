import React, { useState } from "react";
import UploadAudio from "./components/UploadAudio";
import RegisterAudio from "./components/RegisterAudio";
import AudioList from "./components/AudioList";

function App() {
    const [ipfsHash, setIpfsHash] = useState("");
    const [filename, setFilename] = useState("");

    const handleUploadSuccess = (hash, name) => {
        setIpfsHash(hash);
        setFilename(name);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 flex flex-col items-center p-6">
            {/* Header */}
            <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8 flex items-center space-x-3">
                <span role="img" aria-label="music-note">🎵</span>
                <span>Decentralized Audio Copyright Protection</span>
            </h1>

            {/* Upload Section */}
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl border border-gray-100 transform transition-all hover:scale-105">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2 mb-6">
                    <span role="img" aria-label="microphone">🎤</span>
                    <span>Upload Audio</span>
                </h2>
                <UploadAudio onUpload={handleUploadSuccess} />
            </div>

            {/* Register Audio Section */}
            {ipfsHash && (
                <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl border border-gray-100 mt-8 transform transition-all hover:scale-105">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2 mb-6">
                        <span role="img" aria-label="link">🔗</span>
                        <span>Register Audio on Blockchain</span>
                    </h2>
                    <RegisterAudio ipfsHash={ipfsHash} filename={filename} />
                </div>
            )}

            {/* Audio List */}
            <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-2xl border border-gray-100 mt-8 transform transition-all hover:scale-105">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2 mb-6">
                    <span role="img" aria-label="headphones">🎧</span>
                    <span>Stored Audios</span>
                </h2>
                <AudioList />
            </div>
        </div>
    );
}

export default App;