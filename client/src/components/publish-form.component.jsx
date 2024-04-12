import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";

const PublishForm = () => {
  const characterLimit = 200;
  const tagLimit = 10;

  const { blog_id } = useParams();
  let navigate = useNavigate();

  const {
    blog: { banner, title, description, tags, content },
    setEditorState,
    setBlog,
    blog,
  } = useContext(EditorContext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const publishBlog = (e) => {
    if (e.target.className.includes("disable")) return;

    if (!title.length) {
      return toast.error("Write blog title before publishing");
    }

    if (!description.length || description.length > 200) {
      return toast.error(
        `Write a description about your blog within ${characterLimit} characters to publish`
      );
    }

    if (!tags.length) {
      return toast.error("Enter at least 1 tag to help us rank your blog");
    }

    let loading = toast.loading("Publishing...");

    e.target.classList.add("disable");

    const blogObj = {
      title,
      banner,
      description,
      content,
      tags,
      draft: false,
    };
    axios
      .post(
        `${import.meta.env.VITE_SERVER_LOCATION}/create-blog`,
        { ...blogObj, id: blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        toast.dismiss(loading);
        e.target.classList.remove("disable");
        toast.success("Published");

        setTimeout(() => {
          navigate("/dashboard/blogs  ");
        }, 500);
      })
      .catch(({ response }) => {
        toast.dismiss(loading);
        e.target.classList.remove("disable");
        return toast.error(response.data.error);
      });
  };

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    const input = e.target;
    setBlog({ ...blog, title: input.value });
  };

  const handleBlogDescriptionChange = (e) => {
    const input = e.target;
    setBlog({ ...blog, description: input.value });
  };

  const handleBlogKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleKeydown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188 || e.keyCode === 32) {
      e.preventDefault();
      let tag = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can add max ${tagLimit} character`);
      }
      e.target.value = "";
    }
  };

  return (
    <>
      <AnimationWrapper>
        <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
          <Toaster />
          <button
            className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
            onClick={handleCloseEvent}
          >
            <i className="fi fi-br-cross"></i>
          </button>

          <div className="max-w-[550px] center">
            <p className="text-dark-grey mb-1">Preview</p>

            <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
              <img src={banner} />
            </div>

            <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
              {title}
            </h1>

            <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
              {description}
            </p>
          </div>

          <div className="border-grey lg:border-1 lg:pl-8">
            <p className="text-dark-grey mb-2 mt-9">Blog title</p>
            <input
              type="text"
              placeholder="Blog title"
              className="input-box pl-4"
              defaultValue={title}
              onChange={handleBlogTitleChange}
            />

            <p className="text-dark-grey mb-2 mt-9">
              Short description about your blog
            </p>

            <textarea
              maxLength={characterLimit}
              defaultValue={description}
              onChange={handleBlogDescriptionChange}
              className="h-40 resize-none leading-7 input-box pl-4"
              onKeyDown={handleBlogKeyDown}
            ></textarea>

            <p className="mt-1 text-dark-grey text-sm text-right">
              {characterLimit - description.length} character left
            </p>

            <p className="text-dark-grey mb-2 mt-9">
              Topics - (Helps is searching and ranking your blog post)
            </p>

            <div className="relative input-box pl-2 py-2 pb-4">
              <input
                type="text"
                placeholder="Topics"
                onKeyDown={handleKeydown}
                className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
              />
              {tags.map((tag, i) => {
                return <Tag tag={tag} tagIndex={i} key={i} />;
              })}
            </div>
            <p className="mt-1 mb-4 text-dark-grey text-right">
              {tagLimit - tags.length} Tags left
            </p>

            <button className="btn-dark px-8" onClick={publishBlog}>
              Publish
            </button>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default PublishForm;
