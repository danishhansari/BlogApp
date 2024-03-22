import { getDay } from "../common/date";

const CommentsCard = ({ index, leftVal, commentsData }) => {
  let {
    commented_by: {
      personal_info: { profile_img, fullname, username },
    },
    commentedAt,
    comment,
  } = commentsData;
  return (
    <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img
            src={profile_img}
            className="w-6 h-6 rounded-full"
            alt={`${username} profile image`}
          />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>
        <p className="font-gelasio text-xl ml-3">{comment}</p>

        <div>
            
        </div>
      </div>
    </div>
  );
};

export default CommentsCard;
