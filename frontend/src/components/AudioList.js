import React, { useEffect, useState } from "react";
import Web3 from "web3";
import AudioRegistryABI from "../contracts/AudioRegistry.json";



const contractAddress = "0xA897650E58597a338F423D1753b6082D3c25415D"; 

const AudioList = () => {
    const [audios, setAudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [account, setAccount] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [audioRegistry, setAudioRegistry] = useState(null);

    useEffect(() => {
        const initBlockchain = async () => {
            try {
                if (!window.ethereum) {
                    throw new Error("MetaMask is not installed. Please install it to use this feature.");
                }

                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAccount(accounts[0]);

                const audioRegistryInstance = new web3Instance.eth.Contract(AudioRegistryABI, contractAddress);
                setAudioRegistry(audioRegistryInstance);

                console.log("✅ Blockchain initialized. Account:", accounts[0]);
                fetchAudios(audioRegistryInstance);
            } catch (error) {
                console.error("❌ Error initializing blockchain:", error);
                setError(error.message || "Failed to initialize blockchain.");
                setLoading(false);
            }
        };

        const fetchAudios = async (contract) => {
            if (!contract) {
                console.error("❌ Contract instance is not available.");
                setError("Smart contract not loaded. Try refreshing the page.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                console.log("⏳ Fetching total audios...");
                const totalAudios = await contract.methods.getTotalAudios().call();
                console.log(`✅ Total audios stored: ${totalAudios}`);

                if (totalAudios === "0") {
                    console.warn("⚠️ No audios found in the contract.");
                    setAudios([]);
                    setLoading(false);
                    return;
                }

                const fetchedAudios = [];

                for (let i = 0; i < totalAudios; i++) {
                    try {
                        console.log(`🔍 Fetching audio at index ${i}...`);
                        const audio = await contract.methods.getAudioByIndex(i).call();
                        console.log(`✅ Audio found:`, audio);

                        fetchedAudios.push({
                            filename: audio[0],
                            ipfsHash: audio[1],
                            timestamp: new Date(Number(audio[2]) * 1000).toLocaleString(),
                            owner: audio[3],
                        });
                    } catch (error) {
                        console.warn(`⚠️ Error fetching audio at index ${i}:`, error);
                    }
                }

                setAudios(fetchedAudios);
            } catch (error) {
                console.error("❌ Error fetching audios:", error);
                setError("Failed to fetch audios. Please check your network and try again.");
            } finally {
                setLoading(false);
            }
        };

        initBlockchain();
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎶 Stored Audios</h2>
            {loading ? (
                <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-3">Loading audios...</span>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center">
                    <p>{error}</p>
                </div>
            ) : audios.length > 0 ? (
                <ul className="space-y-4">
                    {audios.map((audio, index) => (
                        <li key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-center">
                                <div>
                                    <strong className="text-lg text-gray-700">{audio.filename}</strong>
                                    <p className="text-sm text-gray-500">Uploaded by: {audio.owner}</p>
                                    <p className="text-sm text-gray-500">Timestamp: {audio.timestamp}</p>
                                </div>
                                <a
                                    href={`http://127.0.0.1:8080/ipfs/${audio.ipfsHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    View on IPFS
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center">No stored audios found.</p>
            )}
        </div>
    );
};

export default AudioList;
