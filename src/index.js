// Initialize providers and contracts
let provider;
let signer;
let userAddress;
let votingContract;

// DOM elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletInfoDiv = document.getElementById('walletInfo');
const accountAddressSpan = document.getElementById('accountAddress');
const accountBalanceSpan = document.getElementById('accountBalance');
const currentNetworkSpan = document.getElementById('currentNetwork');

// Check if ethers.js loaded
if (typeof ethers === 'undefined') {
    alert('Critical Error: Blockchain library failed to load. Please refresh the page.');
    throw new Error('Ethers.js not loaded');
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Set up event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    document.getElementById('sendEthButton').addEventListener('click', sendETH);
    document.getElementById('voteProposal1').addEventListener('click', () => vote(1));
    document.getElementById('voteProposal2').addEventListener('click', () => vote(2));

    // Check if MetaMask is installed
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Handle account/chain changes
        window.ethereum.on('accountsChanged', (accounts) => {
            accounts.length > 0 ? connectWallet() : disconnectWallet();
        });
        
        window.ethereum.on('chainChanged', () => window.location.reload());
        
        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) await connectWallet();
    } else {
        alert('Please install MetaMask to use all features!');
    }
});

// Connect wallet function
async function connectWallet() {
    try {
        // Request accounts
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get network
        const network = await provider.getNetwork();
        currentNetworkSpan.textContent = network.name;
        
        // Get signer
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Update UI
        connectWalletBtn.textContent = 'Connected';
        walletInfoDiv.classList.remove('hidden');
        accountAddressSpan.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        
        // Initialize contract
        votingContract = new ethers.Contract(
            "0x35cd167FA931C6c5E07AbB2621846FC35D54baD6",
            [
                {
                    "inputs": [{"internalType": "uint256","name": "proposal","type": "uint256"}],
                    "name": "vote",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ],
            signer
        );
        
        // Update balance
        await updateBalance();
    } catch (error) {
        console.error("Connection error:", error);
        alert(`Connection failed: ${error.message}`);
    }
}

// Update balance function
async function updateBalance() {
    if (!userAddress) return;
    
    try {
        const balance = await provider.getBalance(userAddress);
        accountBalanceSpan.textContent = ethers.utils.formatEther(balance).substring(0, 6);
    } catch (error) {
        console.error("Balance error:", error);
    }
}

// Send ETH function
async function sendETH() {
    const recipient = document.getElementById('recipientAddress').value.trim();
    const amount = document.getElementById('sendAmount').value.trim();
    const statusDiv = document.getElementById('transactionStatus');

    if (!recipient || !amount) {
        showStatus(statusDiv, 'Please fill all fields', 'error');
        return;
    }

    try {
        showStatus(statusDiv, 'Sending transaction...');
        const tx = await signer.sendTransaction({
            to: recipient,
            value: ethers.utils.parseEther(amount)
        });
        showStatus(statusDiv, `Transaction sent! Hash: ${tx.hash}`, 'success');
        await tx.wait();
        showStatus(statusDiv, 'Transaction confirmed!', 'success');
        await updateBalance();
    } catch (error) {
        console.error("Send error:", error);
        showStatus(statusDiv, `Error: ${error.message}`, 'error');
    }
}

// Vote function
async function vote(proposal) {
    const statusDiv = document.getElementById('votingStatus');
    
    try {
        showStatus(statusDiv, 'Sending vote...');
        const tx = await votingContract.vote(proposal);
        showStatus(statusDiv, `Vote submitted! Hash: ${tx.hash}`, 'success');
        await tx.wait();
        showStatus(statusDiv, 'Vote confirmed!', 'success');
    } catch (error) {
        console.error("Vote error:", error);
        showStatus(statusDiv, `Error: ${error.message}`, 'error');
    }
}

// Helper functions
function showStatus(element, message, type = '') {
    element.textContent = message;
    element.className = type;
}

function disconnectWallet() {
    connectWalletBtn.textContent = 'Connect Wallet';
    walletInfoDiv.classList.add('hidden');
    userAddress = null;
}
