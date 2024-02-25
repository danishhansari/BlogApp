import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar.component";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

export default App;
