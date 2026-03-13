export default async function compressImage(file){
  const img = new Image();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.onload = (event) => {
      img.src = event.target.result;
    };

    img.onload = () => {
      const maxWidth = 800; // limit width
      const scale = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.7 // compression quality (0–1)
      );
    };

    reader.readAsDataURL(file);
  });
}