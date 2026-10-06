import React, { useState, useEffect, useMemo, useRef } from "react";
import { Skeleton, Modal } from "antd";
import { LeftOutlined, RightOutlined, ExpandOutlined, PictureOutlined } from "@ant-design/icons";
import "./ImagesLightbox.scss";

const ImagesLightbox = ({ hotelImages }) => {
  const [images, setImages] = useState(hotelImages || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const thumbStripRef = useRef(null);

  useEffect(() => {
    if (hotelImages && hotelImages.length > 0) {
      setImages(hotelImages);
      setCurrentIndex(0);
    }
  }, [hotelImages]);

  const displayImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    return images.filter(Boolean);
  }, [images]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  };

  const handleSelectThumb = (index) => {
    setCurrentIndex(index);
    if (thumbStripRef.current) {
      const thumbElement = thumbStripRef.current.children[index];
      if (thumbElement) {
        thumbElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  };

  if (!displayImages || displayImages.length === 0) {
    return (
      <Skeleton.Image
        active
        style={{ width: "100%", height: "380px", borderRadius: "12px" }}
      />
    );
  }

  const currentImg = displayImages[currentIndex] || displayImages[0];

  return (
    <div className="modern-lightbox-gallery">
      {/* Main Image Showcase */}
      <div className="main-image-display" onClick={() => setIsModalOpen(true)}>
        <img
          src={currentImg}
          alt={`Hotel Photo ${currentIndex + 1}`}
          className="active-showcase-img"
          onError={(e) => {
            e.target.src = "/images/hotels/no_photo.png";
          }}
        />

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav-arrow prev"
              onClick={handlePrev}
              aria-label="Previous Photo"
            >
              <LeftOutlined />
            </button>
            <button
              type="button"
              className="gallery-nav-arrow next"
              onClick={handleNext}
              aria-label="Next Photo"
            >
              <RightOutlined />
            </button>
          </>
        )}

        {/* Badges Overlay */}
        <div className="gallery-badges-overlay">
          <div className="photo-counter-badge">
            <PictureOutlined /> {currentIndex + 1} / {displayImages.length} Photos
          </div>
          <button
            type="button"
            className="fullscreen-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <ExpandOutlined /> Fullscreen
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Thumbnails Strip */}
      {displayImages.length > 1 && (
        <div className="gallery-thumbnails-strip" ref={thumbStripRef}>
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className={`thumbnail-item ${idx === currentIndex ? "active" : ""}`}
              onClick={() => handleSelectThumb(idx)}
            >
              <img
                src={img}
                alt={`Thumb ${idx + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={960}
        centered
        className="gallery-fullscreen-modal"
      >
        <div className="modal-fullscreen-viewer">
          <img src={currentImg} alt="Hotel Fullscreen" className="fullscreen-modal-img" />
          {displayImages.length > 1 && (
            <div className="modal-nav-controls">
              <button onClick={handlePrev} className="modal-arrow prev"><LeftOutlined /></button>
              <span className="modal-counter">{currentIndex + 1} / {displayImages.length}</span>
              <button onClick={handleNext} className="modal-arrow next"><RightOutlined /></button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ImagesLightbox;
