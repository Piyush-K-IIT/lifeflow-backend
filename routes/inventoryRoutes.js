import express from "express";
import BloodInventory from "../models/BloodInventory.js";

const router = express.Router();


// ======================================================
// CREATE INVENTORY
// ======================================================

router.post(
  "/create",
  async (req, res) => {

    try {

      const {
        hospitalId
      } = req.body;


      const existingInventory =
        await BloodInventory.findOne({
          hospitalId
        });


      if (existingInventory) {

        return res.status(400).json({

          success: false,

          message:
            "Inventory already exists"

        });

      }


      const inventory =
        await BloodInventory.create({

          hospitalId

        });


      res.status(201).json({

        success: true,

        message:
          "Inventory created successfully",

        inventory

      });

    } catch (error) {

      console.error(
        "Create Inventory Error:",
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
// GET INVENTORY
// ======================================================

router.get(
  "/:hospitalId",
  async (req, res) => {

    try {

      const inventory =
        await BloodInventory.findOne({

          hospitalId:
            req.params.hospitalId

        });


      if (!inventory) {

        return res.status(404).json({

          success: false,

          message:
            "Inventory not found"

        });

      }


      res.status(200).json({

        success: true,

        inventory

      });

    } catch (error) {

      console.error(
        "Fetch Inventory Error:",
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
// UPDATE INVENTORY
// ======================================================

router.patch(
  "/update/:hospitalId",
  async (req, res) => {

    try {

      const inventory =
        await BloodInventory.findOne({

          hospitalId:
            req.params.hospitalId

        });


      if (!inventory) {

        return res.status(404).json({

          success: false,

          message:
            "Inventory not found"

        });

      }


      Object.keys(req.body)
        .forEach((key) => {

          inventory[key] =
            req.body[key];

        });


      await inventory.save();


      res.status(200).json({

        success: true,

        message:
          "Inventory updated successfully",

        inventory

      });

    } catch (error) {

      console.error(
        "Update Inventory Error:",
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
// ADD BLOOD UNITS
// ======================================================

router.patch(
  "/add/:hospitalId",
  async (req, res) => {

    try {

      const {
        bloodGroup,
        units
      } = req.body;


      const inventory =
        await BloodInventory.findOne({

          hospitalId:
            req.params.hospitalId

        });


      if (!inventory) {

        return res.status(404).json({

          success: false,

          message:
            "Inventory not found"

        });

      }


      inventory[bloodGroup] +=
        Number(units);

      await inventory.save();


      res.status(200).json({

        success: true,

        message:
          "Blood units added",

        inventory

      });

    } catch (error) {

      console.error(
        "Add Blood Error:",
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
// REMOVE BLOOD UNITS
// ======================================================

router.patch(
  "/remove/:hospitalId",
  async (req, res) => {

    try {

      const {
        bloodGroup,
        units
      } = req.body;


      const inventory =
        await BloodInventory.findOne({

          hospitalId:
            req.params.hospitalId

        });


      if (!inventory) {

        return res.status(404).json({

          success: false,

          message:
            "Inventory not found"

        });

      }


      inventory[bloodGroup] =
        Math.max(

          0,

          inventory[bloodGroup] -
          Number(units)

        );


      await inventory.save();


      res.status(200).json({

        success: true,

        message:
          "Blood units removed",

        inventory

      });

    } catch (error) {

      console.error(
        "Remove Blood Error:",
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
// LOW STOCK ALERTS
// ======================================================

router.get(
  "/alerts/:hospitalId",
  async (req, res) => {

    try {

      const inventory =
        await BloodInventory.findOne({

          hospitalId:
            req.params.hospitalId

        });


      if (!inventory) {

        return res.status(404).json({

          success: false,

          message:
            "Inventory not found"

        });

      }


      const alerts = [];


      const groups = [

        "A_POSITIVE",
        "A_NEGATIVE",

        "B_POSITIVE",
        "B_NEGATIVE",

        "AB_POSITIVE",
        "AB_NEGATIVE",

        "O_POSITIVE",
        "O_NEGATIVE"

      ];


      groups.forEach(
        (group) => {

          if (
            inventory[group] <= 5
          ) {

            alerts.push({

              bloodGroup:
                group,

              units:
                inventory[group]

            });

          }

        }
      );


      res.status(200).json({

        success: true,

        alerts

      });

    } catch (error) {

      console.error(
        "Low Stock Alert Error:",
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

export default router;