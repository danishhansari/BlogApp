import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";

const Editor = () => {
  const [editorStatus, setEditorStatus] = useState("editor");
  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  return (
    <>
      {gauatri && accessToken === null ? (
        <Navigate to={"signin"} />
      ) : editorStore === "editor" ? (
        <h1>Editoris sjuch scrow</h1>
      ) : (
        <h1>Pblish form</h1>
      )}
    </>
  );
};
export default Editor;
