import 'dotenv/config'
import { Contract, ethers, Transaction, BigNumber, Wallet } from "ethers";
import { fromBn, toBn } from 'evm-bn';

import FakeNews from '../../../blockchain/artifacts/contracts/FakeNews.sol/FakeNews.json';
import { NewsModel, PlayerModel, VoteModel } from '../models';
import { Player, Vote } from '../interfaces';
import { findPlayerById, findVotesByNewsId } from '../service';


export class FakeNewsContract {
    contract: Contract;
    wallet: ethers.Wallet;
    // nonceManager: NonceManager;
    baseNonce: Promise<number>;
    nonceOffset: number;

    constructor(
        address: string,
        abi: string,
        signer: ethers.providers.JsonRpcSigner,
        wallet: ethers.Wallet
    ) {
        this.contract = new Contract(address, abi, signer);
        this.nonceOffset = 0;
        this.wallet = wallet;
        this.baseNonce = wallet.getTransactionCount();
        this.nonceOffset = 0;
    }

    getNonce() {
        return this.baseNonce.then((nonce) => (nonce + (this.nonceOffset++)));
    }

    sendSignedTx = async (fnName: string, params: Array<any>): Promise<ethers.providers.TransactionResponse | null> => {

        /**
         * This function create a signed transaction and send to blockchain
         * @implements
         * - All transactions in backend is sent by owner of the contract. (From and To are optional cause these transactions require 0 value)
         * @TODO
         * Don't display news with `expired=true`
         * Increment nonce manually (avoid too low nonces or replacement transaction errors when 2 transactions
         * are sent at the same time. For example, player voted for the second news before first completed. See links below) [1, 2]
         * @links 
         * https://github.com/ethers-io/ethers.js/issues/444 [1]
         * https://github.com/ethers-io/ethers.js/issues/435 [2]
         */

        const abiInterface = new ethers.utils.Interface(FakeNews.abi);

        // Future: Replace this with NonceManager
        try {
            /**
             * use wallet.getTransactionCount("pending") for simplicity, cause if you 
             * self-increment nonce, nonce could be too big and now blockchain will wait
             * for the next transaction forever (
             * For example, getTransactionCount("pending") returns nonce = 56, but auto-increment 
             * gives 59, so blockchain waits for [57, 58] which are not existed) 
             */

            const tx: Transaction = {
                from: process.env.OWNER_ADDRESS,
                to: process.env.CONTRACT_ADDRESS,
                nonce: await this.getNonce(),
                gasLimit: BigNumber.from(10000000),
                data: abiInterface.encodeFunctionData(fnName, params),
                value: BigNumber.from(0),
                chainId: Number(process.env.RINKEBY_CHAIN_ID)
            }

            const txResponse = await this.wallet.sendTransaction(tx)

            return txResponse;

        } catch (error) {
            console.log(error);
            // alert(error.reason);
        }
    }

    async processWinnerReward(fnName, params, voteId, playerId, balance: number, creds: number, reward: number) {

        // We only need to sendTx for winners since losers receive 0 rewards
        // This way we effectively save alot of gas fee.
        try {
            const tx = await this.sendSignedTx(fnName, params);
            // console.log("TransferReward tx: ", tx)
            await tx.wait();

            if (!tx) {
                console.log("Cannot send transaction with method name ", fnName, " with tx ", tx);
                return;
            }

            // For winners    
            const newPlayer = await PlayerModel.findByIdAndUpdate(
                playerId,
                {
                    credibility: creds + 5,
                    balance: parseFloat((balance + reward).toFixed(2)), //parseFloat((balance + reward).toFixed(2))
                },
                { returnDocument: 'after' }
            );
            console.log("Winner player: ", newPlayer);
        } catch (error) {
            await VoteModel.findByIdAndUpdate(
                voteId,
                { hasTransferred: "Failed" }
            );
            console.error(error);
        }
    }

    async processLoserReward(voteId, playerId, balance: number, creds: number, stakedToken: number) {
        const decay = 0.5;
        // For losers
        // newCreds = oldCreds * (1 - decay) * v.stakedToken;

        const newPlayer = await PlayerModel.findByIdAndUpdate(
            playerId,
            {
                credibility: parseFloat((creds / (2 * stakedToken)).toFixed(2)),
                balance: balance
            },
            { returnDocument: 'after' }
        );

        const voteDoc = await VoteModel.findByIdAndUpdate(
            voteId,
            { hasTransferred: "Complete" },
            { returnDocument: 'after' }
        );

        console.log("Loser player: ", newPlayer);
        
    }

