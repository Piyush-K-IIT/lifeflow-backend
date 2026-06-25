import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";
import DonationHistory from "../models/DonationHistory.js";

export const getDashboardStats = async (req, res) => {
  try {

    const [
      totalUsers,
      totalDonors,
      totalHospitals,
      activeRequests,
      completedDonations,
      pendingHospitals
    ] = await Promise.all([

      User.countDocuments(),

      User.countDocuments({
        role: "donor"
      }),

      User.countDocuments({
        role: "hospital"
      }),

      BloodRequest.countDocuments({
        status: {
          $in: ["Open", "Accepted"]
        }
      }),

      DonationHistory.countDocuments(),

      User.countDocuments({
        role: "hospital",
        "hospitalDetails.isVerified": false
      })

    ]);

    res.status(200).json({

      success: true,

      overview: {

        totalUsers,

        totalDonors,

        totalHospitals,

        activeRequests,

        completedDonations,

        pendingHospitals

      }

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Unable to fetch dashboard statistics."

    });

  }
};