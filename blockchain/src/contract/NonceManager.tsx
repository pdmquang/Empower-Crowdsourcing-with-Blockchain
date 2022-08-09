import FakeNews from '../../artifacts/contracts/FakeNews.sol/FakeNews.json';
import { BigNumber, Contract, ethers, Transaction } from "ethers";

export class NonceManager {
    // contract: Contract
    baseNonce: Promise<number>
    nonceOffset: number

    constructor(signer: ethers.providers.JsonRpcSigner) {
        // this.contract = new Contract(address, abi, signer);
        this.nonceOffset = 0;
        this.baseNonce = signer.getTransactionCount();
    }

    getNonce() {
        return this.baseNonce.then((nonce) => (nonce + (this.nonceOffset++)));
    }
}

// const contractAddress = "0xb2083497aB14F483bb550D3922E0Fb9A6d570501"; // Address of Deployed contract
// const provider = new ethers.providers.Web3Provider(window.ethereum);
// const signer = provider.getSigner();
// console.log("Signer: ", signer);
// const abi = FakeNews.abi as unknown as string;

// export const newsContract = new FakeNewsContract(contractAddress, abi, signer);

// export const ContractContext = React.createContext(new FakeNewsContract);