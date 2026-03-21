import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (itemId, onNewComment, onDeleteComment) => {
  const socketRef = useRef(null);
  const onNewCommentRef = useRef(onNewComment);
  const onDeleteCommentRef = useRef(onDeleteComment);
  
  onNewCommentRef.current = onNewComment;
  onDeleteCommentRef.current = onDeleteComment;

  useEffect(() => {
    if (!itemId) return;

    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;
    socket.emit("join_item", itemId);
    
    socket.on("new_comment", (comment) => {
      onNewCommentRef.current?.(comment);
    });
    
    socket.on("delete_comment", (commentId) => {
      onDeleteCommentRef.current?.(commentId);
    });

    return () => {
      socket.emit("leave_item", itemId);
      socket.disconnect();
    };
  }, [itemId]);
};
