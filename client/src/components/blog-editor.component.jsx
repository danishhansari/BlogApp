import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import blogBanner from "../imgs/blog-banner.png";
import { uploadImage } from "../common/aws.jsx";
import { useRef } from "react";
import { toast, Toaster } from "react-hot-toast";

const BlogEditor = () => {
  const bannerRef = useRef();
  const handleBannerUpload = (e) => {
    let img = e.target.files[0]; // Get the selected image from the input element.

    console.log(img); // Log the name of the selected image to the console.

    if (img) {
      let leadingToast = toast.loading("Uploading...");
      uploadImage(img).then((url) => {
        if (url) {
          toast.dismiss(leadingToast);
          bannerRef.current.src = url;
          toast.success("Uploaded");
        }
      });
    }
  };
  return (
    <>
      <nav className="navbar">
        <Link to={"/"} className="flex-none w-10">
          <img src={logo} alt="Logo" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">New Blog</p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2">Publish</button>
          <button className="btn-light py-2">Save Draft</button>
        </div>
      </nav>

      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-8 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  ref={bannerRef}
                  src={blogBanner}
                  alt="blog-banner"
                  className="z-20"
                />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png, .jpg, .jpeg"
                  // hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default BlogEditor;
