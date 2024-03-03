import axios from "axios";
const uploadImage = async (image) => {
  let imgURL = null;

  await axios
    .get(`/api/get-upload-url`)
    .then(async ({ data: { uploadUrl } }) => {
      await axios({
        method: "PUT",
        url: uploadUrl,
        headers: { "Content-Type": "multipart/form-data" },
        data: image,
      }).then(() => (imgURL = uploadUrl.split("?")[0]));
    })
    .catch((err) => {
      console.log(err.message);
    });

  return imgURL;
};

export { uploadImage };
