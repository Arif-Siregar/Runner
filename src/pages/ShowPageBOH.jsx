import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "./ShowPageBOH.css"
import { useAuth } from "../AuthContext";

export default function ShowPageBOH() {
  const [posts, setPosts] = useState([]);
  const {user} = useAuth();

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setPosts(data);
    }

    fetchPosts();

    const channel = supabase
      .channel("realtime-posts")
      .on(
        "postgres_changes",
        {event:'INSERT', schema:'public', table:'posts'},
        (payload) => {
          setPosts((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
        (payload) => {
          setPosts((prev) =>
            prev.map((p) => (p.id === payload.new.id ? payload.new : p))
          );
        }
      )
      .on(
        "postgres_changes",
        {event:'DELETE', schema:'public', table:'posts'},
        (payload) => {
          setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      ).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleDelete(p){
    const {error} = await supabase
      .from("posts")
      .delete()
      .eq("id", p.id)

    if (error){
      console.error("Error deleting item:", error.message);
      alert("Error deleting item.")
    }

    if (p.image_path){
      const {error: storageError} = await supabase.storage
        .from("uploads")
        .remove([p.image_path]);

      if (storageError) {
        console.error("Error deleting image:", storageError.message);
        alert("Warning: Item deleted but image not removed.");
      }
    }

    setPosts((prev) => prev.filter((post) => post.id !== p.id));
  }

  async function handleInProgress(p){
    const { error } = await supabase
      .from("posts")
      .update({ in_progress: user.name })
      .eq("id", p.id);

    if (error){
      console.error("Error updating item:", error.message);
      alert("Error updating item.")
    }

    setPosts((prev) => prev.map((post) => post.id === p.id
        ? { ...post, in_progress: user.name }
        : post))

    alert("You got this!");
  }

  return (
    <div className="showpage-container">
      <h2>Uploaded Items</h2>
      <p>
        <Link to="/add">Add new item →</Link>
      </p>

      {posts.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <div className="posts-grid">
          {posts.map((p) => (
            <div
              key={p.id}
              className="post-card"
            >
              {p.in_progress ? <p>{p.in_progress} is working on it...</p>: null}
              {p.image_url ? (
                <img
                  className="post-image"
                  src={p.image_url}
                  alt={p.id}
                />
              ) : (
                <p>(No Image)</p>
              )}
              <p className="post-title">{p.title}</p>

              {p.size ? <p>Size: {p.size}</p> : <p>Size: same</p>}
              {p.color ? <p>Color: {p.color}</p> : <p>Color: same</p>}
              <p>Quantity: {p.quantity}</p>
              <p>Location: {p.location}</p>
              <p>Edu: {p.name}</p>
              <div className="post-actions">
                <button
                  className={p.in_progress? "btn-progress-disabled": "btn-progress"}
                  disabled={p.in_progress}
                  onClick={() => handleInProgress(p)}
                >
                  {p.in_progress ? "In Progress" : "Got it!"}
                </button>

                <button
                  className="delete-btn" 
                  onClick={() => handleDelete(p)}
                >
                  <img src="/icons/trash.png" alt="Delete" className="delete-icon" />
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
