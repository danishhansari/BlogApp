import DOMPurify from "dompurify";
const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} />
      {caption.length ? (
        <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">
          {caption}
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <div className="bg-purple/10 p-3  pl-5 border-1-4 border-purple">
      <p className="text-xl leading-10 md:text-2xl ">{quote}</p>
      {caption.length ? (
        <p className="w-full text-purple text-base">{caption}</p>
      ) : (
        ""
      )}
    </div>
  );
};

const List = ({ style, items }) => {
  return (
    <>
      <ol
        className={`pl-5 ${style === "ordered" ? "list-decimal" : "list-disc"}`}
      >
        {items.map((listItem, i) => {
          const sanitizedItem = DOMPurify.sanitize(listItem);
          return (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: sanitizedItem }}
            ></li>
          );
        })}
      </ol>
    </>
  );
};

const BlogContent = ({ block }) => {
  const { data, type } = block;
  switch (type) {
    case "paragraph":
      return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
    case "header":
      return <h2 dangerousliSetInnerHTML={{ __html : data.text}}></h2>;
    case "image":
      console.log(data.file.url);
      return <Img url={data.file.url} caption={data.caption} />;
    case "quote":
      return <Quote quote={data.text} caption={data.caption} />;
    case "list":
      return <List style={data.style} items={data.items} />;
    default:
      return null; // Handle unexpected block types
  }
};

export default BlogContent;
