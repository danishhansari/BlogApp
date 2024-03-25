import { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import { toast } from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentsCard = ({ index, leftVal, commentsData }) => {
  let {
    commented_by: {
      personal_info: { profile_img, fullname, username: commented_by_user },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentsData;

  const {
    blog,
    blog: {
      comments,
      comments: { results: commentsArr },
      author: {
        personal_info: { username: blog_author },
      },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const [isReplying, setReplying] = useState(false);
  const {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentsArr[startingPoint].childrenLevel >= commentsData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch (error) {
      startingPoint = undefined;
    }
  };

  const removeCommentsCard = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint].childrenLevel >
        commentsData[index].childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);

        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex !== undefined) {
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children.filter((child) => child !== _id);

        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }
      commentsArr.splice(index, 1);
    }
    if (commentsData.childrenLevel === 0 && isDelete) {
      setTotalParentCommentsLoaded((prev) => prev - 1);
    }
    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments - commentsData.childrenLevel === 0 && isDelete
            ? 1
            : 0,
      },
    });
  };

  const hideReplies = () => {
    commentsData.isReplyLoaded = false;
    removeCommentsCard(index + 1);
  };

  const loadReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentsArr[currentIndex].children.length) {
      hideReplies();
      axios
        .post(`${import.meta.env.VITE_SERVER_LOCATION}/get-replies`, {
          _id: commentsArr[currentIndex]._id,
          skip,
        })
        .then(({ data: { replies } }) => {
          commentsArr[currentIndex].isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel =
              commentsArr[currentIndex].childrenLevel + 1;

            commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }
          setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("Please login first to reply");
    }
    setReplying((prev) => !prev);
  };

  const deleteComment = (e) => {
    e.target.setAttribute("disabled", true);

    axios
      .post(
        `${import.meta.env.VITE_SERVER_LOCATION}/delete-comment`,
        {
          _id,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentsCard(index + 1, true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const LoadMoreRepliesButton = () => {
    let parentIndex = getParentIndex();
    let button = (
      <button
        onClick={() =>
          loadReplies({
            skip: index - parentIndex,
            currentIndex: parentIndex,
          })
        }
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
      >
        Load More Replies
      </button>
    );
    if (
      commentsArr[index + 1]?.childrenLevel < commentsArr[index]?.childrenLevel
    ) {
      if (index - parentIndex < commentsArr[parentIndex].children.length) {
        return button;
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentsArr[parentIndex].children.length) {
          return button;
        }
      }
    }
  };

  return (
    <>
      <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
        <div className="my-5 p-6 rounded-md border border-grey">
          <div className="flex gap-3 items-center mb-8">
            <img
              src={profile_img}
              className="w-6 h-6 rounded-full"
              alt={`${commented_by_user} profile image`}
            />
            <p className="line-clamp-1">
              {fullname} @{commented_by_user}
            </p>
            <p className="min-w-fit">{getDay(commentedAt)}</p>
          </div>
          <p className="font-gelasio text-xl ml-3">{comment}</p>

          <div className="flex gap-5 items-center mt-3">
            {commentsData.isReplyLoaded ? (
              <button
                className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
                onClick={hideReplies}
              >
                <i className="fi fi-rs-comment-dots"></i> Hide Reply
              </button>
            ) : (
              <>
                <button
                  className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
                  onClick={loadReplies}
                >
                  <i className="fi fi-rs-comment-dots"></i> {children.length}
                  Reply
                </button>
              </>
            )}

            <button className="underline" onClick={handleReplyClick}>
              Reply
            </button>

            {username == commented_by_user || username == blog_author ? (
              <button
                className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 flex items-center"
                onClick={deleteComment}
              >
                <i className="fi fi-rr-trash pointer-events-none"></i>
              </button>
            ) : (
              ""
            )}
          </div>
          {isReplying ? (
            <div className="mt-8">
              <CommentField
                action="reply"
                setReplying={setReplying}
                index={index}
                replyingTo={_id}
              />
            </div>
          ) : (
            ""
          )}
        </div>

        <LoadMoreRepliesButton />
      </div>
    </>
  );
};

export default CommentsCard;
