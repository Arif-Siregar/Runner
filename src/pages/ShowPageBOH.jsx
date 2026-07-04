import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import Firebase from "../components/Firebase";
import "./ShowPageBOH.css"
import { useAuth } from "../AuthContext";
import Comment from "../components/Comment"
import sortByCreatedAt from "../components/sortByCreatedAt";

export default function ShowPageBOH() {
  const [posts, setPosts] = useState([]);
  const [showCompletedInfo, setShowCompletedInfo] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const {user} = useAuth();
  
  const gotItSoundRef = useRef(new Audio("https://qbbbsznsxhfllwhborju.supabase.co/storage/v1/object/public/ringtone/check.mp3"));
  const updateSoundRef = useRef(new Audio("https://qbbbsznsxhfllwhborju.supabase.co/storage/v1/object/public/ringtone/ding.mp3"));

  const playUpdateSound = () => {
    updateSoundRef.current.currentTime = 0;
    updateSoundRef.current.play().catch(() => {console.warn("User hasn't interacted yet. Sound blocked.");});
  };

  const playGotItSound = () => {
    gotItSoundRef.current.currentTime = 0;
    gotItSoundRef.current.play().catch(() => {console.warn("User hasn't interacted yet. Sound blocked.");});
  };

  useEffect(() => {
    updateSoundRef.current.load();
    gotItSoundRef.current.load();

    async function fetchPosts() {
      let tempData = null;
      let tempError = null;
      if (user.role === "BOH"){
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("in_view", true)
          .order("created_at_boh", { ascending: false });
        tempData = data
        tempError = error
      } else {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("in_view", true)
          .order("created_at_foh", { ascending: false });
        tempData = data
        tempError = error
      }

      if (tempError) console.error(tempError);
      else setPosts(tempData);
    }

    fetchPosts();

    function updatePost(old_p, new_p){
      if ((new_p.in_progress !== old_p.in_progress) && (new_p.in_progress !== user.name)){
        playGotItSound();
      } 

      if (user.role === "BOH"){
        if (new_p.repost !== old_p.repost){
          playUpdateSound();
        }
      }
      if (user.role === "FOH") {
        if (new_p.comment !== old_p.comment){
          playUpdateSound();
        }
      }
      return new_p
    }

    const channel = supabase
      .channel("realtime-posts")
      .on(
        "postgres_changes",
        {event:'INSERT', schema:'public', table:'posts'},
        (payload) => {
          setPosts((prev) => sortByCreatedAt([payload.new, ...prev], user.role));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
        (payload) => {
          if (payload.new.in_view === false){
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
          } else {
            setPosts((prev) =>
              sortByCreatedAt(prev.map((p) => (p.id === payload.new.id ? (updatePost(p, payload.new)) : p)), user.role)
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {event:'DELETE', schema:'public', table:'posts'},
        (payload) => {
          setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      )
      .on(
        "postgres_changes",
        {event:'INSERT', schema:'public', table:'posts'},
        () => {
          if (user.role === "BOH"){
            playUpdateSound();
          }
        }
      ).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleClick = () => {
      setShowCompletedInfo(false);
    };

    if (showCompletedInfo){
      window.addEventListener("pointerdown", handleClick);
    }

    return () => window.removeEventListener("pointerdown", handleClick);
  }, [showCompletedInfo]);

  async function handleDelete(p){
    setDeleteLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("in_view")
      .eq("id", p.id)

    if (error){
      console.error(error)
      setDeleteLoading(false)
      return alert("Item does not exist")
    };

    if (data[0].in_view){

      let tempUpdate = {};
      if (user.role === "BOH"){
        tempUpdate = { 
          in_view: false, 
          completed_at: new Date().toISOString(),
          is_completed: true,
        }
      } else {
        tempUpdate = { 
          in_view: false, 
          completed_at: new Date().toISOString(),
        }
      }

      const {postsUpdateError} = await supabase
        .from("posts")
        .update(tempUpdate)
        .eq("id", p.id)

      if (postsUpdateError){
        console.error("Error deleting item:", postsUpdateError.message);
        setDeleteLoading(false)
        return alert("Error deleting item.")
      }

      const {groupsUpdateError} = await supabase
        .from("groups")
        .update({ completed_at: new Date().toISOString(), })
        .eq("id", p.group)

      if (groupsUpdateError){
        console.error("Error deleting item:", groupsUpdateError.message);
        setDeleteLoading(false)
        return alert("Error deleting item.")
      }
    }
    
    setDeleteLoading(false);
  }

  async function handleInProgress(p){
    const { error } = await supabase
      .from("posts")
      .update({ in_progress: user.name,
                created_at_boh: new Date().toISOString(),
                created_at_foh: new Date().toISOString(),
                in_progress_at: new Date().toISOString(),
       })
      .eq("id", p.id);

    if (error){
      console.error("Error updating item:", error.message);
      alert("Error updating item.")
    }else{
      alert("You got this!");
    }
  }

  async function handleRepost(p){
    const { error } = await supabase
      .from("posts")
      .update({
        created_at_boh: new Date().toISOString(),
        created_at_foh: new Date().toISOString(),
        repost: true,
      })
      .eq("id", p.id);

    if (error) {
      console.error("Error updating item:", error.message);
      alert("Error updating item.")
    } else {
      alert("The request has been reposted.")
    }
  }

  return (
    <div className="showpage-container">
      <h2>Uploaded Items</h2>

      {posts.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <div className="posts-grid">
          {posts.map((p) => (
            <div
              key={p.id}
              className={`post-card ${p.repost? "repost" : ""} ${p.markdown? "markdown" : ""}`}
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

              {p.size ? <p style={{background:`${user.role==="BOH" ? "green" : ""}`}}>Size: {p.size}</p> : <p>Size: same</p>}
              {p.color ? <p style={{background:`${user.role==="BOH" ? "green" : ""}`}}>Color: {p.color}</p> : <p>Color: same</p>}
              <p style={{background:`${(user.role==="BOH" && p.quantity !== 1) ? "green" : ""}`}}>Quantity: {p.quantity}</p>
              <p>Location: {p.location}</p>
              <p>Edu: {p.name}</p>
              
              {p.comment ? (
                <p style={{background:`${user.role==="FOH" ? "green" : ""}`}}>Comment: {p.comment}</p>
              ): (
                (user.role === "BOH" && <Comment id={p.id} />)
              )}

              <div className="post-actions">
                {(user.role === "FOH") && (<button
                  className="repost-btn"
                  onClick={() => handleRepost(p)}
                >
                  Repost
                </button>)}

                {(user.role === "BOH") && (<button
                  className={p.in_progress? "btn-progress-disabled": "btn-progress"}
                  disabled={p.in_progress}
                  onClick={() => handleInProgress(p)}
                >
                  {p.in_progress ? "In Progress" : "Got it!"}
                </button>)}

                <div className="btn-actions">
                  <button
                    className="delete-btn" 
                    disabled={deleteLoading}
                    onClick={() => handleDelete(p)}
                  >
                    {user.role === "BOH"? "Completed" : "Cancel request"}
                  </button>

                  <button
                    type="button"
                    className="info-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCompletedInfo(!showCompletedInfo);
                    }}
                  >
                    ⓘ
                  </button>
                </div>
              </div>
            </div>
          ))}

          {showCompletedInfo &&   (
            <div className="info-box">
              {user.role === "BOH" && "Remember to press this button after the request is completed."}
              {user.role === "FOH" && "Press this button only when cancelling request," + 
              " ie. wrong order is submitted or item is not available in BOH." +
              " Order completion only need to be confirmed by BOH."}
            </div>
          )}
        </div>
      )}
      <footer className="site-footer">
        <p>
          Leave some feedback or suggestion <a href="/feedback">here</a>.
        </p>
      </footer>
    </div>
  );
}
