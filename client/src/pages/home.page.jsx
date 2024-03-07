import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";

const HomePage = () => {
  return (
    <>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
          {/* Latest blog */}
          <div className="w-full">
            <InPageNavigation
              routes={["home", "trending blogs"]}
              defaultHidden={["trending blogs"]}
            ></InPageNavigation>
          </div>

          {/* filter and trending blogs */}
          <div></div>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default HomePage;
