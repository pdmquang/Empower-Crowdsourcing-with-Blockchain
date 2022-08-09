import { ObjectId } from "mongoose"

interface Player {
    _id?: ObjectId,
    userName: string,
    password: string,
    credibility: number,
    wallet: string,
    balance: number,
    status: string
}

interface News {
    _id?: ObjectId,
    content: string,
    author: string,
    score: number,
    expired: boolean,
}

interface Vote {
    _id?: ObjectId,
    newsId: string,
    playerId: string,
    result: boolean,
    stakedToken: number,
    hasTransferred: string,
    reward: number,
    status: string,
}

export { Player, News, Vote }