import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already taken"],
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password length should be greater than 6 Characters"],
    },
    address: {
      type: String,
      required: [true, "address is required"],
    },
    city: {
      type: String,
      required: [true, "city is required"],
    },
    country: {
      type: String,
      required: [true, "Country name is required"],
    },
    phone: {
      type: String,
      required: [true, "phone no. is required"],
    },
    profilePic: {
      public_id: { type: String },
      url: { type: String },
    },
    answer: {
      type: String,
      required: [true, "answer is required"],
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

//hash func
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

//compare function
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//jwt
userSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const userModel = mongoose.model("Users", userSchema);
