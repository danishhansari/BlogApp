import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";

export const blogStructure = {
  title: "",
  description: "",
  content: [],
  author: { personal_info: {} },
  banner: "",
  publishedAt: "",
};

export const blogContext = createContext();

const BlogPage = () => {
  const { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [similarBlog, setSimilarBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
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
      })
      .then(({ data: { blog } }) => {
        axios
          .post(`${import.meta.env.VITE_SERVER_LOCATION}/search-blogs`, {
            tag: blog.tags[0],
            limit: 6,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => {
            console.log(blog.tags);
            setSimilarBlog(data.blogs);
            console.log("I am data blogs", data.blogs);
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
    fetchBlogs();
  }, []);
  return (
    <>
      <AnimationWrapper>
        {loading ? (
          <Loader />
        ) : (
          <blogContext.Provider value={{ blog, setBlog }}>
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

              {/* Blog content over here */}

              <BlogInteraction />
            </div>
          </blogContext.Provider>
        )}
      </AnimationWrapper>
    </>
  );
};
export default BlogPage;
