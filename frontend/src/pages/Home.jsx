import { useState, useEffect } from "react";
import api from "../api";

function Home() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = () => {
        api
            .get("/api/notes/")
            .then((res) => res.data)
            .then((data) => {
                setNotes(data);
                setErrors([]);
            })
            .catch((err) => {
                setErrors(["Notes could not be fetched."]);
            });
    };

    const createNote = (e) => {
        e.preventDefault();
        if (!title || !content) {
            setErrors(["Title and content are required."]);
            return;
        }

        api
            .post("/api/notes/", { title, content })
            .then((res) => {
                if (res.status === 201) {
                    getNotes();
                    setContent("");
                    setTitle("");
                    setErrors([]);
                } else {
                    setErrors(["Failed to create note."]);
                }
            })
            .catch(() => setErrors(["Server error creating note."]));
    };

    const deleteNote = (id) => {
        api
            .delete(`/api/notes/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) {
                    getNotes();
                } else {
                    setErrors(["Failed to delete note."]);
                }
            })
            .catch(() => setErrors(["Server error deleting note."]));
    };

    return (
        <div className="container">
            <h1>Twitter 🐦</h1>

            <section>
                <h2>Ne oluyor?</h2>

                {errors.length > 0 && (
                    <div className="alert alert-danger">
                        {errors.map((err, i) => (
                            <p key={i}>{err}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={createNote}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Kullanıcı adınız"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        name="content"
                        maxLength="500"
                        placeholder="Bir gönderi yaz (en fazla 500 karakter)"
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button type="submit">Gönder</button>
                </form>
            </section>

            <section>
                <h2>Zaman Tüneli</h2>
                <div id="timeline">
                    {notes.map((note) => (
                        <div className="post" key={note.id}>
                            <p><strong>{note.title}</strong></p>
                            {note.content && <p>{note.content}</p>}
                            <div className="post-actions">
                                <button onClick={() => deleteNote(note.id)}>
                                    🗑️ Sil
                                </button>
                            </div>
                            <div className="comments">
                                <h3>Yorumlar</h3>
                                <div className="comment">Yorum sistemi burada olabilir.</div>
                                <form>
                                    <input type="text" placeholder="Yorum ekle..." disabled />
                                    <button type="submit" disabled>Yorum Yap</button>
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
