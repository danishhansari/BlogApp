import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";

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
        setProfile(user);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetState();
    fetchUserProfile();
  }, [profileId]);

  const resetState = () => {
    setProfile(profileDataStructure);
    setLoading(true);
  };
  const {
    userAuth: { username },
  } = useContext(UserContext);

  return (
    <>
      <AnimationWrapper>
        {loading ? (
          <Loader />
        ) : (
          <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
            <div className="flex flex-col max-md:items-center gap-5 min-w-[250px]">
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
            </div>
          </section>
        )}
      </AnimationWrapper>
    </>
  );
};
export default ProfilePage;
