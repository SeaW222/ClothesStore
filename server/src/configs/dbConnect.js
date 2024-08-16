const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Kết nối database thành công");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
module.exports = connectDB;
