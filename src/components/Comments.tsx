import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  where,
  increment,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Comment as CommentType } from "../types";
import { MessageSquare, Heart, Send, CornerDownRight, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommentsProps {
  videoId: string;
}

export const Comments: React.FC<CommentsProps> = ({ videoId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [isNaming, setIsNaming] = useState(!localStorage.getItem("userName"));

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommentType[];
      setComments(docs);
    });

    return () => unsubscribe();
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!newComment.trim() || !userName) return;

    try {
      await addDoc(collection(db, "comments"), {
        text: newComment,
        userName,
        userId: "anonymous", // Simple for now
        timestamp: serverTimestamp(),
        parentId,
        likes: 0,
        videoId
      });
      setNewComment("");
      setReplyTo(null);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleLike = async (commentId: string) => {
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, {
      likes: increment(1)
    });
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem("userName", userName);
      setIsNaming(false);
    }
  };

  const topLevelComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="mt-8 bg-zinc-900/50 rounded-3xl p-6 border border-white/5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black flex items-center gap-3">
          <MessageSquare className="text-blue-400" /> COMMUNITY REVIEWS
        </h3>
        {userName && (
          <div className="text-xs font-mono text-white/40 flex items-center gap-2">
            <User size={12} /> {userName}
            <button onClick={() => setIsNaming(true)} className="hover:text-white underline">Change</button>
          </div>
        )}
      </div>

      {isNaming ? (
        <form onSubmit={handleNameSubmit} className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-sm font-bold mb-4 opacity-60 uppercase tracking-widest">Enter your name to join the conversation</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-sm transition-all">
              JOIN
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What touched your heart about this movie?"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-14 text-sm focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-none"
            />
            <button 
              type="submit" 
              className="absolute bottom-4 right-4 p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {topLevelComments.map(comment => (
            <motion.div 
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-xs shrink-0">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-blue-400">{comment.userName}</span>
                      <span className="text-[10px] font-mono text-white/20">
                        {comment.timestamp?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      <button 
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                      >
                        <Heart size={12} className={comment.likes > 0 ? "fill-red-400 text-red-400" : ""} />
                        {comment.likes} {comment.likes === 1 ? 'React' : 'Reacts'}
                      </button>
                      <button 
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                      >
                        <MessageSquare size={12} />
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Reply Input */}
                  {replyTo === comment.id && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={(e) => handleSubmit(e, comment.id)} 
                      className="mt-3 ml-4"
                    >
                      <div className="relative">
                        <input
                          autoFocus
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={`Replying to ${comment.userName}...`}
                          className="w-full bg-black/60 border border-white/10 rounded-xl p-3 pr-12 text-xs focus:outline-none focus:border-blue-500"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-400">
                          <Send size={14} />
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Nested Replies */}
                  <div className="mt-4 ml-6 space-y-4 border-l-2 border-white/5 pl-6">
                    {getReplies(comment.id).map(reply => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-[10px] shrink-0 border border-white/10">
                          {reply.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-purple-400">{reply.userName}</span>
                            <span className="text-[9px] font-mono text-white/20">
                              {reply.timestamp?.toDate().toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-white/70">{reply.text}</p>
                          <div className="mt-2">
                            <button 
                              onClick={() => handleLike(reply.id)}
                              className="flex items-center gap-1 text-[9px] font-bold text-white/30 hover:text-red-400"
                            >
                              <Heart size={10} className={reply.likes > 0 ? "fill-red-400 text-red-400" : ""} />
                              {reply.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
