import express, { json } from "express";
import env from "dotenv";
import { connectDB } from "./db/index.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import aws from "aws-sdk";
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";

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
  const access_token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
  return {
    access_token: access_token,
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

app.post("/change-password", verifyJWT, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (
    !passwordRegex.test(newPassword) ||
    !passwordRegex.test(currentPassword)
  ) {
    return res.status(403).json({
      error:
        "Password should be 6 to 20 character password long with a numeric, 1 lowercase and 1 uppercase letter",
    });
  }

  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res.status(403).json({
          error:
            "You can't change account password because logged in through google",
        });
      }

      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error:
                "Some error occured while changing the password, please try again later",
            });
          }
          if (!result) {
            return res
              .status(403)
              .json({ error: "Incorrect current password" });
          }

          bcrypt.hash(newPassword, 10, (err, hashed_password) => {
            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashed_password }
            )
              .then((u) => {
                return res.status(200).json({ status: "password changed" });
              })
              .catch((err) => {
                return res.status(500).json({
                  error:
                    "Some error occured while saving new password, please try again later",
                });
              });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: "User not found" });
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

app.post("/update-profile-img", verifyJWT, (req, res) => {
  const { url } = req.body;
  User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
    .then(() => {
      return res.status(200).json({ profile_img: url });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/update-profile", verifyJWT, (req, res) => {
  const { username, bio, social_links } = req.body;
  const bioLimit = 150;

  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: "Username should be atleast 3 letters long" });
  }
  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `Bio should not be more than ${bioLimit} characters` });
  }

  const socialLinksArr = Object.keys(social_links);

  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        const hostName = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostName.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] !== "website"
        ) {
          return res.status(403).json({
            error: `${socialLinksArr[i]} link is invalid. You must enter a full link`,
          });
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "You must provide full social links with http(s) included",
    });
  }

  const updateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };
  User.findOneAndUpdate({ _id: req.user }, updateObj, { runValidator: true })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(403).json({ error: "username is already taken" });
      }
      return res.status(500).json({ error: err.message });
    });
});

