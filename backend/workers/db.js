import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURL = process.env.MONGO_URI
        console.log(mongoURL)
        if (!mongoURL) {
            console.error("MongoURL not found in env")
            process.exit(1)
        }
        const connection = await mongoose.connect(mongoURL, {
            dbName: "linkfixerDB"
        })
        console.log(`MongoDB connected: ${connection.connection.host}`)
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

const WebsiteSchema = new mongoose.Schema({
    domain: {
        type: String,
        required: true,
    },
    checkedAt: {
        type: Date,
        default: Date.now,
    },
    brokenLinks: {
        type: Array,
        default: [],
    },
    checkedLinks: {
        type: Array,
        default: [],
    },
    sitemapLinks: {
        type: Array,
        default : []
    },
    userID: {
        type: String,
    },
    estimatedTime : {
        priority_low : {
            type : Number,
            default : -1
        },
        priority_mid : {
            type : Number,
            default : -1
        },
        priority_high : {
            type : Number,
            default : -1
        }
    },
    aiReport: {
        type: String
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export const Website = mongoose.model("Website", WebsiteSchema);
