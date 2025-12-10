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
  userID: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: `User`
  }],
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `User`
  },
  verifiedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: `User`
  }],
  domain: {
    type: String,
    required: true,
  },
  sitemapLinks: {
    type: Array,
    default: []
  },
  checks: [{
    checkedLinks: {
      type: Array,
      default: [],
    },
    aiReport: String,
    duration: Number,
    checkedAt: {
      type: Date,
      default: Date.now
    }
  }],
  options: {
    authentication: {
      type: new mongoose.Schema({
        cookies: {
          type: Map,
          of: String,
          default: {}
        },
        token: {
          type: [String],
          default: []
        }
      }, { _id: false })
    }
  },
  estimatedTime: {
    priority_low: { type: Number, default: -1 },
    priority_mid: { type: Number, default: -1 },
    priority_high: { type: Number, default: -1 }
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });


export const Website = mongoose.model("Website", WebsiteSchema);
