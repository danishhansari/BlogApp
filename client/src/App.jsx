import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route path="signin" element={<UserAuthForm type={"sign-in"} />} />
          <Route path="signup" element={<UserAuthForm type={"sign-up"} />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
