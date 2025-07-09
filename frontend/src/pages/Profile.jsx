import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import "../styles/Profile.css";
import { formatDistanceToNow } from "date-fns";

function ProfilePage() {
  const { username } = useParams();
  const [tweets, setTweets] = useState([]);
  const [userData, setUserData] = useState(null);
  const [commentContent, setCommentContent] = useState({});
  const [editTweetId, setEditTweetId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    api.get(`/api/users/${username}/`).then((res) => {
      setUserData(res.data.user);
      setTweets(res.data.tweets);
    });

    api.get("/api/me/").then((res) => {
      setCurrentUsername(res.data.username);
    });
  }, [username]);

  const postComment = (tweetId) => {
    if (!commentContent[tweetId]?.trim()) return;
    api
      .post("/api/comments/", {
        note: tweetId,
        content: commentContent[tweetId],
      })
      .then(() => {
        refreshTweets();
        setCommentContent((prev) => ({ ...prev, [tweetId]: "" }));
      });
  };

  const toggleLike = (tweetId) => {
    api.post("/api/notes/like/", { note: tweetId }).then(refreshTweets);
  };

  const refreshTweets = () => {
    api.get(`/api/users/${username}/`).then((res) => {
      setTweets(res.data.tweets);
    });
  };

  const startEdit = (tweet) => {
    setEditTweetId(tweet.id);
    setEditContent(tweet.content);
  };

  const cancelEdit = () => {
    setEditTweetId(null);
    setEditContent("");
  };

  const saveEdit = (id) => {
    if (!editContent.trim()) return;
    api
      .put(`/api/notes/update/${id}/`, {
        title: "Tweet",
        content: editContent,
      })
      .then(() => {
        cancelEdit();
        refreshTweets();
      });
  };

  const parseHashtags = (text) => {
    return text.split(/(\s+)/).map((part, i) =>
      part.startsWith("#") ? (
        <a key={i} href={`/hashtag/${part.slice(1)}`} className="hashtag-link">
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  const getColorFromUsername = (username) => {
    const colors = ["#1DA1F2", "#17bf63", "#e0245e", "#ffad1f", "#794bc4"];
    let total = 0;
    for (let i = 0; i < username.length; i++) {
      total += username.charCodeAt(i);
    }
    return colors[total % colors.length];
  };

  return (
    <div className="profile-container">
      {userData && (
        <>
          <div className="profile-header">
            <img src="/profile.png" alt="Profile" className="avatar-large" />
            <h2>@{userData.username}</h2>
          </div>

          <div className="sort-options">
            <label>Sort by:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <div className="profile-tweets">
          <div className="tweet-layout">
            {[...tweets]
              .sort((a, b) => {
                const timeA = new Date(a.created_at).getTime();
                const timeB = new Date(b.created_at).getTime();
                return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
              })
              .map((tweet) => (
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
                          style={{
                            color: getColorFromUsername(tweet.author_username),
                          }}
                        >
                          @{tweet.author_username}
                        </strong>
                      </div>
                      <span className="tweet-timestamp">
                        • {formatDistanceToNow(new Date(tweet.created_at))} ago
                      </span>

                      <div className="tweet-content">
                        <p>{parseHashtags(tweet.content)}</p>
                        {tweet.image && (
                          <img
                            src={"http://localhost:8000"+tweet.image}
                            alt="Tweet"
                            className="tweet-image"
                          />
                        )}
                      </div>
                      <div className="tweet-actions">
                        <button
                          className="like-button"
                          onClick={() => toggleLike(tweet.id)}
                        >
                          ❤️ {tweet.likes_count || 0}
                        </button>
                        {currentUsername === tweet.author_username && (
                          <>
                            <button
                              className="update-button"
                              onClick={() => startEdit(tweet)}
                            >
                              ✏️ Edit
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  <div className="comments-section">
                    <h3>Comments</h3>
                    {tweet.comments.length === 0 && (
                      <p className="no-comments">No comments yet.</p>
                    )}
                    {tweet.comments.map((comment) => (
                      <div key={comment.id} className="comment">
                        <strong>{comment.author_username}</strong>:{" "}
                        {comment.content}
                      </div>
                    ))}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        postComment(tweet.id);
                      }}
                      className="comment-form"
                    >
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentContent[tweet.id] || ""}
                        onChange={(e) =>
                          setCommentContent((prev) => ({
                            ...prev,
                            [tweet.id]: e.target.value,
                          }))
                        }
                      />
                      <button type="submit">Comment</button>
                    </form>
                  </div>
                </div>
              ))}
          </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfilePage;
