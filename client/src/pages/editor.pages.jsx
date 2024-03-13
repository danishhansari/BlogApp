import { useContext, useState, createContext } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";

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
  const [textEditor, setTextEditor] = useState({ isReady: false });

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  return (
    <>
      {access_token === null ? (
        <Navigate to="/signin" />
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
