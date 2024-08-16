const express = require("express");
const cors = require("cors"); // Import cors
const router = require("./router/index");
const app = express();
const connectDB = require("./configs/dbConnect");
const dotenv = require("dotenv");

// Config environment variables
dotenv.config();

// Connect to MongoDB
connectDB();
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, // Allow credentials (cookies)
};
app.use(cors(corsOptions)); // Enable CORS
app.use(express.json());
app.use("/", router);

app.get("/", (req, res) => {
  res.send("Hello, Node.js!");
});

app.get("/404", (req, res) => {
  return res.send("Không tìm thấy trang!");
});

const port = process.env.PORT || 5001;
const server = app.listen(port, () => {
  console.log("Server đang chạy trên port " + port);
});