    registerEventListener = () => {
        this.contract.provider.once("block", () => {
            /**
             * Ethers events always gets called once upon the contract creation.
             * This is probably a bug from ethers, so we bandage it by wrap it in 
             * the `block` to stop its first time called.
             * @links https://github.com/ethers-io/ethers.js/issues/2310
             */
            this.contract.on("ContractDischarge", async (...params) => {
                /**
                 * This event emits when the number of votes on the same news 
                 * is higher than the LIMIT (currently set to 3)
                 * @implements 
                 * - Retrieve all votes on this news (newsId) 
                 * - Convert these votes into an tuples since Solidity required, and convert stakedToken from Number to BigNumber
                 * (The reason we need BigNumber is to convert Floating to Integer )
                 * - Send the transaction to blockchain
                 * @links 
                 * https://ethereum.stackexchange.com/questions/34769/erc20-workaround-for-floats
                 */

                const [newsId, playerId] = params;

                try {
                    // const fnName = "transferReward";
                    // const params = [
                    //     "voteId",
                    //     "playerId123",
                    //     90000000000,
                    //     "0xb84CD6FB4236f2eF94dd80E1D103E88d10418302"
                    // ]

                    // const tx = await this.sendSignedTx(fnName, params);
                    // console.log("TransferReward tx: ", tx)
                    // const events = await tx.wait();
                    // console.log("TransferReward events: ", events)

                    const playerDoc = await findPlayerById(playerId);
                    const votesDoc: Vote[] = await findVotesByNewsId(newsId);

                    const voteArr = [];

                    votesDoc.map(vote => {
                        voteArr.push([
                            vote.result,
                            playerDoc.credibility,
                            toBn(String(vote.stakedToken), 10)
                        ]);
                    })

                    const fnName = "calcPlayerReward";

                    const params = [
                        voteArr,
                        newsId
                    ]

                    const tx = await this.sendSignedTx(fnName, params);
                    if (!tx) {
                        console.log("Cannot send transaction with method name ", fnName, " with tx ", tx);
                        return;
                    }

                } catch (error) {
                    console.log("ContractDischarge event's params: ", params)
                    console.log(error);
                }
            })
            this.contract.on("Refund", async (newsId, event) => {
                /**
                 * This is to handle when there is no winners or losers
                 * (Fake's score  == Real's score), but this is very unlikely to happen
                 * @TODO
                 */
            })
            this.contract.on("TransferReward", async (...params) => {
                /**
                 * This event emits whenever the contract has transferred the reward to 1 particular player (playerId).
                 * For losers, Reward = 0 (basically they lose all tokens that they staked)
                 * For winners, Reward = amount of tokens they staked + calculated reward.
                 * In laymen, users will need to deposit some tokens to vote, and if they win, they will get back all their tokens
                 * plus the tokens pools that lost by Losers (Pools / no. of Losers)
                 * @implements
                 * - Convert BigNumber to Number
                 * - Update player's balance in Database 
                 * - Set hasTransferred = true (Front-end will keep polling for `hasTransferred`, and 
                 * will update the page when `hasTransferred = true`. This helps create a non-block UI experience. See links below)
                 * @links 
                 * https://github.com/IBM/BlockchainDevelopmentDesignPatterns/blob/master/docs/design_patterns/UIResponsivenessPattern.md
                 */

                const [voteId, playerId, reward, to] = params

                console.log("TransferReward event is trigger");

                try {

                    // const voteDoc = await VoteModel.findById(voteId);

                    const voteDoc = await VoteModel.findByIdAndUpdate(
                        voteId,
                        { 
                            hasTransferred: "Complete",
                            reward: Number(fromBn(BigNumber.from(reward), 10))
                        },
                        { returnDocument: 'after' }
                    );

                } catch (error) {
                    console.log("TransferReward event's params: ", params)
                    console.error(error);
                }

            })
            this.contract.on("PlayerReward", async (...params) => {
                /**
                 * This event emits when reward has been calculated by Smart contract and ready for player to collect.
                 * @param
                 * - verdict, newsId are used to query database for votes and distinguish winners and losers (this is because
                 * reward is different from winners and losers).
                 * @implements
                 * - Convert BigNumber to Number
                 * - Set news.expired to true (This means this news cannot be voted by any users)
                 * - Calculate the reward and credibility for winners and losers.
                 * - Send transaction to transfer tokens to winners only (cause losers reward = 0)
                 * - Update `credibility`, `reward`, and set `hasTransferred=false` in MongoDB
                 * (Front-end will keep polling for `hasTransferred`, and 
                 * will update the page when `hasTransferred = true`. This helps create a non-block UI experience. See links below)
                 * @TODO
                 * Don't display news with `expired=true`
                 * @links 
                 * https://github.com/IBM/BlockchainDevelopmentDesignPatterns/blob/master/docs/design_patterns/UIResponsivenessPattern.md
                 */

                // console.log("newsId: ", newsId);
                console.log("PlayerReward is called ");
                try {

                    const [verdict, newsId, reward] = params;

                    const rewardInt = Number(fromBn(BigNumber.from(reward), 10));
                    console.log("rewardInt: ", rewardInt);

                    const votes: Vote[] = await VoteModel.find(
                        { 
                            newsId: newsId,
                            status: "Complete"
                        }
                    );

                    console.log("Votes with status `complete`: ", votes);

                    for (const v of votes) {
                        const playerDoc = await PlayerModel.findById(v.playerId);
                        const voteDoc = await VoteModel.findById(v._id);

                        if (v.result == Boolean(verdict)) {
                            console.log("Winner Original player: ", playerDoc);
                            const winnerReward = (voteDoc.stakedToken + rewardInt);

                            const fnName = "transferReward";
                            const params = [
                                v._id.toString(),
                                v.playerId,
                                toBn(String(winnerReward), 10),
                                playerDoc.wallet
                            ]

                            await this.processWinnerReward(fnName, params, v._id, v.playerId, playerDoc.balance, playerDoc.credibility, winnerReward);
                        } else {
                            console.log("Loser Original player: ", playerDoc);
                            await this.processLoserReward(v._id, v.playerId, playerDoc.balance, playerDoc.credibility, v.stakedToken)
                        }

                        await NewsModel.findByIdAndUpdate(
                            newsId,
                            { expired: true }
                        );

                    }

                } catch (error) {
                    console.log("PlayerReward event's params: ", params);
                    console.error(error);
                }

            })
            this.contract.on("CreateVote", async (...params) => {
                /**
                 * This event emits a new vote is sent to blockchain. Player needs to deposit 1-5 tokens to transfer.
                 * This vote is sent from the Front-end cause we need Metamask wallet.
                 * @implements
                 * - Update status to "Complete". (This is useful for polling and create a non-blocking UI. See links below)
                 * @TODO
                 * Check if Player transfer less 0 or higher than 5 tokens. (Require and handle error in Front-end)
                 * @links 
                 * https://github.com/IBM/BlockchainDevelopmentDesignPatterns/blob/master/docs/design_patterns/UIResponsivenessPattern.md
                 */


                const [voteId, playerId, token, address] = params;
                // console.log("CreateVote event is trigger: ", params);

                try {
                    const updatedVote = await VoteModel.findByIdAndUpdate(
                        voteId,
                        { status: "Complete" },
                        { returnDocument: 'after' }
                    );

                    const updatedPlayer = await PlayerModel.findByIdAndUpdate(
                        playerId,
                        { $inc: { balance: -Number(fromBn(BigNumber.from(token), 10)) } },
                        { returnDocument: 'after' }
                    )

                    // console.log("Updated Player: ", updatedPlayer);

                } catch (error) {
                    console.log("CreateVote event's params: ", params)
                    console.error(error);
                }
            })

            this.contract.on("Register", async (...params) => {
                /**
                 * This event emits a new player is created. Each player by default receives default tokens (currently 40 tokens).
                 * @implements
                 * - Update player's `balance = default tokens`
                 * - Update player's `status = true` (Useful for polling)
                 * @TODO
                 * - Update player's `status = true`
                 * @links 
                 */

                // console.log("Register event is trigger: ");

                const [playerId, token, to] = params;

                try {
                    const newPlayer = await PlayerModel.findByIdAndUpdate(
                        playerId,
                        {
                            balance: Number(fromBn(BigNumber.from(token), 10)),
                            status: "Complete"
                        },
                        { returnDocument: 'after' }
                    );

                    // console.log("New player created: ", newPlayer)

                } catch (error) {
                    console.log("Register event's params: ", params)
                    console.error(error);
                }

            })
        })
    }
}
