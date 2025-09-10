import React, { useState } from "react";
import web3 from "../web3";
import AudioRegistry from "../AudioRegistry";

const RegisterAudio = ({ ipfsHash, filename }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const registerOnBlockchain = async () => {
        try {
            setLoading(true);
            setMessage("");

            const accounts = await web3.eth.getAccounts();
            if (!accounts || accounts.length === 0) {
                throw new Error("No Ethereum accounts found. Ensure MetaMask is connected.");
            }

            await AudioRegistry.methods.registerAudio(filename, ipfsHash).send({ from: accounts[0] });

            setMessage("✅ Audio registered on blockchain!");
        } catch (error) {
            console.error("Blockchain registration failed", error);
            setMessage("❌ Error: Could not register on blockchain.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">🔗 Register on Blockchain</h2>
            
            <p className="text-gray-600 mb-2"><span className="font-semibold">Filename:</span> {filename}</p>
            <p className="text-gray-500 text-sm mb-4 truncate"><span className="font-semibold">IPFS Hash:</span> {ipfsHash}</p>

            <button 
                onClick={registerOnBlockchain} 
                disabled={loading}
                className={`w-full px-4 py-2 text-white rounded-md transition ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                }`}
            >
                {loading ? "⏳ Registering..." : "📜 Register on Blockchain"}
            </button>

            {message && (
                <p className={`mt-4 text-sm font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default RegisterAudio;
