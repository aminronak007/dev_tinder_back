const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 15,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email id is not valid: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a Strong Password: " + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Photo url is not valid: " + value);
        }
      },
    },
    about: {
      type: String,
      default: "This is a default about of the user.",
    },
    skills: {
      type: [String],
      validate: {
        validator: function (value) {
          // Check for duplicates in the array
          return Array.isArray(value) && new Set(value).size === value.length;
        },
        message: "Skills array must not contain duplicate values.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
