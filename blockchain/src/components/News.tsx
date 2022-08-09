import React, { FunctionComponent, useEffect, useState } from "react";
import { NewsType, PlayerType, VoteType } from "../interfaces";
import { Link } from "react-router-dom";
import { AiFillDislike, AiFillLike } from "react-icons/ai";

import { BigNumber, Contract, Overrides } from "ethers";
import { toBn } from "evm-bn";
import { bounce } from 'react-animations';
import { StyleSheet } from "aphrodite";
import { NonceManager } from "../contract";
import { TwitterApi } from "twitter-api-v2";
import useInterval from "./useInterval";

type Props = {
    contract: Contract | null,
    nonceManager: NonceManager | null,
    sessionPlayer: PlayerType | null,
    polling: boolean,
    setPolling: (polling: boolean) => void;
}

const styles = StyleSheet.create({
    fadeIn: {
        animationName: bounce,
        animationDuration: '2s'
    }
})

const News: FunctionComponent<Props> = ({ contract, nonceManager, sessionPlayer, polling, setPolling }) => {

    const [count, setCount] = useState(0);
    const [newsToDisplay, setNewsToDisplay] = useState<NewsType[]>([]);

    useEffect(() => {
        // console.log("Use effect in News: ");
        const setStateHome = async () => {
            setNewsToDisplay([...await fetchNews(sessionPlayer)]);
        }

        setStateHome();

    }, [sessionPlayer])
    //     setRefresh(false);
    // }, [refresh])

    useInterval(
        () => {
            // Your custom logic here
            if (count > 2) {
                setPolling(false);
                setCount(0)
            }

            const setStateHome = async () => {
                setNewsToDisplay([...await fetchNews(sessionPlayer)]);
            }
    
            setStateHome();
            setCount(prev => prev + 1)
        },
        // Delay in milliseconds or null to stop it
        polling ? 5000 : null,
    )

    const fetchNews = async (player: PlayerType | null): Promise<NewsType[]> => {
        try {
            if (!player) {
                return [];
            }

            const res = await fetch('http://localhost:4005/news/notVoted/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ player: player })
            });

            // console.log("Twitter result: ", result);
            const body = await res.json();
            const result = body.result as NewsType[];
            return result;

        } catch (error) {
            console.error(error);
            return [];
        }
    }


    const updateFailedVote = async (vote: VoteType) => {
        const res = await fetch('http://localhost:4005/vote/status/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vote: { ...vote, status: "Failed" }
            })
        })
    }

    const handleClick = async (e: any, index: number) => {
        const { name, value } = e.target;
        const news: NewsType = newsToDisplay[index];
        const result: boolean = e.target.innerHTML.toLowerCase() == "fake" ? true : false;

        if (!news.token) {
            alert("Please select the amount of tokens")
            return;
        }

        if (sessionPlayer) {
            try {
                const vote: VoteType = {
                    newsId: news._id as any,
                    playerId: sessionPlayer._id as any,
                    result: result,
                    stakedToken: news.token
                }

                const voteRes = await fetch('http://localhost:4005/vote/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ vote: vote })
                })

                const voteBody = await voteRes.json();
                const voteResult = voteBody.result;
                const token: BigNumber = toBn(`${voteResult.stakedToken}`, 10)

                const approvedVote: VoteType = {
                    ...vote,
                    _id: voteResult._id
                }

                try {

                    if (contract && nonceManager) {
                        const overrides: Overrides = {
                            nonce: await nonceManager.getNonce()
                        }

                        const tx = await contract.createVote(approvedVote._id, approvedVote.playerId, approvedVote.newsId, token, overrides);
                        console.log("Tx: ", tx);

                        // If no problem, blockchain emits an event to backend and update the database.
                        // polling will try to get this status.
                        alert("Waiting for transaction to be mined! This process can take up to few minutes");
                    } else {
                        console.log("No contract to create transaction: ");
                    }

                } catch (error: any) {
                    alert(error);
                    await updateFailedVote(approvedVote);
                    return;
                }

            } catch (error) {
                console.error(error);
            }
        } else {
            alert("Please login...");
            window.location.assign("/login");
        }

    };

    const handleInput = (e: any, index: number) => {
        const { name, value } = e.target;
        console.log("Input value: ", value);
        setNewsToDisplay((prev: any) => {
            const copy: NewsType[] = [...prev];
            copy[index] = {
                ...prev[index],
                token: Number(value)
            }
            return copy;
        })
    }

    // console.log("Length: ", newsToDisplay.length);
    if (sessionPlayer && sessionPlayer.credibility >= 1) {
        // console.log("sessionPlayer.credibility: ", sessionPlayer.credibility);
        return (
            <>
                {
                    newsToDisplay.map((news, index) => {
                        return (
                            <div className="row" style={styles.fadeIn} key={index}>
                                <div className="col-lg-12">
                                    <div className="card shadow mb-4">
                                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                            <div className="col-8">
                                                <h6 className="m-0 font-weight-bold text-primary">@{news.author}</h6>
                                            </div>
                                            <div className="col-auto">
                                                <h6 className="m-0">Confidence: {news.score}</h6>
                                            </div>

                                        </div>
                                        <div className="card-body">
                                            <div>{news.content}</div>
                                        </div>
                                        <div className="card-footer">
                                            <form>
                                                <div className="row">
                                                    <div className="form-group col-lg-4">
                                                        <button type="button" name="fake" className="btn btn-danger btn-block" onClick={(e) => handleClick(e, index)}>
                                                            Fake
                                                        </button>
                                                    </div>

                                                    <div className="form-group col-lg-4">
                                                        <button type="button" name="real" className="btn btn-success btn-block" onClick={(e) => handleClick(e, index)}>
                                                            Real
                                                        </button>
                                                    </div>
                                                    <div className="form-group col-lg-4">
                                                        <select className="form-control" onChange={(e) => handleInput(e, index)}>
                                                            <option selected disabled>Select amount of tokens</option>
                                                            <option>1</option>
                                                            <option>2</option>
                                                            <option>3</option>
                                                            <option>4</option>
                                                            <option>5</option>
                                                        </select>

                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }

            </>
        );
    } if (sessionPlayer && sessionPlayer.credibility < 1) {
        return (<div>You have been banned due to spamming behavior</div>);
    } else {
        return (<div>No news to display. Please login</div>);
    }

}

export default News;