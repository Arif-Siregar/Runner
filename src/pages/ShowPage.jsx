import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function ShowPage() {
  const [posts, setPosts] = useState([]);

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

  return (
    <div style={{ padding: 20 }}>
      <h2>Uploaded Items</h2>
      <p>
        <Link to="/add">Add new item →</Link>
      </p>

      {posts.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {posts.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                borderRadius: 8,
                maxWidth: 300,
              }}
            >
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.id}
                  style={{ width: "100%", borderRadius: 8 }}
                />
              ) : (
                <p>(No Image)</p>
              )}
              <p>{p.title}</p>

              {p.size ? <p>Size: {p.size}</p> : <p>Size: same</p>}
              {p.color ? <p>Color: {p.color}</p> : <p>Color: same</p>}
              <p>Quantity: {p.quantity}</p>
              <p>Location: {p.location}</p>
              <p>Edu: {p.name}</p>
              <button onClick={() => handleDelete(p)}>
                <img src="/icons/trash.png" alt="Delete" className="delete-icon" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
