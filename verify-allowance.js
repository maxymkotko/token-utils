const ethers = require('ethers');

const rpcUrl = "";
async function checkAllowanceAndApprove(walletAddress, tokenAddress, spenderAddress, amount) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  
  const tokenABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
  ];

  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);

  const currentAllowance = await tokenContract.allowance(walletAddress, spenderAddress);

  if (currentAllowance.lt(amount)) {
    return true;
  } else {
    return false;
  }
}

async function main() {
  const verifyResult = await checkAllowanceAndApprove(
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',  // wallet address
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',  // token address (USDT for example)
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',  // spender address (Uniswap V2 Router)
    ethers.parseUnits('100', 6)  // amount to verify
  );
  console.log("Result:", verifyResult);
}

main();