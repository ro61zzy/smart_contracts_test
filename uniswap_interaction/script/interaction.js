const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; 
  const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"; 
  
  
  await helpers.impersonateAccount(TOKEN_HOLDER);
  const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

  const url = "http://127.0.0.1:8545"; 
const provider = new ethers.JsonRpcProvider(url);


  const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
  const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
  const ROUTER = await ethers.getContractAt("IUniswapV2Router02", ROUTER_ADDRESS, impersonatedSigner);

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; 


  const amountUSDCToRemove = ethers.parseUnits("1000", 6); 
  await USDC_Contract.approve(ROUTER_ADDRESS, amountUSDCToRemove);
  await DAI_Contract.approve(ROUTER_ADDRESS, amountUSDCToRemove); 


  console.log("************REMOVING LIQUIDITY USDC/DAI*******");
  const liquidityAmount = ethers.parseUnits("500", 18); 

  const removeLiquidityTx = await ROUTER.removeLiquidity(
    USDC,
    DAI,
    liquidityAmount, 
    0, 
    0, 
    impersonatedSigner.address, 
    deadline
  );

  await removeLiquidityTx.wait(); 
  console.log("Liquidity removed successfully.");

  const usdcBalanceAfterRemove = await USDC_Contract.balanceOf(impersonatedSigner.address);
  const daiBalanceAfterRemove = await DAI_Contract.balanceOf(impersonatedSigner.address);
  console.log(`USDC balance after removing liquidity: ${ethers.formatUnits(usdcBalanceAfterRemove, 6)} USDC`);
  console.log(`DAI balance after removing liquidity: ${ethers.formatUnits(daiBalanceAfterRemove, 18)} DAI`);


  console.log("************SWAPPING USDC for ETH************");
  const usdcAmountIn = ethers.parseUnits("500", 6); 
  const minEthOut = ethers.parseEther("0.1"); 
  
  const path = [USDC, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"]; 


  await USDC_Contract.approve(ROUTER_ADDRESS, usdcAmountIn);


  const swapExactTokensForEthTx = await ROUTER.swapExactTokensForETH(
    usdcAmountIn,    
    minEthOut,       
    path,            
    impersonatedSigner.address, 
    deadline         
  );

  await swapExactTokensForEthTx.wait(); 

  const ethBalanceAfterSwap = await provider.getBalance(impersonatedSigner.address);
  const usdcBalanceAfterSwap = await USDC_Contract.balanceOf(impersonatedSigner.address);

  console.log(`ETH balance after swap: ${ethers.formatEther(ethBalanceAfterSwap)} ETH`);
  console.log(`USDC balance after swap: ${ethers.formatUnits(usdcBalanceAfterSwap, 6)} USDC`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
