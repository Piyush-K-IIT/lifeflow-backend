const express = require("express");
const router = express.Router();
const Request = require("../models/Request");

router.get("/blood-demand", async (req, res) => {
  try {
    const data = await Request.aggregate([
      {
        $group: {
          _id: "$bloodGroup",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;