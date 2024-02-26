import express from "express";
import mongoose from "mongoose";
import env from "dotenv";
import { connectDB } from "./db/index.js";
env.config({
  path: "./.env",
});

const app = express();

const PORT = process.env.PORT || 8000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("App is running fine in the port 3000");
    });
  })
  .catch((err) => {
    console.log("MongoDB failed to connected");
  });

app.post("/signup", (req, res) => {
  res.json(req.body);
});
