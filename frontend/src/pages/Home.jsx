import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { formatDistanceToNow } from "date-fns";

function Home() {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState("");
  const [commentContent, setCommentContent] = useState({});
  const [errors, setErrors] = useState([]);
  const [editTweetId, setEditTweetId] = useState(null); // editNoteId değil
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [sortOrder, setSortOrder] = useState("newest");
  const [hashtags, setHashtags] = useState([]);
  


  function getColorFromUsername(username) {
    const colors = ["#1DA1F2", "#17BF63", "#F45D22", "#794BC4", "#E0245E", "#FFAD1F"];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  function parseHashtags(text) {
    const hashtagRegex = /#[\wğüşöçİĞÜŞÖÇ]+/gi;
    return text.split(hashtagRegex).reduce((acc, part, index, arr) => {
      acc.push(part);
  
      const match = text.match(hashtagRegex);
      if (match && match[index]) {
        const tag = match[index].substring(1); // remove #
        acc.push(
          <a
            key={index}
            href={`/hashtag/${tag.toLowerCase()}`}
            className="hashtag-link"
          >
            #{tag}
          </a>
        );
      }
  
      return acc;
    }, []);
  }

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);
  
  const fetchTrendingHashtags = async () => {
    try {
      const res = await api.get("/api/hashtags/");
      setHashtags(res.data);
    } catch (err) {
      console.error("Failed to fetch hashtags", err);
    }
  };

  const fetchTweets = () => {
    api
      .get("/api/notes/")
      .then((res) => res.data)
      .then((data) => {
        setTweets(data);
        setErrors([]);
      })
      .catch(() => setErrors(["Failed to fetch tweets."]));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (file.size > 2 * 1024 * 1024) {
      setErrors(["Image must be smaller than 2MB."]);
      return;
    }
  
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors([]);
  };


  const postTweet = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrors(["Tweet content cannot be empty."]);
      return;
    }
  
    const formData = new FormData();
    formData.append("title", "Tweet");
    formData.append("content", content);
    if (image) formData.append("image", image);
  
    api
      .post("/api/notes/", formData, {
        title: "Tweet",
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.status === 201) {
          setTweets((prevTweets) =>
            sortOrder === "newest" ? [res.data, ...prevTweets] : [...prevTweets, res.data]
          );
          fetchTweets();
          setContent("");
          setImage(null);
          setImagePreview(null);
          setErrors([]);
        } else {
          setErrors(["Failed to post tweet."]);
        }
      })
      .catch(() => setErrors(["Server error: unable to post tweet."]));
  };

  const deleteTweet = (id) => {
    api
      .delete(`/api/notes/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) {
          fetchTweets();
          setErrors([]);
        } else {
          setErrors(["Failed to delete tweet."]);
        }
      })
      .catch(() => setErrors(["Server error: unable to delete tweet."]));
  };

  const postComment = (tweetId) => {
    if (!commentContent[tweetId]?.trim()) return;
    api
      .post("/api/comments/", { note: tweetId, content: commentContent[tweetId] })
      .then(() => {
        fetchTweets();
        setCommentContent((prev) => ({ ...prev, [tweetId]: "" }));
      })
      .catch(() => setErrors(["Failed to post comment."]));
  };

  const toggleLike = (tweetId) => {
    api
      .post("/api/notes/like/", { note: tweetId })
      .then(() => {
        fetchTweets();
      })
      .catch(() => setErrors(["Failed to update like."]));
  };

  const startEdit = (tweet) => {
    setEditTweetId(tweet.id);
    setEditTitle(tweet.title || ""); // tweet.title kullanmak istersen
    setEditContent(tweet.content);
  };

  const cancelEdit = () => {
    setEditTweetId(null);
    setEditTitle("");
    setEditContent("");
  };

  const saveEdit = (id) => {
    if (!editTitle.trim() || !editContent.trim()) {
      setErrors(["Title and content cannot be empty."]);
      return;
    }
    api
      .put(`/api/notes/update/${id}/`, { title: editTitle, content: editContent })
      .then((res) => {
        if (res.status === 200) {
          fetchTweets();
          cancelEdit();
          setErrors([]);
        } else {
          setErrors(["Failed to update note."]);
        }
      })
      .catch(() => setErrors(["Server error updating note."]));
  };

  return (
    <>
      <div className="main-layout">
        <div className="left-panel">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <header className="header">
            <h1>Twitter 🐦</h1>
          </header>
  
          <section className="tweet-box-section">
            <h2>What's happening?</h2>
  
            {errors.length > 0 && (
              <div className="alert alert-danger">
                {errors.map((err, i) => (
                  <p key={i} className="error-text">
                    {err}
                  </p>
                ))}
              </div>
            )}
  
            <form onSubmit={postTweet} className="tweet-form" encType="multipart/form-data">
              <textarea
                className="tweet-input"
                placeholder="What's happening?"
                maxLength={280}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
  
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <p style={{ color: "#8899a6", fontSize: "0.9rem" }}>
                    Image selected. Can't change unless removed.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="remove-image-button"
                  >
                    ❌ Remove Image
                  </button>
                </div>
              )}
  
              {!image && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                />
              )}
  
              <button type="submit" className="tweet-button">
                Tweet
              </button>
            </form>
          </section>
  
          <section className="timeline-section">
            <h2>Timeline</h2>
  
            <div className="sort-options">
              <label>Sort by:</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
  
            <div className="timeline">
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
                        </div>
  
                        <span className="tweet-timestamp">
                          • {formatDistanceToNow(new Date(tweet.created_at))} ago
                        </span>
  
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
                        <div className="tweet-actions">
                          <button className="like-button" onClick={() => toggleLike(tweet.id)}>
                            ❤️ {tweet.likes_count || 0}
                          </button>
                          <button className="update-button" onClick={() => startEdit(tweet)}>
                            ✏️ Edit
                          </button>
                          <button className="delete-button" onClick={() => deleteTweet(tweet.id)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}
  
                    <div className="comments-section">
                      <h3>Comments</h3>
                      {tweet.comments.length === 0 && <p className="no-comments">No comments yet.</p>}
                      {tweet.comments.map((comment) => (
                        <div key={comment.id} className="comment">
                          <strong>{comment.author_username}</strong>: {comment.content}
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
          </section>
        </div>
  
        <div className="right-panel">
          <div className="hashtag-panel">
            <h3>Trending Hashtags</h3>
            <ul>
              {hashtags.length === 0 && <li>No hashtags found</li>}
              {hashtags.map((tag, i) => (
                <li key={i} className="hashtag-item">
                  <a href={`/hashtag/${tag.tag.slice(1)}`}>{tag.tag}</a> — {tag.count}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
  
}

export default Home;
