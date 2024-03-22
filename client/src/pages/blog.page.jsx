import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer, {
  fetchComments,
} from "../components/comments.component";

export const blogStructure = {
  title: "",
  description: "",
  content: [],
  // comments: [],
  author: { personal_info: {} },
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext();

const BlogPage = () => {
  const { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [loading, setLoading] = useState(true);
  const [similarBlog, setSimilarBlog] = useState(null);
  const [islikedByUser, setLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  let {
    title,
    content,
    description,
    banner,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    publishedAt,
  } = blog;

  const fetchBlogs = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_LOCATION}/get-blog`, {
        blog_id,
        mode: "publish",
        draft: false,
      })
      .then(async ({ data: { blog } }) => {
        let res;
        //   axios
        //     .post(`http://localhost:8000/search-blogs`, {
        //       limit: 6,
        //       tag: "test",
        //       eliminate_blog: "sdvfbgnh-rpkJJ0qEEkxiCp6qJFX_A",
        //     })
        // .then(({ data }) => {
        //   setSimilarBlog(data.blogs);
        //   console.log(data.blogs);
        // });
        blog.comments = await fetchComments({
          blog_id: blog._id,
          setParentCommentCountFn: setTotalParentCommentsLoaded,
        });
        setBlog(blog);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetStates();
    fetchBlogs();
  }, [blog_id]);

  const resetStates = () => {
    setBlog(blogStructure);
    setSimilarBlog(null);
    setLoading(true);
    setLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  };
  return (
    <>
      <AnimationWrapper>
        {loading ? (
          <Loader />
        ) : (
          <BlogContext.Provider
            value={{
              blog,
              setBlog,
              islikedByUser,
              setLikedByUser,
              commentsWrapper,
              setCommentsWrapper,
              totalParentCommentsLoaded,
              setTotalParentCommentsLoaded,
            }}
          >
            <CommentsContainer />
            <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
              <img src={banner} className="aspect-video" />

              <div className="mt-12">
                <h2>{title}</h2>
                <div className="flex max-sm:flex-col justify-between my-8">
                  <div className="flex gap-5 items-start">
                    <img
                      src={profile_img}
                      alt={author_username}
                      className="w-12 h-12 rounded-full"
                    />
                    <p>
                      {fullname}
                      <br />
                      <Link
                        to={`/user/${author_username}`}
                        className="underline"
                      >
                        @{author_username}
                      </Link>
                    </p>
                  </div>
                  <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                    Published on {getDay(publishedAt)}
                  </p>
                </div>
              </div>

              <BlogInteraction />

              <div className="my-12 font-gelasio blog-page-content">
                {blog.content[0]?.blocks.map((block, i) => {
                  return (
                    <div key={i} className="my-4">
                      <BlogContent block={block} />
                    </div>
                  );
                })}
              </div>

              <BlogInteraction />

              {similarBlog !== null && similarBlog.length ? (
                <>
                  <h1 className="text-2xl mt-14 mb-10 font-medium">
                    Similar component exists
                  </h1>

                  {similarBlog.map((blog, index) => {
                    const {
                      author: { personal_info },
                    } = blog;
                    return (
                      <AnimationWrapper
                        key={index}
                        transition={{ duration: 1, delay: index * 0.08 }}
                      >
                        <BlogPostCard content={blog} author={personal_info} />
                      </AnimationWrapper>
                    );
                  })}
                </>
              ) : (
                <>
                  <h1>No similar blog are there</h1>
                </>
              )}
            </div>
          </BlogContext.Provider>
        )}
      </AnimationWrapper>
    </>
  );
};
export default BlogPage;
