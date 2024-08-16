const express = require("express");
const router = require("./router/index");
const app = express();
const connectDB = require("./configs/dbConnect");
const dotenv = require("dotenv");

// config environment variables
dotenv.config();

//kết nối tới mongoDB
connectDB();

app.use(express.json());
app.use("/", router);

app.get("/", (req, res) => {
  res.send("Hello, Node.js!");
});

app.get("/404", (req, res) => {
  return res.send("Không tìm thấy trang!");
});

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log("Server đang chạy trên port " + port);
});
