// interface MongoInsert {
//     acknowledged: boolean,
//     insertedId: string
// }

interface PlayerType {
    _id?: string,
    userName: string,
    password: string,
    credibility: number,
    wallet: string,
    balance: number
}

interface NewsType {
    _id?: string,
    content: string,
    author: string,
    token: number,
    score: number,
}

interface VoteType {
    _id?: string,
    newsId: string,
    playerId: string,
    result: boolean,
    stakedToken: number,
    status?: string,
    hasTransfered?: boolean;
}

export { PlayerType, NewsType, VoteType }