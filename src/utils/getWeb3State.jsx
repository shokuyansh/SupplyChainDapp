import { ethers } from "ethers"
import abi from "../constant/abi.json"

export const getWeb3State = async ()=>{
    try{
    if(!window.ethereum){
        throw new Error("Metamask is nor installed")
    }
    const accounts  = await window.ethereum.request({
        method:"eth_requestAccounts"
    })
    const selectedAccount = accounts[0];
    console.log("current account : ",selectedAccount);
    const chainIdHex = await window.ethereum.request({
        method:"eth_chainId"
    })
    const chainId = parseInt(chainIdHex,16);

    const provider = new ethers.BrowserProvider(window.ethereum)
    //provider is used for reading contract
    const signer = await provider.getSigner()
    //signer is used for writing
    const contractAddress = "0x8d88ec8f6aa7fd2f0e377a37c78f3e6d708db978"

    
    // await signer.signMessage("Welcome , ab kya lund chusu tera");    
    const contractInstance = new ethers.Contract(contractAddress,abi,signer)
    return {contractInstance,selectedAccount}
}catch(error){
        console.log(error)
        throw new Error
    }
}