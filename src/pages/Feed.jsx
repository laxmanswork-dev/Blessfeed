import React, { useEffect, useState } from "react";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  // 🧠 Mood → Border color logic
  const getMoodBorder = (mood) => {
    if (mood === "😄" || mood === "🙂" || mood === "✨") {
      return "border-green-400";
    }

    if (mood === "😐") {
      return "border-slate-300";
    }

    if (mood === "😟" || mood === "😡") {
      return "border-red-400";
    }

    return "border-slate-200";
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Loading feed...
      </div>
    );
  }

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white border-x border-slate-200 px-4 py-6">
      <h1 className="text-xl font-semibold text-center mb-6">Feed</h1>

      {posts.map((post) => (
        <div
          key={post._id}
          className={`border-2 rounded-xl p-4 mb-4 ${getMoodBorder(
            post.mood
          )}`}
        >
          {/* Title + Mood */}
          <div className="flex justify-between items-start">
            <h2 className="font-semibold text-slate-900">{post.title}</h2>
            <span className="text-xl">{post.mood}</span>
          </div>

          {/* Content */}
          <p className="text-slate-700 mt-1">{post.content}</p>

          {/* Date */}
          <p className="text-[11px] text-slate-400 mt-2">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
