import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component.jsx";
import UserAuthForm from "./pages/userAuthForm.page.jsx";
import { useState, useEffect, createContext } from "react";
import { lookInSession } from "./common/session.jsx";
import Editor from "./pages/editor.pages.jsx";
import HomePage from "./pages/home.page.jsx";
import SearchPage from "./pages/search.page.jsx";
import PageNotFound from "./pages/404.page.jsx";
import ProfilePage from "./pages/profile.page.jsx";
import BlogPage from "./pages/blog.page.jsx";
import SideNav from "./components/sidenavbar.component.jsx";

export const UserContext = createContext({});
const App = () => {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    <Router>
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
            <Route path="settings" element={<SideNav />}>
              <Route
                path="edit-profile"
                element={<h1>This is edit profile</h1>}
              />
              <Route
                path="change-password"
                element={<h1>This is Change password</h1>}
              />
            </Route>
          </Route>
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:blog_id" element={<Editor />} />
        </Routes>
      </UserContext.Provider>
    </Router>
  );
};

export default App;
