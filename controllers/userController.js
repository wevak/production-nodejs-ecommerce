import { userModel } from "../models/userModel.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, address, phone, city, country, answer } =
      req.body;

    //validation
    if (!name) {
      return res.status(500).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!email) {
      return res.status(500).send({
        success: false,
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(500).send({
        success: false,
        message: "Password is required",
      });
    }
    if (!address) {
      return res.status(500).send({
        success: false,
        message: "Address is required",
      });
    }
    if (!phone) {
      return res.status(500).send({
        success: false,
        message: "Phone is required",
      });
    }
    if (!city) {
      return res.status(500).send({
        success: false,
        message: "City is required",
      });
    }
    if (!country) {
      return res.status(500).send({
        success: false,
        message: "Country is required",
      });
    }
    if (!answer) {
      return res.status(500).send({
        success: false,
        message: "answer is required",
      });
    }

    //existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "User exists with the email",
      });
    }

    const user = await userModel.create({
      name,
      email,
      password,
      address,
      phone,
      city,
      country,
      answer,
    });

    res.status(201).send({
      success: true,
      message: "Registration success, please login",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error registering user",
      error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "please add email and password",
      });
    }

    // user check
    const user = await userModel.findOne({ email });

    // user validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user doesn't exist",
      });
    }

    // password check
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid username or password",
      });
    }

    //token
    const token = user.generateToken();

    user.password = undefined;
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login successfull",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "invalid user name or password",
      error,
    });
  }
};

// user profile get
export const getUserProfileController = async (req, res) => {
  try {
    // debugger;
    const user = await userModel.findById(req.user._id);
    // user.password = undefined;
    res.status(200).send({
      success: true,
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error getting user profile",
      error,
    });
  }
};

// user logout
export const userLogoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in user logout",
      error,
    });
  }
};

// user profile update
export const userProfileUpdateController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, email, address, city, country, phone } = req.body;

    // validation & update
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (address) {
      user.address = address;
    }
    if (city) {
      user.city = city;
    }
    if (country) {
      user.country = country;
    }
    if (phone) {
      user.phone = phone;
    }

    //user save
    await user.save();

    res.status(200).send({
      success: true,
      message: "user profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in user profile update",
      error,
    });
  }
};

//user password update
export const passwordUpdateController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    //validation
    if (!oldPassword || !newPassword) {
      res.status(500).send({
        success: false,
        message: "please provide old or new password",
      });
    }

    //old password check
    const isMatch = await user.comparePassword(oldPassword);
    //validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "invalid old password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).send({
      success: true,
      message: "password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in user password update",
      error,
    });
  }
};

//user profile pic update
export const profilePicUpdateController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    //file get from client
    const file = getDataUri(req.file);

    //previous image deletion
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);

    //profile pic new update
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    //changes save
    await user.save();

    res.status(200).send({
      success: true,
      message: "profile pic updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error updating profile pic",
      error,
    });
  }
};

//forgot password
export const passwordResetController = async (req, res) => {
  try {
    //user email || new password || answer
    const { email, newPassword, answer } = req.body;

    //user input validation
    if (!email || !newPassword || !answer) {
      return res.status(500).send({
        success: false,
        message: "please provide all fields",
      });
    }

    //finding user
    const user = await userModel.findOne({ email: email, answer: answer });
    //user validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "invalid user or answer",
      });
    }

    // if (user.password === newPassword) { //password compare
    //   return res.status(500).send({
    //     success: false,
    //     message: "new password should not be same as old password",
    //   });
    // }

    user.password = newPassword;
    await user.save();

    res.status(200).send({
      success: true,
      message: "your password has been reset, please login",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "error resetting password",
      error,
    });
  }
};
