import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublistForm from "../components/publish-form.component";

const Editor = () => {
  const [editorState, setEditorState] = useState("editor");
  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  return (
    accessToken === null ? (
      <Navigate to="/signin" />
      ) : editorState === "editor" ? (
        <BlogEditor />
        ) : (
          <PublistForm />
          )
    )        
};
export default Editor;
