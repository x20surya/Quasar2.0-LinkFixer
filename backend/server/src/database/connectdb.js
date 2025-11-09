import mongoose from "mongoose";
export const connectDB=async()=>{
    try{
        const mongoURL = process.env.MONGO_URI
        if(!mongoURL){
            console.error("MongoURL not found in env")
            process.exit(1)
        }
        const connection=await mongoose.connect(mongoURL, {
            dbName : "linkfixerDB"
        })
        console.log(`MongoDB connected: ${connection.connection.host}`)
    }
    catch(error){
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}