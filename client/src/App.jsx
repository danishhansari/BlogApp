import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route path="signin" element={"This is SignIN"} />
          <Route path="signup" element={"This is  SignUP"} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
