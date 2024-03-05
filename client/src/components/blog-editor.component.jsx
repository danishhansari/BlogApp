import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import blogBanner from "../imgs/blog-banner.png";
import { uploadImage } from "../common/aws.jsx";
import { useContext, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages.jsx";
import { tools } from "./tools.component";

import EditorJS from "@editorjs/editorjs";

const BlogEditor = () => {
  const {
    blog,
    blog: { title, banner, content, tags, description },
    setBlog,
    editorState,
    setEditorState,
  } = useContext(EditorContext);

  const handleBannerUpload = (e) => {
    let img = e.target.files[0]; // Get the selected image from the input element.

    if (img) {
      let leadingToast = toast.loading("Uploading...");
      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(leadingToast);
            setBlog({ ...blog, banner: url });
            toast.success("Uploaded 👍");
          }
        })
        .catch((err) => {
          toast.dismiss(leadingToast);
          return toast.error(err.message);
        });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    const input = e.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  useEffect(() => {
    const editor = new EditorJS({
      holder: "textEditor",
      data: "",
      tools: tools,
      placeholder: "Lets write a awesome story",
    });
  }, []);

  return (
    <>
      <nav className="navbar">
        <Link to={"/"} className="flex-none w-10">
          <img src={logo} alt="Logo" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>
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
                  src={banner ? banner : blogBanner}
                  alt="blog-banner"
                  className="z-20"
                />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default BlogEditor;
