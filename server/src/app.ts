// Libraries
import express from 'express'
import cors from 'cors';
import 'dotenv/config'

import setupDatabase from './db';
import {FakeNewsContract} from './contract';
import { setupRoute } from './route';
import FakeNews from '../../blockchain/artifacts/contracts/FakeNews.sol/FakeNews.json';
import { ethers } from 'ethers';

const port = 4005;
const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mongoose
setupRoute(app);
setupDatabase();

const address: string = process.env.CONTRACT_ADDRESS;
const abi: string = FakeNews.abi as unknown as string;
const url: string = process.env.RINKEBY_PROJECT_URL;
const chainId: number = Number(process.env.RINKEBY_CHAIN_ID);

const provider = new ethers.providers.JsonRpcProvider(url, chainId);
const signer = provider.getSigner();
const wallet = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, provider);
const fakeNewsContract = new FakeNewsContract(address, abi, signer, wallet);
fakeNewsContract.registerEventListener();


// Deploy the app
app.listen(port, () => {
    console.log(`🚀 App listening on the port ${port}`);
});

export { fakeNewsContract };
