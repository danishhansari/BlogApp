import express, { json } from "express";
import env from "dotenv";
import { connectDB } from "./db/index.js";
import bcrypt from "bcrypt";

env.config({
  path: "./.env",
});

const app = express();
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("App is running fine in the port 8000");
    });
  })
  .catch((err) => {
    console.log("MongoDB failed to connected");
  });
app.use(json());
app.post("/signup", (req, res) => {
  const { fullname, email, password } = req.body;
  if (fullname.length < 3) {
    return res.status(403).json("FullName must be at least 3 letters long");
  }
  if (!email.length) {
    return res.status(403).json("error, Email cannot be empty");
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json("Email is invalid");
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password should be 6 to 20 character password long with a numeric, 1 lowercase and 1 uppercase letter",
    });
  }

  return res.status(200).json("status: Okay");
});
