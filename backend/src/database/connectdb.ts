import mongoose from "mongoose";
import { env } from "../config/env.js";
export const connectDB = async()=>{
    try{
        const mongoURL = env.MONGO_URI
        if(!mongoURL){
            console.error("MongoURL not found in env")
            process.exit(1)
        }
        const connection = await mongoose.connect(mongoURL, {
            dbName : "linkfixerDB"
        })
        console.log(`MongoDB connected`)
    }
    catch(error){
        console.log(`Error: ${(error as Error).message}`);
        process.exit(1);
    }
}