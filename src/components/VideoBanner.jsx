import React, { useRef, useState } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

const VideoBanner = () => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative w-full h-[60vh] sm:h-[500px] overflow-hidden bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src="/manwalks.mp4"
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center bg-black bg-opacity-30">
        <h1 className="text-white text-xl sm:text-3xl font-semibold mb-2">
          CLASSIC ROYAL SUMMER 2025.
        </h1>
        <p className="text-white text-sm sm:text-base max-w-md">
          Curated by Virgil Borno from Louis Vuitton.
        </p>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayback}
        className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white rounded-full p-3 sm:p-2 hover:bg-opacity-70"
      >
        {playing ? (
          <FaPause className="text-lg" />
        ) : (
          <FaPlay className="text-lg" />
        )}
      </button>
    </div>
  );
};

export default VideoBanner;
