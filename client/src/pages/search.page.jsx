import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { useEffect, useState } from "react";
import { filterPagination } from "../common/filter-pagination-data";
import axios from "axios";

const SearchPage = () => {
  const { query } = useParams();
  const [blogs, setBlogs] = useState(null);

  const searchBlogs = ({ page = 1, createNewArr = false }) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_LOCATION}/search-blogs`, {
        query,
        page,
      })
      .then(async ({ data }) => {
        // setBlogs(blogs);
        let formatedData = await filterPagination({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "search-blogs-count",
          dataToSend: { query },
          createNewArr,
        });
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, createNewArr: true });
  }, [query]);

  const resetState = () => {
    console.log("I got a call");
    setBlogs(null);
  };

  return (
    <>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={[`Search Results from "${query}"`, "Account Matched"]}
            defaultHidden={["Account Matched"]}
          />

          <>
            {blogs === null ? (
              <Loader />
            ) : blogs.results.length ? (
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
            <LoadMoreDataBtn state={blogs} fetchDataFn={searchBlogs} />
          </>
        </div>
      </section>
    </>
  );
};
export default SearchPage;
