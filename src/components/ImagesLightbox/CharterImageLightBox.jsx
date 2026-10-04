import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./ImagesLightbox.scss";

const BASE = import.meta.env.VITE_BASE_URL;

const CharterFlightImageLightBox = ({ CharterImages }) => {
  return (
    <>
      <div className="charterFlight-wrapper main-chater-wrapper">
        {CharterImages.length === 1 ? (
          <Carousel showIndicators={true} showStatus={false} showThumbs={false}>
            {CharterImages.map((visaImage, i) => (
              <div key={i + "hotelimg"}>
                <img src={visaImage} alt="image" className="carousel-images" />
              </div>
            ))}
          </Carousel>
        ) : (
          <Carousel
            showStatus={false}
            showIndicators={true}
            dynamicHeight={false}
            centerMode={true}
            centerSlidePercentage={100}
            selectedItem={1}
            showThumbs={false}
          >
            {CharterImages.map((visaImage, i) => (
              <div key={"hotel" + i}>
                <img src={visaImage} alt="image1" className="carousel-images" />
              </div>
            ))}
          </Carousel>
        )}
      </div>
    </>
  );
};
export default CharterFlightImageLightBox;
