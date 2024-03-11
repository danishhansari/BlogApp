import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { filterPagination } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import LoadMoreDataBtn from "../components/load-more.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import PageNotFound from "./404.page";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    bio: "",
    profile_img: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

const ProfilePage = () => {
  const { id: profileId } = useParams();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState("");

  const {
    personal_info: { fullname, profile_img, username: user_name, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const fetchUserProfile = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_LOCATION}/get-profile`, {
        username: profileId,
      })
      .then(({ data: user }) => {
        if (user !== null) {
          setProfile(user);
        }
        getBlog({ userId: user._id });
        setProfileLoaded(profileId);

        setLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null);
    }
    if (blogs === null) {
      resetState();
      fetchUserProfile();
    }
  }, [profileId, blogs]);

  const resetState = () => {
    setProfile(profileDataStructure);
    setProfileLoaded("");
    setLoading(true);
  };

  const {
    userAuth: { username },
  } = useContext(UserContext);

  const getBlog = ({ page = 1, userId }) => {
    userId = userId == undefined ? blogs.user.id : userId;

    axios
      .post(`${import.meta.env.VITE_SERVER_LOCATION}/search-blogs`, {
        author: userId,
        page,
      })
      .then(async ({ data }) => {
        const formatedData = await filterPagination({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "search-blogs-count",
          dataToSend: { author: userId },
        });
        console.log(formatedData);
        formatedData.userId = userId;

        setBlogs(formatedData);
      });
  };

  return (
    <>
      <AnimationWrapper>
        {loading ? (
          <Loader />
        ) : user_name.length ? (
          <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
            <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-1 border-grey md:sticky md:top-[100px] md:py-10">
              <img
                src={profile_img}
                className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
                alt={`${user_name} account profile picture`}
              />

              <h1 className="text-2xl font-medium ">@ {user_name}</h1>
              <p className="text-xl capitalize h-6">{fullname}</p>
              <p>
                {total_posts.toLocaleString()} Blogs -{" "}
                {total_reads.toLocaleString()} - Reads
              </p>

              <div className="flex-gap-4 mt-2">
                {profileId === username ? (
                  <Link
                    to="/settings/edit-profile"
                    className="btn-light rounded-md"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  ""
                )}
              </div>

              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
                className="max-md:hidden"
              />
            </div>

            <div className="max-md:mt-12 w-full">
              <InPageNavigation
                routes={["Blogs Published", "About"]}
                defaultHidden={["About"]}
              >
                <>
                  {blogs === null ? (
                    <Loader />
                  ) : blogs.results.length ? (
                    blogs.results.map((blog, i) => {
                      return (
                        <AnimationWrapper
                          key={i}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        >
                          <BlogPostCard
                            content={blog}
                            author={blog.author.personal_info}
                          />
                        </AnimationWrapper>
                      );
                    })
                  ) : (
                    <NoDataMessage message="No blogs published" />
                  )}
                  <LoadMoreDataBtn state={blogs} fetchDataFn={getBlog} />
                </>

                <AboutUser
                  bio={bio}
                  social_links={social_links}
                  joinedAt={joinedAt}
                />
              </InPageNavigation>
            </div>
          </section>
        ) : (
          <PageNotFound />
        )}
      </AnimationWrapper>
    </>
  );
};
export default ProfilePage;
