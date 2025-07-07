import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState("");
  const [commentContent, setCommentContent] = useState({});
  const [errors, setErrors] = useState([]);
  

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleLogout = () => {
    localStorage.clear();  // Tokenları temizle
    navigate("/login");    // Login sayfasına yönlendir
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

  const postTweet = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrors(["Tweet content cannot be empty."]);
      return;
    }

    api
      .post("/api/notes/", { title: "Tweet", content })
      .then((res) => {
        if (res.status === 201) {
          fetchTweets();
          setContent("");
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
      .then((res) => {
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

  return (
    <div className="container">
         <button className="logout-button" onClick={handleLogout} >
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

        <form onSubmit={postTweet} className="tweet-form">
          <textarea
            className="tweet-input"
            placeholder="What's happening?"
            maxLength={280}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" className="tweet-button">
            Tweet
          </button>
        </form>
      </section>

      <section className="timeline-section">
        <h2>Timeline</h2>
        <div className="timeline">
          {tweets.map((tweet) => (
            <div className="tweet-post" key={tweet.id}>
              <div className="tweet-content">
                <p>{tweet.content}</p>
              </div>
              <div className="tweet-actions">
                <button
                  className="like-button"
                  onClick={() => toggleLike(tweet.id)}
                >
                  ❤️ {tweet.likes_count || 0}
                </button>
                <button
                  className="delete-button"
                  onClick={() => deleteTweet(tweet.id)}
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="comments-section">
                <h3>Comments</h3>
                {tweet.comments.length === 0 && (
                  <p className="no-comments">No comments yet.</p>
                )}
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
  );
}

export default Home;
