import { useContext, useState } from "react";
import Loader from "../components/loader.component";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";
import { filterPagination } from "../common/filter-pagination-data";
import { useEffect } from "react";
import InPageNavigation from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import {
  ManagePublishedBlogCard,
  ManageDraftBlogCard,
} from "../components/manage-blogcard.component";

const ManageBlog = () => {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState("");

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_LOCATION}/user-written-blogs`,
        {
          page,
          draft,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        const formatedData = await filterPagination({
          state: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: access_token,
          countRoute: "user-written-blogs-count",
          dataToSend: { draft, query },
        });
        if (draft) {
          setDrafts(formatedData);
          console.log("Draft", formatedData);
        } else {
          setBlogs(formatedData);
          console.log("Blogs", formatedData);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    if (access_token) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts === null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [access_token, blogs, drafts, query]);

  const handleSearch = (e) => {
    let search = e.target.value;
    setQuery(search);
    if (e.keyCode === 13 && search.length) {
      setBlogs(null);
      setDrafts(null);
    }
  };

  const handleChange = (e) => {
    if (!e.target.value.length) {
      setQuery("");
      setDrafts(null);
      setBlogs(null);
    }
  };

  return (
    <>
      <h1 className="max-md:hidden">Manage Blogs</h1>
      <Toaster />
      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder="Search Blogs"
          onChange={handleChange}
          onKeyDown={handleSearch}
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
      </div>

      <InPageNavigation routes={["Published Blogs", "Drafts"]}>
        {
          // Published blog
          blogs === null ? (
            <Loader />
          ) : blogs.results.length ? (
            <>
              {blogs.results.map((blog, i) => {
                return (
                  <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                    <ManagePublishedBlogCard
                      blog={{ ...blog, index: i + 1, setStateFunc: setBlogs }}
                    />
                  </AnimationWrapper>
                );
              })}
            </>
          ) : (
            <NoDataMessage message={"No published blogs"} />
          )
        }
        {
          // Draft blog
          drafts === null ? (
            <Loader />
          ) : drafts.results.length ? (
            <>
              {drafts.results.map((draft, i) => {
                return (
                  <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                    <ManageDraftBlogCard
                      blog={{ ...draft, index: i, setStateFunc: setDrafts }}
                    />
                  </AnimationWrapper>
                );
              })}
            </>
          ) : (
            <NoDataMessage message={"No published blogs"} />
          )
        }{" "}
      </InPageNavigation>
    </>
  );
};

export default ManageBlog;
