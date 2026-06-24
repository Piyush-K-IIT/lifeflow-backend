import mongoose from "mongoose";

const bloodInventorySchema =
  new mongoose.Schema(
    {
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
      },

      A_POSITIVE: {
        type: Number,
        default: 0
      },

      A_NEGATIVE: {
        type: Number,
        default: 0
      },

      B_POSITIVE: {
        type: Number,
        default: 0
      },

      B_NEGATIVE: {
        type: Number,
        default: 0
      },

      AB_POSITIVE: {
        type: Number,
        default: 0
      },

      AB_NEGATIVE: {
        type: Number,
        default: 0
      },

      O_POSITIVE: {
        type: Number,
        default: 0
      },

      O_NEGATIVE: {
        type: Number,
        default: 0
      }

    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  "BloodInventory",
  bloodInventorySchema
);


