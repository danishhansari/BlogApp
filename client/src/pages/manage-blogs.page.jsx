import { useContext, useState } from "react";
import Loader from "../components/loader.component";
import axios from "axios";
import { UserContext } from "../App";
import { filterPagination } from "../common/filter-pagination-data";

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
        } else {
          setBlogs(formatedData);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <>
      <div>ManageBlog</div>
    </>
  );
};

export default ManageBlog;
