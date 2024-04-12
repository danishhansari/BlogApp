import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { useState, useEffect, createContext } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import Notification from "./pages/notifications.page";
import ManageBlog from "./pages/manage-blogs.page";

export const UserContext = createContext({});

export const ThemeContext = createContext({});

const darkThemePreference = () =>
  window.matchMedia("(prefers-color-schema: dark)").matches;

const App = () => {
  const [userAuth, setUserAuth] = useState({});

  const [theme, setTheme] = useState(() =>
    darkThemePreference() ? "dark" : "light"
  );

  useEffect(() => {
    let userInSession = lookInSession("user");
    let themeInSession = lookInSession("theme");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });

    if (themeInSession) {
      setTheme(() => {
        document.body.setAttribute("data-theme", themeInSession);
        return themeInSession;
      });
    } else {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <Router>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <UserContext.Provider value={{ userAuth, setUserAuth }}>
          <Routes>
            <Route path="/" element={<Navbar />}>
              <Route index element={<HomePage />} />
              <Route path="signin" element={<UserAuthForm type="sign-in" />} />
              <Route path="signup" element={<UserAuthForm type="sign-up" />} />
              <Route path="search/:query" element={<SearchPage />} />
              <Route path="user/:id" element={<ProfilePage />} />
              <Route path="blog/:blog_id" element={<BlogPage />} />
              <Route path="*" element={<PageNotFound />} />
              <Route path="dashboard" element={<SideNav />}>
                <Route path="blogs" element={<ManageBlog />} />
                <Route path="notifications" element={<Notification />} />
              </Route>
              <Route path="settings" element={<SideNav />}>
                <Route path="edit-profile" element={<EditProfile />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Route>
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:blog_id" element={<Editor />} />
          </Routes>
        </UserContext.Provider>
      </ThemeContext.Provider>
    </Router>
  );
};

export default App;
