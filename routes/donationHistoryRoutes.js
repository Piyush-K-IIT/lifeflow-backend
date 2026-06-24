import express from "express";
import DonationHistory from "../models/DonationHistory.js";
import User from "../models/User.js";

const router = express.Router();


// ======================================================
// COMPLETE DONATION
// ======================================================

router.post(
  "/complete",
  async (req, res) => {

    try {

      const {
        donorId,
        hospitalId,
        bloodGroup,
        units
      } = req.body;


      // VALIDATION

      if (
        !donorId ||
        !hospitalId ||
        !bloodGroup ||
        !units
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Missing required fields"

        });

      }


      // CREATE DONATION RECORD

      const donation =
        await DonationHistory.create({

          donorId,

          hospitalId,

          bloodGroup,

          units,

          pointsEarned:
            Number(units) * 100

        });


      // UPDATE DONOR STATS

      const donor =
        await User.findById(
          donorId
        );


      if (donor) {

        donor.rewardPoints =
          (donor.rewardPoints || 0)
          +
          Number(units) * 100;


        donor.totalDonations =
          (donor.totalDonations || 0)
          + 1;


        donor.lastDonated =
          new Date();


        donor.nextEligibleDate =
          new Date(

            Date.now()

            +

            90 * 24 * 60 * 60 * 1000

          );


        await donor.save();

      }


      res.status(201).json({

        success: true,

        message:
          "Donation completed successfully",

        donation

      });

    } catch (error) {

      console.error(
        "Complete Donation Error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  }
);


// ======================================================
// ADD DONATION RECORD (MANUAL)
// ======================================================

router.post(
  "/add",
  async (req, res) => {

    try {

      const donation =
        await DonationHistory.create(
          req.body
        );

      res.status(201).json({

        success: true,

        donation

      });

    } catch (error) {

      console.error(
        "Add Donation Error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  }
);


// ======================================================
// GET DONOR HISTORY
// ======================================================

router.get(
  "/donor/:donorId",
  async (req, res) => {

    try {

      const history =
        await DonationHistory.find({

          donorId:
            req.params.donorId

        })

        .populate(
          "hospitalId",
          "name email phone"
        )

        .sort({

          donationDate: -1

        });


      res.status(200).json({

        success: true,

        history

      });

    } catch (error) {

      console.error(
        "Get Donor History Error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  }
);


// ======================================================
// GET DONATION STATS
// ======================================================

router.get(
  "/stats/:donorId",
  async (req, res) => {

    try {

      const donor =
        await User.findById(
          req.params.donorId
        );

      if (!donor) {

        return res.status(404).json({

          success: false,

          message:
            "Donor not found"

        });

      }


      res.status(200).json({

        success: true,

        stats: {

          totalDonations:
            donor.totalDonations || 0,

          rewardPoints:
            donor.rewardPoints || 0,

          livesSaved:
            (donor.totalDonations || 0)
            * 3,

          lastDonated:
            donor.lastDonated,

          nextEligibleDate:
            donor.nextEligibleDate

        }

      });

    } catch (error) {

      console.error(
        "Donation Stats Error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  }
);

// ======================================================
// GET HOSPITAL DONATIONS
// ======================================================

router.get(
  "/hospital/:hospitalId",
  async (req, res) => {

    try {

      const donations =
        await DonationHistory.find({

          hospitalId:
            req.params.hospitalId

        })

        .populate(
          "donorId",
          "name email phone bloodGroup"
        )

        .sort({
          donationDate: -1
        });

      res.json({

        success: true,

        donations

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);

export default router;