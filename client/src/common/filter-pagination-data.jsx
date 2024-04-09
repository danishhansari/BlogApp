import axios from "axios";
export const filterPagination = async ({
  createNewArray = false,
  state,
  data,
  page,
  countRoute,
  dataToSend = {},
  user = undefined,
}) => {
  let obj;

  const headers = {};

  if (user) {
    headers.headers = {
      Authorization: `Bearer ${user}`,
    };
  }

  if (state !== null && !createNewArray) {
    obj = { ...state, results: [...state.results, ...data], page: page };
  } else {
    await axios
      .post(
        `${import.meta.env.VITE_SERVER_LOCATION}/${countRoute}`,
        dataToSend,
        headers
      )
      .then(({ data: { totalDocs } }) => {
        obj = { results: data, page: 1, totalDocs };
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return obj;
};
