import express from "express";

import User from "../models/User.js";

import EmergencyRequest from "../models/EmergencyRequest.js";

import compatibility from "./utils/bloodCompatibility.js";
import Notification from "../models/Notification.js";

const router = express.Router();


// ======================================================
// CREATE EMERGENCY REQUEST
// ======================================================

router.post(
  "/create-request",
  async (req, res) => {

    try {

      const {
        patientName,
        bloodGroup,
        unitsNeeded,
        hospitalId,
        hospitalName,
        location,
        urgency,
        notes
      } = req.body;


      // ======================================================
      // CREATE REQUEST
      // ======================================================

      const newRequest =
        await EmergencyRequest.create({

          patientName,

          bloodGroup,

          unitsNeeded,

          hospitalId,

          hospitalName,

          location,

          urgency,

          notes

        });


      // ======================================================
      // SMART DONOR MATCHING
      // ======================================================

      const compatibleBloodGroups =
        compatibility[bloodGroup];


      console.log(
        "🩸 COMPATIBLE BLOOD GROUPS:",
        compatibleBloodGroups
      );


      const matchedDonors =
        await User.find({

          bloodGroup: {
            $in: compatibleBloodGroups
          },

          isAvailable: true,

          role: "donor"

        });


      console.log(
        "✅ MATCHED DONORS:",
        matchedDonors.length
      );


      // ======================================================
      // SAVE MATCHED DONORS
      // ======================================================

newRequest.matchedDonors =
  matchedDonors.map(
    (donor) => donor._id
  );

await newRequest.save();


// ======================================================
// SAVE TEST NOTIFICATION
// ======================================================

for (const donor of matchedDonors) {

await Notification.create({

  recipient: donor._id,

  senderName: hospitalName,

  message:
    `${hospitalName} urgently needs ${bloodGroup} blood`,

  requestId:
    newRequest._id,

  status:
    "pending"

});
  const onlineUsers =
  req.app.get(
    "onlineUsers"
  );

for (const donor of matchedDonors) {

  const socketId =
    onlineUsers[
      donor._id.toString()
    ];

  console.log(
    "DONOR:",
    donor.name
  );

  console.log(
    "SOCKET:",
    socketId
  );

  if (socketId) {

    req.io
      .to(socketId)
      .emit(
        "newNotification",
        {

          title:
            "Emergency Blood Request",

          message:
            `${hospitalName} urgently needs ${bloodGroup} blood.`,

          hospitalName,

          bloodGroup

        }
      );

    console.log(
      "🚨 NOTIFICATION SENT"
    );

  }

}

}

console.log(
  "🔔 Notification Saved"
);


      // ======================================================
      // TARGETED REALTIME NOTIFICATIONS
      // ======================================================

      const onlineUsers =
        req.app.get("onlineUsers");


      console.log(
        "🌐 ONLINE USERS:",
        onlineUsers
      );


      matchedDonors.forEach((donor) => {

        console.log(
          "👤 MATCHED DONOR:",
          donor.name
        );

        console.log(
          "🆔 DONOR ID:",
          donor._id.toString()
        );


        const socketId =
          onlineUsers[
            donor._id.toString()
          ];


        console.log(
          "🔌 FOUND SOCKET:",
          socketId
        );


        // ======================================================
        // SEND REALTIME EVENT
        // ======================================================

        if (socketId) {

          console.log(
            "🚨 SENDING REALTIME ALERT"
          );

          req.io.to(socketId).emit(

            "bloodRequestNotification",

            {

              request: newRequest,

              hospitalName,

              urgency,

              bloodGroup,

              patientName,

              location

            }

          );

        } else {

          console.log(
            "❌ DONOR OFFLINE"
          );

        }

      });


      // ======================================================
      // RESPONSE
      // ======================================================

      res.status(201).json({

        success: true,

        message:
          "Emergency request created successfully",

        matchedDonorsCount:
          matchedDonors.length,

        request: newRequest

      });

    } catch (error) {

      console.error(
        "❌ CREATE REQUEST ERROR:",
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
// GET HOSPITAL REQUESTS
// ======================================================

router.get(
  "/requests/:hospitalId",
  async (req, res) => {

    try {

      const requests =
        await EmergencyRequest.find({

          hospitalId:
            req.params.hospitalId

        })

        .populate(
          "matchedDonors",
          "name bloodGroup phone location"
        )

        .populate(
          "acceptedDonors",
          "name bloodGroup phone location"
        )

        .sort({
          createdAt: -1
        });


      res.status(200).json({

        success: true,

        requests

      });

    } catch (error) {

      console.error(
        "❌ FETCH REQUEST ERROR:",
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
// ACCEPT DONOR
// ======================================================

router.patch(
"/accept-donor/:requestId",
async (req, res) => {

try {

  const { donorId } =
    req.body;

  const request =
    await EmergencyRequest.findById(
      req.params.requestId
    );

  if (!request) {

    return res.status(404).json({

      success: false,

      message:
        "Request not found"

    });

  }

  if (
    !request.acceptedDonors.includes(
      donorId
    )
  ) {

request.acceptedDonors.push(
  donorId
);

request.status =
  "matched";

await request.save();
  }

  await request.save();

  const donor =
    await User.findById(
      donorId
    );

  req.io.emit(

    "donorAcceptedRequest",

    {

      requestId:
        request._id,

      donor: {

        _id:
          donor._id,

        name:
          donor.name,

        bloodGroup:
          donor.bloodGroup,

        phone:
          donor.phone,

        location:
          donor.location

      }

    }

  );

  res.status(200).json({

    success: true,

    message:
      "Donor accepted successfully",

    request

  });

} catch (error) {

  console.error(
    "❌ ACCEPT DONOR ERROR:",
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
// DELETE REQUEST
// ======================================================

router.delete(
  "/delete/:id",
  async (req, res) => {

    try {

      await EmergencyRequest.findByIdAndDelete(
        req.params.id
      );


      res.status(200).json({

        success: true,

        message:
          "Request deleted successfully"

      });

    } catch (error) {

      console.error(
        "❌ DELETE REQUEST ERROR:",
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

router.patch(
  "/complete-donation/:requestId",

  async (req, res) => {

    try {

      const { donorId } =
        req.body;

      const request =
        await EmergencyRequest.findById(
          req.params.requestId
        );

      if (!request) {

        return res.status(404).json({
          success: false,
          message: "Request not found"
        });

      }

      const donor =
        await User.findById(
          donorId
        );

      if (!donor) {

        return res.status(404).json({
          success: false,
          message: "Donor not found"
        });

      }

      const today =
        new Date();

      const nextEligibleDate =
        new Date();

      nextEligibleDate.setDate(
        today.getDate() + 90
      );

      donor.totalDonations += 1;
      donor.rewardPoints += 200;

      donor.lastDonated =
        today;

      donor.nextEligibleDate =
        nextEligibleDate;

      await donor.save();

      request.status = "fulfilled";

request.completedAt = new Date();

request.fulfilledBy = donorId;

await request.save();

      request.status =
        "fulfilled";

      request.completedAt =
        new Date();

      request.fulfilledBy =
        donorId;

      await request.save();

      res.status(200).json({

        success: true,

        message:
          "Donation completed successfully"

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
export default router;

