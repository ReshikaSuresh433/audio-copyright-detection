import React, { useState } from "react";
import axios from "axios";

const UploadAudio = ({ onUpload }) => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setMessage(""); 
    };

    const uploadToBackend = async () => {
        if (!file) {
            setMessage("⚠️ Please select an audio file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setMessage("");

            const response = await axios.post("http://127.0.0.1:5000/upload-audio", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true  
            });

            setMessage("✅ Audio uploaded successfully!");
            onUpload && onUpload(); 
        } catch (error) {
            console.error("Upload failed", error);
            setMessage("❌ Error: Audio already exists or upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">🎵 Upload Audio</h2>

            <input 
                type="file" 
                onChange={handleFileChange} 
                accept="audio/*"
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 mb-4"
            />

            <button 
                onClick={uploadToBackend} 
                disabled={loading}
                className={`w-full px-4 py-2 text-white rounded-md transition ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {loading ? "⏳ Uploading..." : "📤 Upload Audio"}
            </button>

            {message && (
                <p className={`mt-4 text-sm font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default UploadAudio;
