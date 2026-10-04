import React, { useState } from "react";

const hotelNoImg = import.meta.env.VITE_Image_URL ;
const HotelCardImage = ({ hotelDetailsRespObj, hotelRoom, onHandleModal }) => {
  const [showImage, setShowImage] = useState(true);
  return hotelDetailsRespObj?.images?.length > 0 ? (
    <div>

      <img
        src={
          showImage
            ? hotelDetailsRespObj?.images[
                Math.floor(Math.random() * hotelDetailsRespObj?.images?.length)
              ]
            : hotelNoImg+ "images/hotels/no_photo.png"
        }
        alt={hotelRoom.roomName}
        onError={() => {
          setShowImage(false);
        }}
        style={{width:'100%', height:'160px'}}
      />
      
    </div>
  ) : null;
};

export default HotelCardImage;
