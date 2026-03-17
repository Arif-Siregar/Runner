import { useState } from "react";
import {supabase} from "../supabaseClient";
import "./FeedbackPage.css";

export default function FeedbackPage(){
    const [name, setName] = useState("");
    const [feedback, setFeedback] = useState("");
    const [deviceId, setDeviceId] = useState("");

    async function handleSubmit(e){
        e.preventDefault();
        
        if (!feedback) return alert("Please provide some feedback.");

        const { error: dbError } = await supabase
              .from("feedbacks")
              .insert([{ name:name,
                device_id:deviceId,
                feedback:feedback,
              }]);

        if (dbError){
            return alert("Error giving feedback: " + dbError.message);
        }

        alert("Thank you for the feedback!");
        setName("");
        setDeviceId("");
        setFeedback("");
    }

    return (
        <div className="feedbackpage-container">
            <h2>Feedback</h2>
            <form onSubmit={handleSubmit} className="form">
                <label className="form-label">Name</label>
                <input
                    type="text"
                    value={name}
                    placeholder="Optional"
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                />

                <br /><br />

                <label className="form-label">Device ID</label>
                <input 
                    type="text"
                    value={deviceId}
                    placeholder="Optional"
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="form-input"
                />

                <br /><br />

                <label className="form-label">Feedback</label>
                <textarea 
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="paragraph-input"
                />

                <br /><br />

                <button type="submit" className="submit-btn">Submit</button>

            </form>
        </div>
    )
}