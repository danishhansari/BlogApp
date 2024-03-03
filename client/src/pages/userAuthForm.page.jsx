import AnimationWrapper from "../common/page-animation.jsx";
import InputBox from "../components/input.component.jsx";
import googleImg from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session.jsx";
import { useContext } from "react";
import { UserContext } from "../App.jsx";

const UserAuthForm = ({ type }) => {
  let {
    userAuth: { accessToken },
    setUserAuth,
  } = useContext(UserContext);

  console.log(accessToken);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(`api/${serverRoute}`, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        console.log(data);
        setUserAuth(data);
        toast.success("authentication successful");
      })
      .catch((err) => {
        console.log(err);
        return toast.error(response.data);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type === "sign-in" ? "signin" : "signup";

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    let form = new FormData(formElement);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    console.log(formData);
    let { fullname, email, password } = formData;

    if (fullname && fullname.length < 3) {
      return toast.error("Name must be at least 3 letters long");
    }
    if (!email.length) {
      return toast.error("Email cannot be empty");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }
    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password should be 6 to 20 character password long with a numeric, 1 lowercase and 1 uppercase letter"
      );
    }
    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    toast.error("Please use email and password to login");
  };
  return accessToken ? (
    <Navigate to={"/"} />
  ) : (
    <AnimationWrapper keyValue={type}>
      <Toaster position="top-center" />
      <section className="h-cover flex items-center justify-center">
        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome back" : "Join us today"}
          </h1>
          {type !== "sign-in" ? (
            <InputBox
              type="text"
              name="fullname"
              placeholder="Full Name"
              id="fullname"
              icon="fi fi-rr-user"
            />
          ) : (
            ""
          )}
          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            id="email"
            icon="fi-rr-envelope"
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            id="password"
            icon="fi-rr-key"
          />

          <button
            onClick={handleSubmit}
            className="btn-dark center"
            type="submit"
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full items-center gap-2 my-10 opacity-10 uppercase text-black font-bold flex">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>
          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleImg} alt="google" className="w-5" />
            continue with google
          </button>

          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account ?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                {" "}
                Join us today.
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member ?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here.
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
