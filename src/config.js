// Configuration for the DApp
const CONFIG = {
    INFURA_API_KEY: b311ae6d1d2646fc89c9b44ef0d24762, // Replace with your Infura ID
    VOTING_CONTRACT_ADDRESS: "0x35cd167FA931C6c5E07AbB2621846FC35D54baD6",
    NETWORKS: {
        sepolia: {
            chainId: "0xaa36a7", // 11155111 in decimal
            name: "Sepolia Testnet",
            rpcUrl: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
            explorer: "https://sepolia.etherscan.io"
        }
    }
};