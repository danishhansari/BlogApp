import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);

  const fetchLatestBlog = () => {
    console.log(`${import.meta.env.VITE_SERVER_LOCATION}/latest-blogs`);
    axios
      .get(`${import.meta.env.VITE_SERVER_LOCATION}/latest-blogs`)
      .then(({ data: { blogs } }) => {
        setBlogs(blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlog = () => {
    axios
      .get(`${import.meta.env.VITE_SERVER_LOCATION}/trending-blogs`)
      .then(({ data: { blogs } }) => {
        setTrendingBlogs(blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchLatestBlog();
    fetchTrendingBlog();
  }, []);
  return (
    <>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
          {/* Latest blog */}
          <div className="w-full">
            <InPageNavigation
              routes={["home", "trending blogs"]}
              defaultHidden={["trending blogs"]}
            >
              <>
                {blogs === null ? (
                  <Loader />
                ) : (
                  blogs.map((blog, i) => {
                    return (
                      <AnimationWrapper
                        key={i}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </AnimationWrapper>
                    );
                  })
                )}
              </>

              {trendingBlogs === null ? (
                <Loader />
              ) : (
                trendingBlogs.map((trendingBlog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <MinimalBlogPost blog={trendingBlog } index={i} />
                    </AnimationWrapper>
                  );
                })
              )}
            </InPageNavigation>
          </div>

          {/* filter and trending blogs */}
          <div></div>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default HomePage;
