import express from "express";

import EmergencyRequest
from "../models/EmergencyRequest.js";

import DonationHistory
from "../models/DonationHistory.js";

const router = express.Router();


// ======================================================
// HOSPITAL ANALYTICS
// ======================================================

router.get(
  "/hospital/:hospitalId",
  async (req, res) => {

    try {

      const hospitalId =
        req.params.hospitalId;


      const requests =
        await EmergencyRequest.find({

          hospitalId

        });


      const donations =
        await DonationHistory.find({

          hospitalId

        });


      const totalRequests =
        requests.length;


      const completedRequests =
        requests.filter(

          (r) =>
            r.acceptedDonors?.length > 0

        ).length;


      const pendingRequests =
        totalRequests -
        completedRequests;


      const totalDonations =
        donations.length;


      const bloodDemand = {

        "A+": 0,
        "A-": 0,

        "B+": 0,
        "B-": 0,

        "AB+": 0,
        "AB-": 0,

        "O+": 0,
        "O-": 0

      };


      requests.forEach(
        (request) => {

          if (

            bloodDemand[
              request.bloodGroup
            ] !== undefined

          ) {

            bloodDemand[
              request.bloodGroup
            ]++;

          }

        }
      );


      res.status(200).json({

        success: true,

        analytics: {

          totalRequests,

          completedRequests,

          pendingRequests,

          totalDonations,

          bloodDemand

        }

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  }
);

// ======================================================
// BLOOD DEMAND ANALYTICS
// ======================================================

router.get(
  "/blood-demand",

  async (req, res) => {

    try {

      const requests =
        await EmergencyRequest.find();

      const demandMap = {};

      requests.forEach(
        (request) => {

          if (
            !demandMap[
              request.bloodGroup
            ]
          ) {

            demandMap[
              request.bloodGroup
            ] = 0;

          }

          demandMap[
            request.bloodGroup
          ]++;

        }
      );

      const result =
        Object.entries(
          demandMap
        ).map(

          ([group, count]) => ({

            _id: group,

            count

          })

        );

      res.status(200).json(
        result
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  }
);

export default router;