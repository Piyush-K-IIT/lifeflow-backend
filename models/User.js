import mongoose from "mongoose";

const userSchema = new mongoose.Schema(

  {

    // ======================================================
    // BASIC USER INFORMATION
    // ======================================================

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\d{10}$/,
        "Please provide valid 10 digit phone number"
      ]
    },

    // ======================================================
    // BLOOD DONATION INFORMATION
    // ======================================================

bloodGroup: {
  type: String,

  enum: [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
  ],

  default: undefined,

  required: function () {
    return this.role === "donor";
  }
},

    totalDonations: {
      type: Number,
      default: 0
    },

    rewardPoints: {
      type: Number,
      default: 0
    },

    lastDonated: {
      type: Date,
      default: null
    },

    nextEligibleDate: {
      type: Date,
      default: null
    },

    isAvailable: {
      type: Boolean,
      default: true
    },

    emergencyAvailable: {
      type: Boolean,
      default: false
    },

    // ======================================================
    // LOCATION
    // ======================================================

    location: {
      type: String,
      required: true,
      trim: true
    },

    city: {
      type: String,
      trim: true
    },

    state: {
      type: String,
      trim: true
    },

    coordinates: {

      latitude: {
        type: Number
      },

      longitude: {
        type: Number
      }

    },

    // ======================================================
    // USER ROLE SYSTEM
    // ======================================================

    role: {
      type: String,
      enum: [
        "donor",
        "hospital",
        "admin"
      ],
      default: "donor"
    },

    // ======================================================
    // HOSPITAL DETAILS
    // ======================================================

    hospitalDetails: {

      hospitalName: {
        type: String,
        trim: true
      },

      address: {
        type: String,
        trim: true
      },

      licenseId: {
        type: String,
        trim: true
      },

      isVerified: {
        type: Boolean,
        default: false
      }

    },

    // ======================================================
    // PROFILE SETTINGS
    // ======================================================

    avatar: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 250
    },

    // ======================================================
    // ACCOUNT STATUS
    // ======================================================

    isVerified: {
      type: Boolean,
      default: false
    },

    isBlocked: {
      type: Boolean,
      default: false
    }

  },

  {
    timestamps: true
  }

);


// ======================================================
// INDEXES
// ======================================================

userSchema.index({
  bloodGroup: 1
});

userSchema.index({
  location: 1
});

userSchema.index({
  role: 1
});

userSchema.index({
  rewardPoints: -1
});

userSchema.index({
  totalDonations: -1
});


// ======================================================
// EXPORT
// ======================================================

const User = mongoose.model(
  "User",
  userSchema
);

export default User;

