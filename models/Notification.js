import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(

    {

      recipient: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

      },

      senderName: {

        type: String

      },

      message: {

        type: String

      },

      // Emergency Request Link

      requestId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "EmergencyRequest"

      },

      // pending | accepted | rejected

      status: {

        type: String,

        enum: [

          "pending",

          "accepted",

          "rejected"

        ],

        default: "pending"

      },

      isRead: {

        type: Boolean,

        default: false

      }

    },

    {

      timestamps: true

    }

  );

export default mongoose.model(
  "Notification",
  notificationSchema
);