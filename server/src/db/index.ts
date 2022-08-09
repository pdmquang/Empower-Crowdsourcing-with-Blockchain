import mongoose from "mongoose";

export default async function setupDatabase() {
    const mongo_url = "mongodb://localhost:27017/FakeNews";
    // options: ;
    try {
        const conn = await mongoose.connect(mongo_url);
        console.log("Connected successfully to mongodb");
    } catch (err) {
        console.log(`Failed to connect to MongoDB ... ${err}`)
    }
}
