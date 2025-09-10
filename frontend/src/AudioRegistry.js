import web3 from "./web3";
import AudioRegistry from "./contracts/AudioRegistry.json"; // ABI from Truffle build

const contractAddress = "0xA897650E58597a338F423D1753b6082D3c25415D"; 
const instance = new web3.eth.Contract(AudioRegistry.abi, contractAddress);

export default instance;
