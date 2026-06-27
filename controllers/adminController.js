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

export const getAllUsers = async (req, res) => {

  

  try {

    const {
      search = "",
      role = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // ======================================================
    // SEARCH
    // ======================================================

    if (search) {

      query.$or = [

        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },

        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },

      ];

    }

    // ======================================================
    // ROLE FILTER
    // ======================================================

    if (role) {

      query.role = role;

    }

    // ======================================================
    // STATUS FILTER
    // ======================================================

    if (status === "active") {

      query.isBlocked = false;

    }

    if (status === "blocked") {

      query.isBlocked = true;

    }

    // ======================================================
    // PAGINATION
    // ======================================================

    const currentPage = parseInt(page);

    const perPage = parseInt(limit);

    const skip = (currentPage - 1) * perPage;

    // ======================================================
    // FETCH USERS
    // ======================================================

    const users = await User.find(query)

      .select(
        "name email phone role location isBlocked isVerified createdAt"
      )

      .sort({
        createdAt: -1,
      })

      .skip(skip)

      .limit(perPage);

    // ======================================================
    // TOTAL USERS
    // ======================================================

    const totalUsers = await User.countDocuments(query);

    const totalPages = Math.ceil(totalUsers / perPage);

    // ======================================================
    // RESPONSE
    // ======================================================

    res.status(200).json({

      success: true,

      users,

      pagination: {

        totalUsers,

        totalPages,

        currentPage,

        perPage,

        hasNextPage: currentPage < totalPages,

        hasPrevPage: currentPage > 1,

      },

    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Unable to fetch users."

    });

  }
};

export const getUserById = async (req, res) => {

  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User not found"

      });

    }

    res.status(200).json({

      success: true,

      user

    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Unable to fetch user."

    });

  }

};

// ======================================================
// UPDATE USER (ADMIN)
// ======================================================

export const updateUser = async (req, res) => {
    console.log("Updating User:", req.body);
  try {

    const {
      name,
      email,
      phone,
      location,
      bloodGroup,
      role,
      isBlocked
    } = req.body;

const updateData = {
  name,
  email,
  phone,
  location,
  role,
  isBlocked,
};

// Only include bloodGroup if it's provided
if (bloodGroup) {
  updateData.bloodGroup = bloodGroup;
}

const updatedUser = await User.findByIdAndUpdate(
  req.params.id,
  updateData,
  {
    returnDocument: "after",
    runValidators: true,
  }
).select("-password");

    if (!updatedUser) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    res.status(200).json({

      success: true,

      message: "User updated successfully.",

      user: updatedUser

    });

} catch (error) {

  console.error("Update User Error:", error);
  console.log(error.message);

  res.status(500).json({
    success: false,
    message: error.message
  });

}

};

// ======================================================
// BLOCK / UNBLOCK USER
// ======================================================

export const toggleUserStatus = async (req, res) => {

  try {

    const { isBlocked } = req.body;

    const updatedUser = await User.findByIdAndUpdate(

      req.params.id,

      {
        isBlocked
      },

      {
        returnDocument: "after"
      }

    ).select("-password");

    if (!updatedUser) {

      return res.status(404).json({

        success: false,

        message: "User not found"

      });

    }

    res.status(200).json({

      success: true,

      message: isBlocked
        ? "User blocked successfully."
        : "User unblocked successfully.",

      user: updatedUser

    });

  }

  catch(error){

    console.error(error);

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};


// ======================================================
// DELETE USER
// ======================================================

export const deleteUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User not found."

      });

    }

    // ======================================================
    // PREVENT DELETING YOURSELF
    // ======================================================

    if (req.user && req.user.id === req.params.id) {

      return res.status(400).json({

        success: false,

        message: "You cannot delete your own account."

      });

    }

    // ======================================================
    // PREVENT DELETING THE LAST ADMIN
    // ======================================================

    if (user.role === "admin") {

     const adminCount = await User.countDocuments({

        role: "admin"

      });

      if (adminCount === 1) {

        return res.status(400).json({

          success: false,

          message: "The last administrator cannot be deleted."

        });

      }

    }

    // ======================================================
    // DELETE USER
    // ======================================================

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({

      success: true,

      message: "User deleted successfully."

    });

  }

  catch (error) {

    console.error("Delete User Error:", error);

    return res.status(500).json({

      success: false,

      message: "Unable to delete user."

    });

  }

};


