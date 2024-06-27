const { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType } = require('@uniswap/sdk');
const ethers = require('ethers');

// const rpcUrl = "";

// async function executeTokenSwap(
//   tokenInAddress,
//   tokenOutAddress,
//   amountIn,
//   walletAddress
// ) {
//   const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

//   const tokenIn = new Token(ChainId.MAINNET, tokenInAddress, 18);
//   const tokenOut = new Token(ChainId.MAINNET, tokenOutAddress, 18);

//   // Fetch the pair
//   const pair = await Fetcher.fetchPairData(tokenIn, tokenOut, provider);

//   // Create a route
//   const route = new Route([pair], tokenIn);

//   // Create a trade
//   const trade = new Trade(
//     route,
//     new TokenAmount(tokenIn, amountIn),
//     TradeType.EXACT_INPUT
//   );

//   // Get the Uniswap V2 Router address
//   const uniswapV2Router = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

//   // Create the transaction parameters
//   const slippageTolerance = new Percent('50', '10000'); // 0.5%
//   const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
//   const path = [tokenIn.address, tokenOut.address];
//   const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

//   // Create the transaction
//   const tx = await uniswapV2Router.swapExactTokensForTokens(
//     amountIn.toString(),
//     amountOutMin.toString(),
//     path,
//     walletAddress,
//     deadline
//   );

//   console.log('Transaction would be sent with these parameters:', tx);
// }

// // Example usage
// executeTokenSwap(
// );