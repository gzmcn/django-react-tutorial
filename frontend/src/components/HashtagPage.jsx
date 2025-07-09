import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { formatDistanceToNow } from "date-fns";

function HashtagPage() {
  const { tag } = useParams();
  const [tweets, setTweets] = useState([]);
  const [errors, setErrors] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [editTweetId, setEditTweetId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    api
      .get("/api/notes/")
      .then((res) => {
        const filtered = res.data.filter((tweet) =>
          tweet.content.includes(`#${tag}`)
        );
        setTweets(filtered);
        setErrors([]);
      })
      .catch(() => setErrors(["Failed to fetch tweets."]));
  }, [tag]);

  const saveEdit = (id) => {
    // Optional: implement if editing allowed
  };

  const cancelEdit = () => {
    setEditTweetId(null);
    setEditContent("");
  };

  const getColorFromUsername = (username) => {
    const colors = ["#1da1f2", "#17bf63", "#e0245e", "#f45d22", "#794bc4"];
    const index = username
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const parseHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    return text.split(hashtagRegex).map((part, i) => {
      if (i % 2 === 1) {
        return (
          <a key={i} href={`/hashtag/${part}`} className="hashtag-link">
            #{part}
          </a>
        );
      }
      return part;
    });
  };

  const sortedTweets = [...tweets].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="container">
      <h2>#{tag}</h2>

      {errors.length > 0 && (
        <div className="alert alert-danger">
          {errors.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}

      <div className="sort-options">
        <label>Sort by:</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {sortedTweets.length === 0 && <p>No tweets found for this hashtag.</p>}

      <div className="timeline">
        {sortedTweets.map((tweet) => (
          <div className="tweet-post" key={tweet.id}>
            {editTweetId === tweet.id ? (
              <>
                <textarea
                  className="tweet-input"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  maxLength={280}
                />
                <button onClick={() => saveEdit(tweet.id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <div className="tweet-author">
                  <img
                    src="/profile.png"
                    alt="Avatar"
                    className="tweet-avatar"
                  />
                  <strong
                    className="tweet-username"
                    style={{ color: getColorFromUsername(tweet.author_username) }}
                  >
                    @{tweet.author_username}
                  </strong>
                  <span className="tweet-timestamp">
                    • {formatDistanceToNow(new Date(tweet.created_at))} ago
                  </span>
                </div>

                <div className="tweet-content">
                  <p>{parseHashtags(tweet.content)}</p>

                  {tweet.image && (
                    <img
                      src={tweet.image}
                      alt="Tweet"
                      className="tweet-image"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HashtagPage;
