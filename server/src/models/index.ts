import mongoose, { Schema } from "mongoose";
import { Player, News, Vote} from "../interfaces";

const PlayerModel = mongoose.model<Player>(
    "Player", 
    new Schema({
        userName:  { type: String, require: true },
        password: { type: String, require: true },
        credibility: { type: Number, require: true },
        wallet: { type: String, require: true},
        balance: { type: Number, require: true },
        status: { type: String, require: true}
    })
);


const NewsModel = mongoose.model<News>(
    "News", 
    new Schema({
        content:  { type: String, require: true },
        author: { type: String, require: true},
        expired: { type: Boolean, require: true},
        score: { type: Number, require: false },
    })
);

const VoteModel =  mongoose.model<Vote>(
    "Vote", 
    new Schema({
        newsId:  { type: String, require: true },
        playerId: { type: String, required: true },
        result: { type: Boolean, require: true },
        stakedToken: { type: Number, require: true },
        status: { type: String, require: true },
        hasTransferred: { type: String, require: true },
        reward: { type: Number, require: true }
    })
);

export {NewsModel, PlayerModel, VoteModel};
