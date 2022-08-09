import { FunctionComponent, useEffect, useState } from "react";
import { AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import { PlayerType, NewsType, VoteType } from "../interfaces";

type Props = {
    sessionPlayer: PlayerType | null
};

const Transaction: FunctionComponent<Props> = ({ sessionPlayer }) => {
    // Transaction page
    const [votedNews, setVotedNews] = useState<NewsType[]>([]);
    const [votes, setVotes] = useState<VoteType[]>([]);

    useEffect(() => {
        console.log("Use effect in Transaction: ", sessionPlayer);
        const setStateHome = async () => {
            if (sessionPlayer) {
                setVotedNews([...await fetchVotedNews(sessionPlayer)]);
                setVotes([...await fetchVotes(sessionPlayer)]);
            }
        }

        setStateHome();
    }, [sessionPlayer])
    // setRefresh(false);
    // }, [refresh])

    const fetchVotes = async (player: PlayerType): Promise<VoteType[]> => {
        try {
            const res = await fetch('http://localhost:4005/vote/player/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ player: player })
            });

            const body = await res.json();
            const votes = body.result.votes as VoteType[];
            // const votedNews = body.result.news as NewsType[];
            return votes

        } catch (error) {
            console.error(error);
            return [];
        }
    }

    const fetchVotedNews = async (player: PlayerType): Promise<NewsType[]> => {
        try {
            const res = await fetch('http://localhost:4005/vote/player/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ player: player })
            });

            const body = await res.json();
            const votedNews = body.result.news as NewsType[];

            return votedNews

        } catch (error) {
            console.error(error);
            return [];
        }
    }

    return (
        <>
            {
                votes.map((vote, index) => {
                    const news = votedNews.filter(item => item._id == vote.newsId)[0]
                    return (
                        <div className="row" key={index}>
                            <div className="col-lg-12">
                                <div className="card shadow mb-4">
                                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                        <h6 className="m-0 font-weight-bold text-primary">@{news.author}</h6>
                                        <div>
                                            {vote.result ?
                                                <span className="btn btn-danger" style={{pointerEvents: "none"}}>
                                                    {/* <AiOutlineDislike /> */}
                                                    Fake
                                                </span> :
                                                <span className="btn btn-success" style={{pointerEvents: "none"}}>
                                                    Real
                                                </span>
                                            }
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div>{news.content}</div>
                                    </div>

                                    <div className="card-footer">
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">You staked: {vote.stakedToken}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })
            }

        </>
    );
}

{/* <div className="nk-widget-content" key={index}>
                            <div className="nk-widget-match">
                                <span className="nk-widget-match-left">
                                    <span className="nk-match-score">Ongoing</span>
                                </span>
                                <div className="nk-gap-1"></div>
                                <h6 className="nk-post-title">
                                    <a href="blog-article.html">
                                        {news.content}
                                    </a>
                                </h6>
                                <b>{vote.result ? "Fake" : "Real"}</b>
                            </div>
                        </div> */}


export default Transaction;