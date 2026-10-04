import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./ImagesLightbox.scss";
// import visa from "../../assets/images/invest-new.jpg"
const BASE = import.meta.env.VITE_BASE_URL;
const visa = import.meta.env.VITE_BASE_URL + "images/invest-new.jpg";
const VisaImageLightBox = ({ visaImages }) => {
  return (
    <>
      <div className="visacarousel-wrapper">
        {/* {console.log(visaImages, "image")} */}
        {visaImages.length === 1 ? (
          <img
          size={100}
            src={BASE + visaImages?.[0]?.Image.substring(1)}
            alt="image"
            className="carousel-images"
          /> ) : (
            <img
            size={100}
            src={visa}
            alt="image"
            className="carousel-images"
          /> )}

          
        {/* {visaImages.length === 1 ? (
          <Carousel showIndicators={false} showStatus={false}>
            {visaImages.map((visaImage, i) => (
              <div key={i + "hotelimg"}>
                <img
                  src={BASE + visaImage.Image.substring(1)}
                  alt="image"
                  className="carousel-images"
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <Carousel
            showStatus={false}
            showIndicators={false}
            dynamicHeight={false}
            centerMode={true}
            centerSlidePercentage={100}
            selectedItem={1}
          >
            {visaImages.map((visaImage, i) => (
              <div key={"hotel" + i}>
                <img
                  src={BASE + visaImage.Image.substring(1)}
                  alt="image1"
                  className="carousel-images"
                />
              </div>
            ))}
          </Carousel>
        )} */}
      </div>
    </>
  );
};
export default VisaImageLightBox;
