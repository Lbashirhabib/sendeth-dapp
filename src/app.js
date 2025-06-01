// Main application logic with Infura integration
document.addEventListener('DOMContentLoaded', async () => {
    // DOM elements
    const connectWalletBtn = document.getElementById('connectWallet');
    const walletInfoDiv = document.getElementById('walletInfo');
    const accountAddressSpan = document.getElementById('accountAddress');
    const accountBalanceSpan = document.getElementById('accountBalance');
    const currentNetworkSpan = document.getElementById('currentNetwork');
    const sendEthBtn = document.getElementById('sendEthButton');
    const voteProposal1Btn = document.getElementById('voteProposal1');
    const voteProposal2Btn = document.getElementById('voteProposal2');

    // Contract ABI (simplified for voting function)
    const votingContractABI = [
        {
            "inputs": [{"internalType": "uint256","name": "proposal","type": "uint256"}],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    // Providers and state
    let infuraProvider;
    let metamaskProvider;
    let signer;
    let userAddress;
    let votingContract;
    let currentNetwork;

    // Initialize providers
    function initializeProviders() {
        // Initialize Infura provider (read-only)
        infuraProvider = new ethers.providers.JsonRpcProvider(
            CONFIG.NETWORKS.sepolia.rpcUrl
        );

        // Check if MetaMask is installed
        if (window.ethereum) {
            metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Set up event listeners for MetaMask changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            
            // Check if already connected
            checkInitialConnection();
        } else {
            alert('MetaMask is not installed. Please install it to use all features.');
            // Fallback to Infura only (read-only mode)
            currentNetworkSpan.textContent = "Infura (Read-only)";
        }
    }

    // Check initial connection
    async function checkInitialConnection() {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            await connectWallet();
        }
    }

    // Connect wallet handler
    async function connectWallet() {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Get network info
            const network = await metamaskProvider.getNetwork();
            currentNetwork = network.name;
            currentNetworkSpan.textContent = currentNetwork;
            
            // Get signer
            signer = metamaskProvider.getSigner();
            userAddress = await signer.getAddress();
            
            // Update UI
            connectWalletBtn.textContent = 'Connected';
            walletInfoDiv.classList.remove('hidden');
            accountAddressSpan.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
            
            // Initialize voting contract with signer
            votingContract = new ethers.Contract(
                CONFIG.VOTING_CONTRACT_ADDRESS,
                votingContractABI,
                signer
            );
            
            // Get and display balance
            await updateBalance();
        } catch (error) {
            console.error("Error connecting wallet:", error);
            showStatus("Error connecting wallet", 'error');
        }
    }

    // Update balance using Infura provider
    async function updateBalance() {
        if (!userAddress) return;
        
        try {
            const balance = await infuraProvider.getBalance(userAddress);
            const balanceInEth = ethers.utils.formatEther(balance);
            accountBalanceSpan.textContent = parseFloat(balanceInEth).toFixed(4);
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    }

    // Send ETH function
    async function sendETH() {
        // ... (same as previous implementation, but uses MetaMask provider)
    }

    // Vote function
    async function vote(proposal) {
        if (!userAddress) {
            showStatus("Please connect your wallet first", 'error');
            return;
        }

        // Verify we're on Sepolia
        const network = await metamaskProvider.getNetwork();
        if (network.chainId !== 11155111) {
            showStatus("Please switch to Sepolia network to vote", 'error');
            return;
        }

        try {
            showStatus("Sending vote...");
            
            // Call the vote function on the contract
            const tx = await votingContract.vote(proposal);
            
            showStatus(`Vote submitted! TX hash: ${tx.hash}`, 'success');
            
            await tx.wait();
            showStatus("Vote confirmed! Thank you for participating.", 'success');
        } catch (error) {
            console.error("Error voting:", error);
            showStatus(`Error: ${error.message}`, 'error');
        }
    }

    // Event handlers
    function handleAccountsChanged(accounts) {
        if (accounts.length > 0) {
            connectWallet();
        } else {
            disconnectWallet();
        }
    }

    function handleChainChanged() {
        window.location.reload();
    }

    function disconnectWallet() {
        connectWalletBtn.textContent = 'Connect Wallet';
        walletInfoDiv.classList.add('hidden');
        userAddress = null;
        signer = null;
    }

    // Helper function to show status messages
    function showStatus(message, type = '') {
        const statusDiv = type === 'error' ? 
            document.getElementById('transactionStatus') : 
            document.getElementById('votingStatus');
        
        statusDiv.textContent = message;
        statusDiv.className = type;
    }

    // Set up event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    sendEthBtn.addEventListener('click', sendETH);
    voteProposal1Btn.addEventListener('click', () => vote(1));
    voteProposal2Btn.addEventListener('click', () => vote(2));

    // Initialize the app
    initializeProviders();
});