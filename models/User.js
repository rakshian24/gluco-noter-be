import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "User name is required!"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minLength: [5, "Password is shorter than the minimum length(5)"],
    },
    confirmPassword: {
      type: String,
      required: function () {
        if (!this.isModified("password")) {
          return false;
        }
        return [true, "Please confirm your password!"];
      },
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords don't match",
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

userSchema.virtual("user", {
  ref: "GlucoseReading",
  localField: "_id",
  foreignField: "user",
  justOne: false,
});

// Encrypt password using bcrypt before saving it to DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;
});

// Match user entered password to the hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
