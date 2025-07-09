import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    api.get(`/api/users/${username}/`).then((res) => {
      setUserData(res.data.user);
      setTweets(res.data.tweets);
    });

    api.get("/api/me/").then((res) => {
      setCurrentUsername(res.data.username);
    });
  }, [username]);

  useEffect(() => {
    if (userData && userData.profile) {
      setBio(userData.profile.bio || "");
    }
  }, [userData]);

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

  // Handle profile image file select
  const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
      setProfileImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Upload profile image and bio
  const saveProfileChanges = async () => {
    const formData = new FormData();
    formData.append("bio", bio);
    if (profileImageFile) {
      formData.append("profile_image", profileImageFile);
    }

    try {
      const res = await api.put("/api/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUserData((prev) => ({
        ...prev,
        profile: res.data,
      }));
      setBio(res.data.bio || "");
      setProfileImageFile(null);
      setProfileImagePreview(null);
      setIsEditingBio(false);
      alert("Profile updated!");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  // The rest of your tweet/comment logic goes here (postComment, toggleLike, etc.)

  return (
    <div className="profile-container">
      {userData && (
        <>
          <div className="profile-header" style={{ position: "relative", display: "inline-block" }}>
            <img
              src={
                profileImagePreview ||
                (userData?.profile?.profile_image && `http://localhost:8000${userData.profile.profile_image}`) ||
                "/profile.png"
              }
              alt="Profile"
              className="avatar-large"
            />
            {/* Paperclip upload button overlay */}
            {currentUsername === userData.username && (
              <>
                <button
                  className="upload-profile-image-btn"
                  onClick={() => fileInputRef.current.click()}
                  title="Change profile picture"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: "#1DA1F2",
                    borderRadius: "50%",
                    border: "none",
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                >
                  📎
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleProfileImageChange}
                />
              </>
            )}
            <h2>@{userData.username}</h2>
          </div>

          <div className="profile-bio-container" style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            {isEditingBio ? (
              <>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  style={{ width: "100%", resize: "vertical" }}
                />
                <button onClick={saveProfileChanges}>Save</button>
                <button onClick={() => setIsEditingBio(false)}>Cancel</button>
              </>
            ) : (
              <>
                <p className="profile-bio" style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {bio || <i>No bio yet</i>}
                </p>
                {currentUsername === userData.username && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    title="Edit Bio"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      color: "#1DA1F2",
                    }}
                  >
                    ✏️
                  </button>
                )}
              </>
            )}
          </div>

          <div className="sort-options" style={{ marginTop: "20px" }}>
            <label>Sort by:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
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
                              src={"http://localhost:8000" + tweet.image}
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
