# Ethereum DApp with Infura Integration

A decentralized application that demonstrates proper Infura integration for:
1. Reading blockchain data (balances, etc.)
2. Writing transactions via MetaMask
3. Interacting with smart contracts on Sepolia testnet

## Key Features

- Dual provider architecture (Infura + MetaMask)
- Network detection and validation
- Sepolia testnet voting contract interaction
- Environment variable configuration
- Responsive UI with clear status messages

## Setup

1. Clone the repository
2. Create a `.env` file with your Infura API key
3. Install dependencies: `npm install`
4. Run the development server: `npm start`

## Infura Configuration

1. Sign up at [Infura.io](https://infura.io/)
2. Create a new project and get your API key
3. Add it to your `.env` file as `INFURA_API_KEY`

## Deployment

For production deployment:
1. Set up environment variables in your hosting platform
2. Build the project: `npm run build`
3. Deploy the `dist` folder

## Best Practices

- Never expose API keys in client-side code
- Use environment variables for configuration
- Validate network before transactions
- Provide clear user feedback for all operations