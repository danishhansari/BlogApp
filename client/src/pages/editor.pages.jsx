import { useContext, useState, createContext } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublistForm from "../components/publish-form.component";

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
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");

  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  return (
    <>
      {accessToken === null ? (
        <Navigate to="/signin" />
      ) : (
        <EditorContext.Provider
          value={{ blog, setBlog, editorState, setEditorState }}
        >
          {editorState === "editor" ? <BlogEditor /> : <PublistForm />}
        </EditorContext.Provider>
      )}
    </>
  );
};
export default Editor;
