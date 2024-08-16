const mongoose = require("mongoose");
const schema = mongoose.Schema;
const accountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: schema.Types.ObjectId,
      ref: "role",
      required: true,
    },
    favouriteProduct: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["inactive", "active"],
      default: "inactive",
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("account", accountSchema);

module.exports = Account;
