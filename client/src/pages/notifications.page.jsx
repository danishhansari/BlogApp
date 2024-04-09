import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPagination } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";

const Notification = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);

  const filters = ["all", "like", "comment", "reply"];
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_LOCATION}/notifications`,
        {
          page,
          filter,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data: { notifications: data } }) => {
        const formatedData = await filterPagination({
          state: notifications,
          data,
          page,
          countRoute: "all-notifications-count",
          dataToSend: { filter },
          user: access_token,
        });
        setNotifications(formatedData);
        console.log(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleFilter = (e) => {
    const btn = e.target;

    setFilter(btn.textContent);

    setNotifications(null);
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  return (
    <>
      <div>
        <h1 className="max:md-hidden">Recent Notification</h1>

        <div className="my-8 flex gap-6">
          {filters.map((filterName, i) => {
            return (
              <button
                key={i}
                className={`py-2 ${
                  filterName === filter ? "btn-dark" : "btn-light"
                }`}
                onClick={handleFilter}
              >
                {filterName}
              </button>
            );
          })}
        </div>

        {notifications === undefined || notifications === null ? (
          <Loader />
        ) : (
          <>
            {notifications.results?.length ? (
              notifications.results?.map((notification, i) => {
                return (
                  <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                    <NotificationCard />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message={"Nothing available"} />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Notification;
