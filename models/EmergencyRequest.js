import mongoose from "mongoose";

const emergencyRequestSchema =
  new mongoose.Schema(

    {

      // ======================================================
      // PATIENT DETAILS
      // ======================================================

      patientName: {
        type: String,
        required: true,
        trim: true
      },

      bloodGroup: {
        type: String,
        required: true,

        enum: [
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
          "O+",
          "O-"
        ]
      },

      unitsNeeded: {
        type: Number,
        required: true,
        min: 1
      },


      // ======================================================
      // HOSPITAL DETAILS
      // ======================================================

      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      hospitalName: {
        type: String,
        required: true,
        trim: true
      },

      location: {
        type: String,
        required: true,
        trim: true
      },


      // ======================================================
      // REQUEST PRIORITY
      // ======================================================

      urgency: {
        type: String,

        enum: [
          "normal",
          "urgent",
          "critical"
        ],

        default: "normal"
      },


      // ======================================================
      // REQUEST STATUS
      // ======================================================

      status: {
        type: String,

        enum: [
          "open",
          "matched",
          "fulfilled",
          "cancelled"
        ],

        default: "open"
      },


      // ======================================================
      // DONOR MATCHING
      // ======================================================

      acceptedDonors: [

        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }

      ],

      matchedDonors: [

        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }

      ],


      // ======================================================
      // COMPLETION INFO
      // ======================================================

      completedAt: {
        type: Date,
        default: null
      },

      fulfilledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },


      // ======================================================
      // EXTRA INFORMATION
      // ======================================================

      notes: {
        type: String,
        trim: true
      }

    },

    {
      timestamps: true
    }

  );


// ======================================================
// INDEXES
// ======================================================

emergencyRequestSchema.index({
  bloodGroup: 1
});

emergencyRequestSchema.index({
  urgency: 1
});

emergencyRequestSchema.index({
  status: 1
});

emergencyRequestSchema.index({
  hospitalId: 1
});


// ======================================================
// EXPORT MODEL
// ======================================================

const EmergencyRequest =
  mongoose.model(
    "EmergencyRequest",
    emergencyRequestSchema
  );

export default EmergencyRequest;


