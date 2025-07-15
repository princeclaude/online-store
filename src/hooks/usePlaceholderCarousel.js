// hooks/usePlaceholderCarousel.js
import { useEffect, useState } from "react";

export const usePlaceholderCarousel = (items = []) => {
  const [index, setIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2000); 

    return () => clearInterval(interval);
  }, [items]);

  useEffect(() => {
    if (items.length > 0) {
      setPlaceholder(`Search ${items[index]}`);
    }
  }, [index, items]);

  return placeholder;
};