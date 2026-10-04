import React, { useState, useEffect, useMemo } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./ImagesLightbox.scss";
import { Skeleton } from 'antd';


const ImagesLightbox = ({ hotelImages }) => {
  const [images, setImages] = useState(hotelImages || []);

  // Sync images state when hotelImages prop arrives async (from static API)
  useEffect(() => {
    if (hotelImages && hotelImages.length > 0) {
      setImages(hotelImages);
    }
  }, [hotelImages]);

  // Filter preferred images or fallback to all
  const displayImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    const preferred = images.filter(img =>
      img?.includes("max500") || img?.includes("_P") || img?.includes("_z") || img?.includes("_b")
    );
    return preferred.length > 0 ? preferred : images;
  }, [images]);

  // Preload first image for instant rendering
  useEffect(() => {
    if (displayImages.length > 0) {
      const img = new Image();
      img.src = displayImages[0];
    }
  }, [displayImages]);

  const onImageError = (ui) => {
    setImages((prev) => prev.filter(e => e !== ui));
  };

  if (!displayImages || displayImages.length === 0) {
    return (
      <Skeleton.Image
        active
        style={{ width: '865px', height: '376px', borderRadius: '8px' }}
      />
    );
  }

  return (
    <div className="carous-wrapper">
      <Carousel
        showStatus={false}
        showIndicators={false}
        dynamicHeight={false}
        centerMode={displayImages.length > 1}
        centerSlidePercentage={displayImages.length > 1 ? 80 : 100}
        selectedItem={displayImages.length > 1 ? 1 : 0}
        useKeyboardArrows={true}
        swipeable={true}
        emulateTouch={true}
      >
        {displayImages.map((hotelImage, i) => (
          <div key={"hotel-" + i} style={{ position: "relative", minHeight: "376px", backgroundColor: "#e8ecef", borderRadius: "8px", overflow: "hidden" }}>
            <img
              src={hotelImage}
              alt={`hotel-${i}`}
              className="carousel-ima"
              loading={i <= 2 ? "eager" : "lazy"}
              fetchpriority={i === 0 ? "high" : "auto"}
              onError={() => onImageError(hotelImage)}
              style={{
                width: "100%",
                height: "376px",
                objectFit: "cover",
                borderRadius: "8px",
                display: "block",
              }}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImagesLightbox;
