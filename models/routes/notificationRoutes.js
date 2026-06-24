import express from "express";
import Notification from "../Notification.js";

const router = express.Router();

router.patch(
  "/reject/:id",
  async (req, res) => {

    try {

      const notification =
        await Notification.findByIdAndUpdate(

          req.params.id,

          {
            status: "rejected"
          },

          {
            new: true
          }

        );

      res.status(200).json({

        success: true,

        notification

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);

router.patch(
  "/read/:id",
  async (req, res) => {

    try {

      const notification =
        await Notification.findByIdAndUpdate(

          req.params.id,

          {
            isRead: true
          },

          {
            new: true
          }

        );

      res.status(200).json({

        success: true,

        notification

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);

// ======================================================
// GET USER NOTIFICATIONS
// ======================================================

router.get("/:userId", async (req, res) => {

  try {

    const notifications =
      await Notification.find({

        recipient:
          req.params.userId

      })

      .sort({
        createdAt: -1
      });

    res.status(200).json({

      success: true,

      notifications

    });

  } catch (error) {

    console.error(
      "Fetch Notification Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


// ======================================================
// MARK AS READ
// ======================================================

router.patch(
  "/read/:notificationId",

  async (req, res) => {

    try {

      const notification =
        await Notification.findByIdAndUpdate(

          req.params.notificationId,

          {
            isRead: true
          },

          {
            new: true
          }

        );

      res.status(200).json({

        success: true,

        notification

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

router.patch(
  "/read-all/:userId",
  async (req, res) => {

    try {

      await Notification.updateMany(

        {
          recipient:
            req.params.userId,

          isRead: false
        },

        {
          isRead: true
        }

      );

      res.status(200).json({

        success: true,

        message:
          "All notifications marked as read"

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