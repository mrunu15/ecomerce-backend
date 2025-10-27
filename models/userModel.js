import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your first name"],
      maxLength: [25, "Invalid name. Please enter a name with fewer than 25 characters"],
      minLength: [3, "Name should contain more than 3 characters"],
    },
    lastName: {
      type: String,
      maxLength: [25, "Invalid last name. Please enter a name with fewer than 25 characters"],
      default: "", // optional field
      validate: {
        validator: function (v) {
          if (!v) return true; // allow empty string
          return v.length >= 1; // only check if not empty
        },
        message: "Last name should contain at least 1 character",
      },
    },

    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "Password should be greater than 8 characters"],
      select: false,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          // Only validate if a value is provided
          return !v || /^\+?\d{7,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      default: "", // optional, avoids undefined
    },

    address: {
      type: String,
      maxLength: [100, "Address cannot exceed 100 characters"],
      default: "",
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.verifyPassword = async function (userEnteredPassword) {
  return await bcryptjs.compare(userEnteredPassword, this.password);
};

// generating password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

export default mongoose.model("User", userSchema);
