import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AllProducts = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage
        .from("classicproducts")
        .list("public", { limit: 100, sortBy: { column: "name", order: "asc" } });

      if (error) {
        console.error("Error loading images:", error);
      } else {
        const urls = data.map((file) => {
          const { publicUrl } = supabase.storage
            .from("classicproducts")
            .getPublicUrl(`public/${file.name}`);
          return publicUrl;
        });

        setImages(urls);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
      {images.map((url, index) => (
        <div key={index} className="border p-2 rounded">
          <img src={url} alt={`Product ${index + 1}`} className="w-full h-auto" />
        </div>
      ))}
    </div>
  );
};

export default AllProducts;