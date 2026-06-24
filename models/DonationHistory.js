import mongoose from "mongoose";

const donationHistorySchema =
  new mongoose.Schema(
    {
      donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      bloodGroup: {
        type: String,
        required: true
      },

      units: {
        type: Number,
        default: 1
      },

      donationDate: {
        type: Date,
        default: Date.now
      },

      pointsEarned: {
        type: Number,
        default: 100
      }
    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  "DonationHistory",
  donationHistorySchema
);

