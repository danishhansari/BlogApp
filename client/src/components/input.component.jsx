import { useState } from "react";

const InputBox = ({ name, type, id, placeholder, icon, value }) => {
  const [passwordVisiblity, setPasswordVisiblity] = useState(false);
  return (
    <>
      <div className="relative w-[100%] mb-4">
        <input
          name={name}
          type={
            type == "password"
              ? passwordVisiblity
                ? "text"
                : "password"
              : type
          }
          placeholder={placeholder}
          defaultValue={value}
          id={id}
          className="input-box"
        />
        <i className={`fi ${icon} input-icon`}></i>
        {type === "password" ? (
          <i
            className={`fi input-icon left-[auto] right-4 cursor-pointer ${
              !passwordVisiblity ? "fi-rr-eye-crossed" : "fi-rr-eye"
            }`}
            onClick={() => setPasswordVisiblity((currVal) => !currVal)}
          ></i>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default InputBox;
