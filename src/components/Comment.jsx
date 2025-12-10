import { useState } from "react";
import { useAuth } from "../AuthContext";
import { supabase } from "../supabaseClient";
import "./Comment.css";

export default function Comment({id}){
    const [comment, setComment] = useState("");
    const [loading, setLoading] =useState(false);
    const {user} = useAuth();

    async function handleSubmit(e){
        e.preventDefault();
        if (!comment) return alert("Please add some comments!");
        if (user.role == "FOH") return alert("Please log in as BOH to comment.");
        setLoading(true);

        const {error} = await supabase
            .from("posts")
            .update({comment: comment})
            .eq("id", id);
        
        if (error){
            setLoading(false)
            console.error("Error uploading comment:", error.message);
            alert("Error uploading comment.")
        }

        alert("Comment added!");
        setComment("");
        setLoading(false);
    }

    return(
        <div>
            <form onSubmit={handleSubmit} className="comment-section">
                <label className="form-label">Comment</label>
                <input
                    type="text"
                    placeholder="e.g. comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="submit-btn"
                >
                    {loading ? "Uploading...": "Add Comment"}
                </button>
            </form>
        </div>
    );
}