import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeSession } from "../common/session.jsx";

const UserNavigation = () => {
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);
  const signinOutUser = () => {
    removeSession("user");
    setUserAuth({ accessToken: null });
  };
  return (
    <>
      <AnimationWrapper
        transition={{ duration: 0.3 }}
        className={"absolute top-20 right-0 z-10"}
      >
        <div className="bg-white absolute right-0 border-grey w-60 duration-200 md:hidden">
          <Link to="/editor" className="flex gap-2 link pl-8 py-4">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write</p>
          </Link>
          <Link to={`/user/${username}`} className="flex gap-2 link pl-8 py-4">
            Profile
          </Link>
          <Link to="dashboard/blogs" className="link pl-8 py-4">
            Dashboard
          </Link>
          <Link to="settings/edit-profile" className="link pl-8 py-4">
            Settings
          </Link>

          <span className="absolute border-t border-grey w-[100%]"></span>

          <button
            className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
            onClick={signinOutUser}
          >
            <h1 className="font-bold text-xl mb-1">Sign Out</h1>
            <p className="text-dark-grey">@{username}</p>
          </button>
        </div>
      </AnimationWrapper>
    </>
  );
};
export default UserNavigation;
