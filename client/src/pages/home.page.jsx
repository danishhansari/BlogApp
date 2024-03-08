import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");

  const categories = ["nodejs", "aws", "productivity", "tech"];

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

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText.toLowerCase();

    setBlogs(null);

    if (pageState === category) {
      setPageState("home");
      return;
    }
    setPageState(category);
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState === "home") fetchLatestBlog();
    if (!trendingBlogs) fetchTrendingBlog();
  }, [pageState]);
  return (
    <>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
          {/* Latest blog */}
          <div className="w-full">
            <InPageNavigation
              routes={[pageState, "trending blogs"]}
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
                      <MinimalBlogPost blog={trendingBlog} index={i} />
                    </AnimationWrapper>
                  );
                })
              )}
            </InPageNavigation>
          </div>

          {/* filter and trending blogs */}

          <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
            <div className="flex flex-col gap-10">
              <div>
                <h1 className="font-medium text-xl mb-8">
                  Stories from all Interest
                </h1>

                <div className="flex-gap-3 flex-wrap">
                  {categories.map((category, i) => {
                    return (
                      <button
                        key={i}
                        onClick={loadBlogByCategory}
                        className={`mx-2 my-1 ${
                          pageState === category
                            ? "tag bg-black text-white"
                            : "tag"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h1 className="font-medium  text-xl mb-8">
                  Trending Blogs <i className="fi fi-rr-arrow-trend-up"></i>
                </h1>

                {trendingBlogs === null ? (
                  <Loader />
                ) : (
                  trendingBlogs.map((trendingBlog, i) => {
                    return (
                      <AnimationWrapper
                        key={i}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      >
                        <MinimalBlogPost blog={trendingBlog} index={i} />
                      </AnimationWrapper>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default HomePage;
