import AnimationWrapper from "../common/page-animation";

const HomePage = () => {
  return (
    <>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
          {/* Latest blog */}
          <div className="w-full">

            <InPageNavigation></InPageNavigation>

          </div>

          {/* filter and trending blogs */}
          <div></div>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default HomePage;
