import { useEffect, useRef, useState } from "react";

const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
}) => {
  useEffect(() => {
    changePageState(activeTabRef.current, defaultActiveIndex);
  }, []);

  const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);
  let activeTabLineRef = useRef();
  let activeTabRef = useRef();

  const changePageState = (btn, i) => {
    const { offsetWidth, offsetLeft } = btn;

    activeTabLineRef.current.style.width = `${offsetWidth}px`;
    activeTabLineRef.current.style.left = `${offsetLeft}px`;

    setInPageNavIndex(i);
  };

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, i) => {
          return (
            <button
              ref={i === defaultActiveIndex ? activeTabRef : null}
              key={i}
              className={`px-5 p-4 capitalize ${
                inPageNavIndex === i ? "text-black" : "text-dark-grey"
              } ${defaultHidden.includes(route) ? "mb-hidden" : ""}`}
              onClick={(e) => changePageState(e.target, i)}
            >
              {route}
            </button>
          );
        })}

        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
      </div>
    </>
  );
};
export default InPageNavigation;
