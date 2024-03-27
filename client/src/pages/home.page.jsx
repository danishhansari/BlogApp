import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPagination } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");

  console.log(blogs);
  const categories = ["nodejs", "aws", "notion", "productivity", "tech"];

  const fetchLatestBlog = ({ page = 1 }) => {
    console.log(`${import.meta.env.VITE_SERVER_LOCATION}/latest-blogs`, {
      page,
    });
    axios
      .post(`${import.meta.env.VITE_SERVER_LOCATION}/latest-blogs`)
      .then(async ({ data }) => {
        // setBlogs(blogs);
        let formatedData = await filterPagination({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "all-latest-blogs-count",
        });
        setBlogs(formatedData);
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

  const fetchBlogByCategory = ({ page = 1 }) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_LOCATION}/search-blogs`, {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPagination({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "search-blogs-counts",
          dataToSend: { tag: pageState },
        });
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    activeTabRef.current.click();

    pageState == "home"
      ? fetchLatestBlog({ page: 1 })
      : fetchBlogByCategory({ page: 1 });
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
                ) : blogs?.results?.length ? (
                  blogs.results.map((blog, i) => {
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
                ) : (
                  <NoDataMessage message="No blogs published" />
                )}
                <LoadMoreDataBtn
                  state={blogs}
                  fetchDataFn={
                    pageState === "home" ? fetchLatestBlog : fetchBlogByCategory
                  }
                />
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
                ) : trendingBlogs.length ? (
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
                ) : (
                  <NoDataMessage message="No trending data found" />
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
