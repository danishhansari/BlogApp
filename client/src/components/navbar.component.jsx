import { useContext, useState, useEffect } from "react";
import darkLogo from "../imgs/logo-dark.png";
import lightLogo from "../imgs/logo-light.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ThemeContext, UserContext } from "../App";
import UserNavigation from "./user-navigation.component";
import axios from "axios";
import { storeInSession } from "../common/session";

const Navbar = () => {
  const {
    userAuth,
    setUserAuth,
    userAuth: { access_token, profile_img, new_notification_available },
  } = useContext(UserContext);

  const { theme, setTheme } = useContext(ThemeContext);

  const navigate = useNavigate();

  const [userNavPanel, setUserNavPanel] = useState(false);
  const [searchVisiblity, setSearchVisiblity] = useState(false);

  const handleNavPanel = () => {
    setUserNavPanel((curr) => !curr);
  };

  const handleBlur = (e) => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    if (e.keyCode === 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };

  useEffect(() => {
    if (access_token) {
      axios
        .get(`${import.meta.env.VITE_SERVER_LOCATION}/new-notification`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, [access_token]);

  const handleTheme = () => {
    let newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    document.body.setAttribute("data-theme", newTheme);
    storeInSession("theme", newTheme);
  };

  return (
    <>
      <nav className="navbar z-50">
        <Link to="/" className="flex-none w-10">
          <img
            src={theme === "light" ? darkLogo : lightLogo}
            className="w-full"
            alt="Logo"
          />
        </Link>

        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (searchVisiblity ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder="Search"
            onKeyDown={handleSearch}
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
          />

          <i className="fi fi-rr-search absolute right-[10%] md:right-[100%] md:pointer-events-none md:left-5 top-[30%] -translate-x-1/2 text-xl text-dark-grey"></i>
        </div>

        <div className="flex items-center gap-3 ml-auto md:gap-6">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => setSearchVisiblity((currentState) => !currentState)}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>

          <Link to="/editor" className="hidden md:flex gap-2 link">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write</p>
          </Link>

          <button
            onClick={handleTheme}
            className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10"
          >
            <i
              className={`text-2xl fi fi-rr-${theme === "light" ? "moon-stars" : "sun"}`}
            ></i>
          </button>

          {access_token ? (
            <>
              <Link to="/dashboard/notifications">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                  <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                  {new_notification_available ? (
                    <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span>
                  ) : (
                    ""
                  )}
                </button>
              </Link>
              <div
                className="relative"
                onClick={handleNavPanel}
                onBlur={handleBlur}
              >
                <button className="w-12 h-12 mt-1">
                  <img
                    src={profile_img}
                    alt="Profile Image"
                    className="w-full h-full object-cover rounded-full"
                  />
                </button>
              </div>
              {userNavPanel ? <UserNavigation /> : ""}
            </>
          ) : (
            <>
              <Link to="/signup" className="btn-dark py-2">
                Signup
              </Link>
              <Link to="/signin" className="btn-light py-2 hidden md:block">
                Signin
              </Link>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
