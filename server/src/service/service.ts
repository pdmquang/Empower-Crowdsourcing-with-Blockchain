import { NewsModel, PlayerModel, VoteModel } from "../models";
import { Player, News, Vote } from '../interfaces';

export const createPlayer = async(player: Player) => {
    try {
        return await new PlayerModel(player).save();
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const updatePlayerById = async(id) => {
    return await PlayerModel.findByIdAndUpdate(
        id,
        { status: "Failed" },
        { returnDocument: 'after' }
    );
}

export const findPlayerById = async (id) => {
    return await PlayerModel.findById(id);
}

export const findPlayerByCredential = async(userName, password) => {
    return await PlayerModel.findOne({
        userName: userName,
        password: password,
        // status: "Complete"
    });
}

export const findNotVotedNewsByPlayerId = async(playerId) => {
    const votes = await VoteModel.find({ playerId: playerId, status: { $in: ["Complete"] } }, { newsId: 1, _id: 0 });
    const votedNews = votes.map(item => item.newsId);
    return await NewsModel.find({ _id: { $nin: votedNews } });
}

export const findVotesByNewsId = async(newsId) => {
    return await VoteModel.find(
        { newsId: newsId }
    );
}

export const updateVoteStatusById = async(id, status) => {
    return await VoteModel.findByIdAndUpdate(
        id,
        { status: status },
        { returnDocument: 'after' }
    );
}

export const createVote = async(vote: Vote) => {
    return await new VoteModel(vote).save();
}

export const findVotesByPlayerId = async(playerId) => {
    return await VoteModel.find({ playerId: playerId, status: "Complete" });
}

export const createNews = async(news: News) => {
    return await new NewsModel(news).save();
}

export const findNewsById = async(id) => {
    return await NewsModel.findById(id);
}