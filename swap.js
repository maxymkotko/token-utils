const {
  AlphaRouter,
  SwapType,
} = require('@uniswap/smart-order-router');
const { TradeType, CurrencyAmount, Percent, Token, ChainId } = require('@uniswap/sdk-core');

const {
  sendTransaction,
} = require('./providers');

const ethers = require('ethers');
const JSBI = require('jsbi');
const { checkAllowanceAndApprove } = require('./verify-allowance');

const MAX_FEE_PER_GAS = 100000000000
const MAX_PRIORITY_FEE_PER_GAS = 100000000000

function getProvider(chainId) {
  const rpcUrl = "";
  switch(chainId) {
      case ChainId.MAINNET:
        rpcUrl = "";
        break;
      case ChainId.POLYGON:
        rpcUrl = "";
        break;
      default: 
        rpcUrl = "";
        break;
  }
  return new ethers.JsonRpcProvider(rpcUrl);
}

function getSwapRouterAddress(chainId) {
  switch(chainId) {
    case ChainId.MAINNET:
      return "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
    case ChainId.POLYGON:
      return "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
    case ChainId.BASE:
      return "0x2626664c2603336E57B271c5C0b26F421741e481";
    default:
      return "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
  }
}

function fromReadableAmount(amount, decimals) {
  const extraDigits = Math.pow(10, countDecimals(amount))
  const adjustedAmount = amount * extraDigits
  return JSBI.divide(
    JSBI.multiply(
      JSBI.BigInt(adjustedAmount),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
    ),
    JSBI.BigInt(extraDigits)
  )
}

async function generateRoute(chainId, recipientAddress, tokenInAddress, tokenInDecimal, tokenOutAddress, tokenOutDecimal, amountIn) {
  const tokenIn = new Token(chainId, tokenInAddress, tokenInDecimal);
  const tokenOut = new Token(chainId, tokenOutAddress, tokenOutDecimal);

  const router = new AlphaRouter({
    chainId: chainId,
    provider: getProvider(),
  });

  const options = {
    recipient: recipientAddress,
    slippageTolerance: new Percent(50, 10_000),
    deadline: Math.floor(Date.now() / 1000 + 1800),
    type: SwapType.SWAP_ROUTER_02,
  };

  const route = await router.route(
    CurrencyAmount.fromRawAmount(
      tokenIn,
      fromReadableAmount(
        amountIn,
        tokenIn.decimals
      ).toString()
    ),
    tokenOut,
    TradeType.EXACT_INPUT,
    options
  );
  return route;
}

async function executeRoute(chainId, route, walletAddress, tokenInAddress, tokenInDecimal, tokenInAmount) {
  const provider = getProvider(chainId);
  if (!walletAddress || !provider) {
    throw new Error('Cannot execute a trade without a connected wallet');
  }

  const routerAddress = getSwapRouterAddress(chainId);

  const tokenApproval = await checkAllowanceAndApprove(
    walletAddress,
    tokenInAddress,
    routerAddress,
    ethers.parseUnits(tokenInAmount, tokenInDecimal)
  );

  // Fail if transfer approvals do not go through
  if (!tokenApproval) {
    return "Failed";
  }

  const res = await sendTransaction({
    data: route.methodParameters?.calldata,
    to: routerAddress,
    value: route?.methodParameters?.value,
    from: walletAddress,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  });
  return res;
}

async function sendTransaction(
  transaction,
  chainId,
  privateKey
) {
  const provider = getProvider(chainId)
  if (!provider) {
    return "Failed"
  }

  if (transaction.value) {
    transaction.value = BigNumber.from(transaction.value)
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  const txRes = await wallet.sendTransaction(transaction)
  let receipt = null

  while (receipt === null) {
    try {
      receipt = await provider.getTransactionReceipt(txRes.hash)

      if (receipt === null) {
        continue
      }
    } catch (e) {
      console.log(`Receipt error:`, e)
      break
    }
  }

  if (receipt) {
    return "Success"
  } else {
    return "Failed"
  }
}

module.exports = {
  generateRoute,
  executeRoute,
  getTokenTransferApproval
};