app.post("/create-blog", verifyJWT, (req, res) => {
  const authorId = req.user;
  let { title, banner, content, tags, description, draft, id } = req.body;

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

    if (!content.length) {
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

  let blog_id =
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() +
      "-" +
      nanoid();

  if (id) {
    Blog.findOneAndUpdate(
      { blog_id },
      {
        title,
        description,
        content,
        banner,
        tags,
        draft: draft ? draft : false,
      }
    )
      .then(() => {
        return res.status(200).json({ id: blog_id });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  } else {
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
  }
});

app.post("/search-blogs", (req, res) => {
  const { tag, page, query, author, limit, eliminate_blog } = req.body;

  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
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
  let { tag, query, author } = req.body;
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
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

app.post("/get-profile", (req, res) => {
  let { username } = req.body;

  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updateAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/get-blog", (req, res) => {
  const { blog_id, draft, mode } = req.body;
  let incrementVal = mode !== "edit" ? 1 : 0;
  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } }
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .select(
      "title description content banner activity publishedAt blog_id tags comments"
    )
    .then((blog) => {
      User.findOneAndUpdate({
        "personal_info.username": blog.author.personal_info.username,
        $inc: { "account_info.total_reads": incrementVal },
      }).catch((err) => {
        return res.status(500).json({ error: err.message });
      });

      if (blog.draft && !draft) {
        return res.status(500).json({ error: "You cannot access draft blogs" });
      }

      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/like-blog", verifyJWT, (req, res) => {
  const user_id = req.user;
  const { _id, islikedByUser } = req.body;

  let incrementVal = !islikedByUser ? 1 : -1;

  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } }
  ).then((blog) => {
    if (!islikedByUser) {
      let like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      like.save().then((notification) => {
        return res.status(200).json({ liked_by_user: true });
      });
    } else {
      Notification.findOneAndDelete({
        user: user_id,
        blog: _id,
        type: "like",
      })
        .then((data) => {
          (data) => {
            return res.status(200).json({ liked_by_user: false });
          };
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  });
});

app.post("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id } = req.body;

  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/add-comment", verifyJWT, (req, res) => {
  const user_id = req.user;
  const { _id, comment, blog_author, replying_to, notification_id } = req.body;

  if (!comment.length) {
    return res.status(403).json({ error: "Write something to leave comment" });
  }
  // Creating a comment doc
  const commentObj = {
    blog_id: _id,
    comment,
    blog_author,
    commented_by: user_id,
  };
  if (replying_to) {
    commentObj.parent = replying_to;
  }

  new Comment(commentObj).save().then(async (commentFile) => {
    const { comment, commentedAt, children } = commentFile;

    Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    ).then((blog) => {
      console.log("New Comment Created");
    });

    const notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;
      await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      ).then((replyingToCommentDoc) => {
        notificationObj.notification_for = replyingToCommentDoc.commented_by;
      });

      if (notification_id) {
        Notification.findOneAndUpdate(
          { _id: notification_id },
          { reply: commentFile._id }
        )
          .then((notification) => {
            return res.status(200).json(notification);
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
    }

    new Notification(notificationObj)
      .save()
      .then((notification) => console.log("New Notification created"));

    return res
      .status(200)
      .json({ comment, commentedAt, _id: commentFile._id, user_id, children });
  });
});

app.post("/get-blog-comments", (req, res) => {
  const { blog_id, skip } = req.body;
  let maxLimit = 5;

  Comment.find({ blog_id, isReply: false })
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .skip(skip)
    .limit(maxLimit)
    .sort({ commentedAt: -1 })
    .then((comment) => {
      return res.status(200).json(comment);
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/get-replies", (req, res) => {
  const { _id, skip } = req.body;
  let maxLimit = 5;
  Comment.findOne({ _id })
    .populate({
      path: "children",
      options: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select:
          "personal_info.profile_img personal_info.fullname personal_info.username",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id })
    .then((comment) => {
      if (comment.parent) {
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } }
        )
          .then((data) => {
            console.log("comment delete from parent");
          })
          .catch((err) => {
            console.log(err);
          });
      }
      Notification.findOneAndDelete({ comment: _id }).then((notification) =>
        console.log("comment notification deleted")
      );

      Notification.findOneAndUpdate(
        { reply: _id },
        { $unset: { reply: 1 } }
      ).then((notification) => console.log("reply notification deleted"));

      Blog.findOneAndUpdate(
        { _id: comment.blog_id },
        {
          $pull: { comments: _id },
          $inc: { "activity.total_comments": -1 },
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        }
      ).then((blog) => {
        if (comment.children_length) {
          comment.children.map((replies) => {
            deleteComments(replies);
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

app.post("/delete-comment", verifyJWT, (req, res) => {
  const user_id = req.user;

  const { _id } = req.body;

  Comment.findOne({ _id }).then((comment) => {
    if (user_id == comment.commented_by || user_id == comment.blog_author) {
      deleteComments(_id);
      return res.status(200).json({ status: "done" });
    } else {
      return res.status(403).json({ error: "You cannot delete this comment" });
    }
  });
});

app.get("/new-notification", verifyJWT, (req, res) => {
  const user_id = req.user;

  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id },
  })
    .then((result) => {
      if (result) {
        return res.status(200).json({ new_notification_available: true });
      } else {
        return res.status(200).json({ new_notification_available: false });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/notifications", verifyJWT, (req, res) => {
  const user_id = req.user;
  const { page, filter, deletedDocCount } = req.body;
  const maxLimit = 10;

  const findQuery = { notification_for: user_id, user: { $ne: user_id } };

  let skipDocs = (page - 1) * maxLimit;

  if (filter !== "all") {
    findQuery.type = filter;
  }
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate(
      "user",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then((notification) => {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => console.log("notification seen"));
      return res.status(200).json({ notification });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/all-notifications-count", verifyJWT, (req, res) => {
  const user_id = req.user;
  const { filter } = req.body;
  const findQuery = { notification_for: user_id, user: { $ne: user_id } };

  if (filter !== "all") {
    findQuery.type = filter;
  }

  Notification.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/user-written-blogs", verifyJWT, (req, res) => {
  const user_id = req.user;

  const { page, draft, query, deletedDocCount } = req.body;

  const maxLimit = 5;

  let skipDocs = (page - 1) * maxLimit;

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select("title banner publishedAt blog_id activity description draft -_id ")
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/user-written-blogs-count", verifyJWT, (req, res) => {
  let user_id = req.user;
  const { draft, query } = req.body;

  Blog.countDocuments({
    author: user_id,
    draft,
    title: new RegExp(query * "i"),
  })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/delete-blog", verifyJWT, (req, res) => {
  const user_id = req.user;
  const { blog_id } = req.body;

  Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      Notification.deleteMany({ blog: blog._id }).then((data) =>
        console.log("Notification deleted")
      );

      Comment.deleteMany({ blog: blog._id }).then((data) =>
        console.log("comments deleted")
      );

      User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } }
      ).then((user) => console.log("Blog deleted"));

      return res.status(200).json({ status: "done" });
    })

    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});
