import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "./AddPage.css"
import { useAuth } from "../AuthContext";

export default function AddPage() {
  const [title, setTitle] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const {user} = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file && !title) return alert("Please provide at least an item's name or a WWMT tag.");
    if (user.role === "BOH") return alert("Please log in as FOH to add item");
    var imageUrl = null;
    var filePath = null;
    setLoading(true);

    if (file){
      filePath = `uploads/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) {
        setLoading(false);
        return alert("Error uploading image: " + uploadError.message);
      }

      const { data } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    const { error: dbError } = await supabase
      .from("posts")
      .insert([{ title:title,
        size:size,
        color:color,
        quantity:quantity,
        location:user.location,
        name:user.name,
        image_url: imageUrl,
        image_path: filePath }]);
    

    if (dbError) {
      setLoading(false);
      return alert("Error saving post: " + dbError.message);
    }

    alert("Item added!");
    setTitle("");
    setSize("");
    setColor("");
    setQuantity(1);
    setFile(null);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
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
        </section>

        <button
          type="submit"
          disabled={loading}
          className="submit-btn"
        >
          {loading ? "Uploading..." : "Add Item"}
        </button>
      </form>

      <p><Link to="/show">View all items →</Link></p>
    </div>
  );
}
