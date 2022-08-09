import express, { Request, Response } from 'express';

import { NewsModel, PlayerModel, VoteModel } from "../models";
import { Player, News, Vote } from '../interfaces';
import { fakeNewsContract } from "../app";
import { fromBn, toBn } from 'evm-bn';
import { BigNumber } from 'ethers';
import { createPlayer, createVote, findNewsById, findNotVotedNewsByPlayerId, findPlayerByCredential, findVotesByPlayerId, updatePlayerById, updateVoteStatusById } from '../service';


export const setupRoute = (app: express.Application) => {
    app.post("/player/create", async (req: Request, res: Response) => {
        /**
         * Create a new player in backend and mint default tokens (40 tokens).
         * @params
         * body.player: Player
         * @implements 
         * - Read player object in body
         * - Send a signed transaction of `register(playerId, wallet, defaultToken)` function to blockchain
         * - If errors encountered, set Player's status to false.
         * @links 
         */
        const player: Player = {
            ...req.body.player,
            credibility: 100,
            balance: 40,
            status: "Processing"
        };

        try {
            const playerDoc = await createPlayer(player);

            if (playerDoc) {
                const fnName = "register";
                const params = [
                    playerDoc._id.toString(),
                    player.wallet,
                    toBn(String(playerDoc.balance), 10)
                ]

                const tx = await fakeNewsContract.sendSignedTx(fnName, params);
                if (!tx) {
                    console.log("Cannot send transaction with method name ", fnName, " with tx ", tx);
                    const updatedPlayer = await updatePlayerById(playerDoc.id);
                    
                    return res.status(500).json({
                        message: "Failed to create new account due to Smart contract",
                        result: updatedPlayer
                    })
                }

                return res.status(200).json({
                    message: "Our workers are working hard to mine some tokens for you. Please wait!",
                    result: playerDoc
                })
            } else {
                return res.status(500).json({
                    message: "Failed to create player due to MongoDB",
                })
            }

        } catch (error) {
            console.error(error);
        }
    });

    app.post("/player", async (req: Request, res: Response) => {
        /**
         * Get a player by username and password (For login only)
         * @implements 
         * - Read username and password from body.player
         * - Find in database and retrieve player
         * @links 
         */
        try {
            const body: Player = req.body.player;
            const doc = await findPlayerByCredential(body.userName, body.password)

            if (!doc) {
                return res.status(500).json({
                    message: "Wrong credentials."
                })
            }

            return res.status(200).json({
                result: doc
            })
        } catch (error) {
            return res.status(500).json({
                message: error
            })
        }
    });

    app.post("/news/notVoted/player", async (req: Request, res: Response) => {
        /**
         * Get notVotedNews by player
         * @implements 
         * - Read player from body
         * - Find the list of voted news, then find the news that `not in` this list
         * @TODO
         * @links 
         */
        try {
            const body = req.body.player;
            const player: Player = {
                ...body
            }

            const doc = await findNotVotedNewsByPlayerId(player._id);

            return res.status(200).json({
                message: "These news are not expired and not voted yet",
                result: doc
            })
        } catch (error) {
            return res.status(500).json({
                message: error
            })
        }
    });

    // app.post("/news/create", async (req: Request, res: Response) => {
    //     try {
    //         const body = req.body;
    //         const news: News = {
    //             ...body,
    //         }

    //         const id = await newsModel.collection.insertOne(news);

    //         return res.status(200).json(
    //             {
    //                 result: id
    //             })
    //     } catch (error) {
    //         return res.status(500).json({
    //             message: error
    //         })
    //     }
    // });

    // app.post("/vote/status", async (req: Request, res: Response) => {
    //     try {
    //         const body = req.body.vote;
    //         const vote: Vote = await VoteModel.findById(
    //             body._id,
    //             { status: 1 }
    //         );
    //         // console.log("vote: ", vote);

    //         if (vote.status == "Processing") {
    //             return res.status(404).json({
    //                 message: "Transaction has not been mined on blockchain yet. This process may take up to few minutes",
    //                 result: vote
    //             })
    //         } else if (vote.status == "Complete") {
    //             return res.status(200).json({
    //                 message: "Transaction has been created on blockchain",
    //                 result: vote
    //             })
    //         } else if (vote.status == "Failed") {
    //             return res.status(200).json({
    //                 message: "Failed to create a transaction on blockchain",
    //                 result: vote
    //             })
    //         } else {
    //             return res.status(500).json({
    //                 message: "Server error."
    //             })
    //         }

    //     } catch (error) {
    //         return res.status(500).json({
    //             message: error
    //         })
    //     }
    // })

    app.post("/vote/status/update", async (req: Request, res: Response) => {
        /**
         * Update the vote status (Used to update vote `status = "Failed"` since transaction is sent from Front-end 
         * for createVote())
         * @implements 
         * - Read vote from body
         * - Find the vote by id and update status
         * @TODO
         * Dont display `expired` news
         * @links 
         */
        try {
            const vote: Vote = req.body.vote;
            // console.log("Vote before: ", body)
            const doc = await updateVoteStatusById(vote._id, vote.status);

            return res.status(202).json({
                message: `Successfully updated vote with id=${vote._id} status`,
                result: doc
            })

        } catch (error) {
            return res.status(500).json({
                error: error,
                message: `Failed to update vote`
            })
        }
    })

    app.post("/vote/create", async (req: Request, res: Response) => {
        /**
         * Create a new vote in database 
         * @implements 
         * - Set status to Processing
         * - Deduct the player's balance in Database
         * @TODO
         * 
         * @links 
         */

        // console.log("req.body.vote: ", req.body.vote)
        const vote: Vote = {
            ...req.body.vote,
            status: "Processing",
            hasTransferred: "Processing",
            reward: 0
        }

        try {

            const doc = await createVote(vote);

            return res.status(202).json({
                message: `Successfully created new vote with id=${doc._id}`,
                result: doc
            })

        } catch (error) {
            return res.status(500).json({
                message: error,
                // message: `Failed to create vote id=${vote._id}`
            })
        }
    });

    app.post("/vote/player/", async (req: Request, res: Response) => {
        /**
         * Get vote by player and voted news for content to display on Transaction page 
         * @implements 
         * - Read player from body
         * - Find the list of voted news, then find the news that `not in` this list
         * @TODO
         * 
         * @links 
         */

        try {
            const body: Player = req.body.player;
            // console.log("Body: ", body);
            const votes: Vote[] = await findVotesByPlayerId(body._id);
            const news: News[] = [];

            for (const v of votes) {
                const doc = await findNewsById(v.newsId);
                news.push(doc);
            }

            // console.log("votes: ", votes);
            // console.log("news: ", news);

            return res.status(202).json({
                message: "Get votes",
                result: {
                    votes: votes,
                    news: news
                }
            })

        } catch (error) {
            return res.status(500).json({
                message: error
            })
        }
    });

    // app.get("/vote/:id", async (req: Request, res: Response) => {
    //     /**
    //      * Get vote by voteId
    //      */
    //     const id = req.params.id;
    //     try {
    //         const vote = await VoteModel.findById(id);

    //         // console.log("vote in /vote: ", vote)

    //         if (!vote) {
    //             return res.status(404).json({
    //                 message: `Cannot find vote with id=${id}`,
    //             })
    //         }

    //         return res.status(202).json({
    //             message: `Successfully get a vote with id: ${id}`,
    //             result: vote
    //         })

    //     } catch (error) {
    //         return res.status(500).json({
    //             error: error,
    //             message: `Failed to get vote with id: ${id}`,
    //         })
    //     }
    // });

}