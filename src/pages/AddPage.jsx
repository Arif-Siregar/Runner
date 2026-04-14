import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "./AddPage.css"
import { useAuth } from "../AuthContext";
import ShowPageBOH from "./ShowPageBOH";
import compressImage from "../components/compressImage";
import useUnsavedChanges from "../hooks/useUnsavedChanges";

export default function AddPage() {
  const [title, setTitle] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [queue, setQueue] = useState([]);
  const {user} = useAuth();
  const [location, setLocation] = useState(user.location);
  const [showSubmitInfo, setShowSubmitInfo] = useState(false);
  const [showAddInfo, setShowAddInfo] = useState(false);

  useUnsavedChanges(queue.length > 0);

  useEffect(() => {
    const handleClick = () => {
      setShowAddInfo(false);
      setShowSubmitInfo(false);
    };

    if (showAddInfo || showSubmitInfo){
      window.addEventListener("pointerdown", handleClick);
    }

    return () => window.removeEventListener("pointerdown", handleClick);
  }, [showAddInfo, showSubmitInfo]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!queue) return alert("Please provide an item first by pressing Add Item before submitting.");
    setSubmitLoading(true);
    setAddLoading(true);

    const {data: group} = await supabase
      .from("groups")
      .insert({
        count:queue.length,
        name:user.name,
        location:location,
      })
      .select()
      .single();
    
    setQueue(queue.map(post => post.group = group.id));

    const { error: PostsDbError } = await supabase
      .from("posts")
      .insert(queue);

    if (PostsDbError) {
      setSubmitLoading(false);
      setAddLoading(false);
      return alert("Error saving post: " + PostsDbError.message);
    }
    
    alert("All items have been submitted!");
    setQueue([]);
    setSubmitLoading(false);
    setAddLoading(false);
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!file && !title) return alert("Please provide at least an item's name or a WWMT tag.");
    if (user.role === "BOH") return alert("Please log in as FOH to add item");
    var imageUrl = null;
    var filePath = null;
    setAddLoading(true);
    setSubmitLoading(true);

    if (file){
      const compressedFile = await compressImage(file);
      filePath = `uploads/${Date.now()}-${compressedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, compressedFile);

      if (uploadError) {
        setAddLoading(false);
        setSubmitLoading(false);
        return alert("Error uploading image: " + uploadError.message);
      }

      const { data } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }
    setQueue([...queue, { title:title,
        size:size,
        color:color,
        quantity:quantity,
        location:location,
        name:user.name,
        image_url: imageUrl,
        image_path: filePath,
        repost:false,
      } ]);

    // const notification_result = await supabase.functions.invoke("send-new-post-push", {
    //   body: {
    //     title: "New item requested",
    //     body: "Find something",
    //   },
    // });

    // console.log(notification_result);

    setTitle("");
    setSize("");
    setColor("");
    setQuantity(1);
    setFile(null);
    setAddLoading(false);
    setSubmitLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <div>
        <form onSubmit={handleSubmit} className="form">
          {/* Section 1: Image or Item Name */}
          <section className="form-section">
            <h3 className="section-title">1️⃣ WWMT Tag or Item Name</h3>
            <p className="section-hint">
              <strong>Take a picture of WWMT tag</strong> or <strong>search for item's name</strong>.
            </p>

            <label className="form-label">WWMT tag picture</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files[0])}
              className="form-input"
            />

            <div className="divider">or</div>
            
            <label className="form-label">Provide Item's Name</label>
            <input
              type="text"
              placeholder="e.g. Define Jacket Nulu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </section>

          {/* Section 2: Details */}
          <section className="form-section">
            <h3 className="section-title">2️⃣ Item Details</h3>

            <label className="form-label">Size</label>
            <input
              type="text"
              placeholder="e.g. M"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="form-input"
            />
            <p className="input-hint">Leave blank if same as WWMT tag</p>

            <label className="form-label">Color</label>
            <input
              type="text"
              placeholder="e.g. BLK"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="form-input"
            />
            <p className="input-hint">Leave blank if same as WWMT tag</p>

            <label className="form-label">Quantity</label>
            <input
              type="text"
              placeholder="e.g. 3"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
            />

            <label className="form-label">Location</label>
            <select
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
            >
              <option value="Cash">Cash</option>
              <option value="Fits">Fits</option>
              <option value="M Pant">M Pant</option>
              <option value="W Pant">W Pant</option>
              <option value="Zone 1">Z1</option>
              <option value="Zone 2">Z2</option>
              <option value="Zone 3">Z3</option>
            </select>
            <p className="input-hint">Change location if you are not at {user.location}</p>
          </section>

          <div className="form-submission-actions">
            <div className="btn-actions">
              <button
                type="button"
                disabled={addLoading}
                onClick={handleAddItem}
                className="add-item-btn"
              >
                {addLoading ? "Uploading..." : "Add Item"}
              </button>

              <button
                type="button"
                className="info-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddInfo(!showAddInfo);
                }}
              >
                ⓘ
              </button>
            </div>

            <div className="btn-actions">
              <button
                type="submit"
                disabled={submitLoading  || queue.length === 0}
                className="submit-items-btn"
              >
                Submit {queue.length}
              </button>

              <button
                type="button" 
                className="info-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubmitInfo(!showSubmitInfo);
                }}
              >
                ⓘ
              </button>
            </div>
          </div>
          
          {showAddInfo &&   (
            <div className="info-box">
              Press this first to add one or more items into the queue.
              Number of items added can be seen on the submit button.
              Submit button have to be pressed to send all items to BOH.
            </div>
          )}

          {showSubmitInfo &&   (
            <div className="info-box">
              Press this to send all items added to BOH.
            </div>
          )}
        </form>
      </div>

      <div>
        <ShowPageBOH />
      </div>

    </div>
  );
}
