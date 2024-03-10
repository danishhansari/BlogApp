import express, { json } from "express";
import env from "dotenv";
import { connectDB } from "./db/index.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import aws from "aws-sdk";
import Blog from "./Schema/Blog.js";

import User from "./Schema/User.js";

env.config({
  path: "./.env",
});

const app = express();

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const PORT = process.env.PORT || 8000;

app.use(json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) {
    res.status(403).json({ error: "No access token" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user.id;
    next();
  });
};

const formatDataToSend = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
  return {
    accessToken: accessToken,
    fullname: user.personal_info.fullname,
    username: user.personal_info.username,
    profile_img: user.personal_info.profile_img,
  };
};

const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}.jpeg`;

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
  console.log(fullname, email, password);

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

app.post("/latest-blogs", (req, res) => {
  let { page } = req.body;
  let maxLimit = 5;
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.fullname personal_info.username -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title description banner activity tags publishedAt -_id ")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((data) => {
      return res.status(200).json({ blogs: data });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/all-latest-blogs-count", (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err });
    });
});

app.get("/trending-blogs", (req, res) => {
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.fullname personal_info.username -_id"
    )
    .sort({
      "activity.total_read": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/create-blog", verifyJWT, (req, res) => {
  const authorId = req.user;
  let { title, banner, content, tags, description, draft } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  if (!draft) {
    if (!description || description.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }

    if (!banner) {
      return res
        .status(403)
        .json({ error: "You must provide blog banner to publish it" });
    }

    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, Maximum 10",
      });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  const blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() +
    "-" +
    nanoid();

  const blog = new Blog({
    title,
    description,
    author: authorId,
    blog_id,
    content,
    banner,
    tags,
    draft: Boolean(draft),
  });

  blog
    .save()
    .then((blog) => {
      let increment = draft ? 0 : 1;
      User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": increment },
          $push: { blogs: blog._id },
        }
      )
        .then((user) => {
          return res.status(200).json({ id: blog.blog_id });
        })
        .catch((err) => {
          return res.status(500).json({
            error: `Failed to update total posts number ${err.message}`,
          });
        });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/search-blogs", (req, res) => {
  const { tag, page, query } = req.body;

  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  }

  let maxLimit = 5;

  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.fullname personal_info.username -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title description banner activity tags publishedAt -_id ")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((data) => {
      console.log(data);
      return res.status(200).json({ blogs: data });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/search-blogs-count", (req, res) => {
  let { tag, query } = req.body;
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  }

  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/search-users", (req, res) => {
  let { query } = req.body;

  User.find({ "personal_info.username": new RegExp(query, "i") })
    .limit(50)
    .select(
      "personal_info.fullname personal_info.username personal_info.profile_img -_id"
    )
    .then((user) => {
      return res.status(200).json({ user });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});