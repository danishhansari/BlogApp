import express, { json } from "express";
import env from "dotenv";
import { connectDB } from "./db/index.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import aws from "aws-sdk";

import User from "./Schema/User.js";

env.config({
  path: "./.env",
});

const app = express();

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const PORT = process.env.PORT || 8000;

app.use(json());
app.use(cors());

const formatDataToSend = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);
  return {
    accessToken: accessToken,
    fullname: user.personal_info.fullname,
    username: user.personal_info.username,
    profile_img: user.personal_info.profile_img,
  };
};

const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "blog-aapp",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpg",
  });
};

const generateUser = async (email) => {
  let username = email.split("@")[0];
  let isUsernameExists = await User.exists({
    "personal_info.username": username,
  }).then((res) => {
    return res;
  });
  isUsernameExists ? (username += nanoid().substring(0, 5)) : (username += "");
  return username;
};

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("App is running fine in the port 8000");
    });
  })
  .catch((err) => {
    console.log("MongoDB failed to connected", err.message);
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});

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
  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    const username = await generateUser(email);
    console.log(username);
    console.log(hashedPassword);
    const user = new User({
      personal_info: { fullname, email, password: hashedPassword, username },
    });
    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDataToSend(u));
      })
      .catch((err) => {
        if (err.code === 11000) {
          return res.status(500).json("Email already exists");
        }
        return res.status(500).json({ "Internal Server Error": err.message });
      });
  });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  await User.findOne({ "personal_info.email": email })
    .then((user) => {
      console.log(user);
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }
      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res
            .status(403)
            .json({ error: "Error occurred while login please try again" });
        }
        if (!result) {
          return res.status(403).json({ error: "Incorrect password " });
        } else {
          return res.status(200).json(formatDataToSend(user));
        }
      });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json("Internal Server Error");
    });
});

app.get("/get-upload-url", (req, res) => {
  generateUploadURL()
    .then((url) => res.status(200).json({ uploadUrl: url }))
    .catch((err) => {
      console.log(err.message);
    });
});
