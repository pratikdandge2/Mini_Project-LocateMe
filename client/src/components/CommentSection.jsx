import { useState, useEffect, useCallback } from "react";
import { fetchComments, postComment, deleteComment } from "../services/api";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDistanceToNow } from "../utils/date";
import styles from "./CommentSection.module.css";

export default function CommentSection({ itemId }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const handleNewComment = useCallback((comment) => {
    setComments((prev) => [...prev, comment]);
  }, []);

  const handleDeleteCommentSocket = useCallback((commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  }, []);

  useSocket(itemId, handleNewComment, handleDeleteCommentSocket);

  useEffect(() => {
    let cancelled = false;
    fetchComments(itemId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await postComment(itemId, trimmed);
      setText("");
      addToast('💬 Comment posted!', 'success');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    try {
      await deleteComment(itemId, commentId);
    } catch (err) {
      console.error("Failed to delete comment");
      addToast('Failed to delete comment.', 'error');
    }
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>
        COMMENTS {comments.length > 0 ? `(${comments.length})` : ""}
      </h3>
      {loading ? (
        <p className={styles.muted}>Loading comments…</p>
      ) : (
        <ul className={styles.list}>
          {comments.map((c) => (
            <li key={c._id} className={styles.comment}>
              <div className={styles.commentAvatar}>
                {c.postedBy?.photoURL ? (
                  <img
                    src={c.postedBy.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>
                    {(c.postedBy?.displayName || "?")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <span className={styles.commentName}>
                    {c.postedBy?.displayName || "Anonymous"}
                  </span>
                  <span className={styles.commentTime}>
                    {formatDistanceToNow(c.createdAt)}
                  </span>
                  {user && c.postedBy?.uid === user.uid && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(c._id)}
                      title="Delete comment"
                    >
                      DELETE
                    </button>
                  )}
                </div>
                <p className={styles.commentText}>{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          className={styles.input}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className={styles.sendBtn}
        >
          SEND →
        </button>
      </form>
    </section>
  );
}
