import { useContext, useState, createContext } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import { useEffect } from "react";
import Loader from "../components/loader.component";
import axios from "axios";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  description: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const Editor = () => {
  const { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);

  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  useEffect(() => {
    if (!blog_id) {
      return setLoading(false);
    }
    axios
      .post(`${import.meta.env.VITE_SERVER_LOCATION}/get-blog`, {
        blog_id,
        draft: true,
        mode: "edit",
      })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setBlog(null);
      });
  });

  return (
    <>
      {accessToken === null ? (
        <Navigate to="/signin" />
      ) : loading ? (
        <Loader />
      ) : (
        <EditorContext.Provider
          value={{
            blog,
            setBlog,
            editorState,
            setEditorState,
            setTextEditor,
            textEditor,
          }}
        >
          {editorState === "editor" ? <BlogEditor /> : <PublishForm />}
        </EditorContext.Provider>
      )}
    </>
  );
};
export default Editor;
