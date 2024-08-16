const mongoose = require("mongoose");
const schema = mongoose.Schema;
const roleSchema = new schema(
  {
    name: {
      type: String,
      enum: ["admin", "customer", "employee"],
      default: "customer",
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("role", roleSchema);
