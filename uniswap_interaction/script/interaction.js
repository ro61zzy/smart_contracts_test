require('dotenv').config();
const { ethers } = require('ethers');


const UNISWAP_ROUTER_ABI = [
    "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];


const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";


const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_PROJECT_ID}`);


const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);


const uniswapRouter = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, wallet);


const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";   // DAI


async function removeLiquidity() {

    // const amountUsdt = ethers.parseUnits("100", 6);
    // const amountdai = ethers.parseUnits("14000000", 18);
    // const amountUsdtMin = ethers.parseUnits("95", 6);
    // const amountdaiMin = ethers.parseUnits("10000000", 18);
  
    const liquidity = ethers.parseUnits("1.0", 18);   
    const amountAMin = ethers.parseUnits("500", 6);   
    const amountBMin = ethers.parseUnits("500", 18);  
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    try {
        const tx = await uniswapRouter.removeLiquidity(
            USDC_ADDRESS,     
            DAI_ADDRESS,       
            liquidity,        
            amountAMin,       
            amountBMin,        
            wallet.address,    
            deadline          
        );
        const receipt = await tx.wait();
        console.log("Liquidity removed successfully:", receipt);
    } catch (error) {
        console.error("Error removing liquidity:", error);
    }
}


async function swapExactTokensForDAI() {
    const amountIn = ethers.utils.parseUnits("100", 6); 
    const amountOutMin = ethers.utils.parseUnits("99", 18);  
    const path = [USDC_ADDRESS, DAI_ADDRESS]; 
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; 

    try {
        const tx = await uniswapRouter.swapExactTokensForTokens(
            amountIn,         
            amountOutMin,      
            path,              
            wallet.address,    
            deadline         
        );
        const receipt = await tx.wait();
        console.log("Swap successful:", receipt);
    } catch (error) {
        console.error("Error swapping USDC for DAI:", error);
    }
}


(async () => {
    try {
        
        const USDC = new ethers.Contract(USDC_ADDRESS, ["function approve(address spender, uint256 amount) public returns (bool)"], wallet);
        const DAI = new ethers.Contract(DAI_ADDRESS, ["function approve(address spender, uint256 amount) public returns (bool)"], wallet);

        const amountToApprove = ethers.utils.parseUnits("100", 6); 

      
        let tx = await USDC.approve(UNISWAP_ROUTER_ADDRESS, amountToApprove);
        await tx.wait();
        console.log('USDC approved for swapping');

      
        tx = await DAI.approve(UNISWAP_ROUTER_ADDRESS, ethers.utils.parseUnits("500", 18)); 
        await tx.wait();
        console.log('DAI approved for liquidity');

   
        await removeLiquidity();

       
        await swapExactTokensForDAI();

    } catch (error) {
        console.error("Error in execution:", error);
    }
})();
