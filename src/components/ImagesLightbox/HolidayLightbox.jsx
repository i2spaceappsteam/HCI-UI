// import React from "react";
// import "react-image-gallery/styles/scss/image-gallery.scss";
// import Slider from "react-slick";

// const HolidayLightbox = ({ holidayImages, withBase = false }) => {
//   const BASE = import.meta.env.VITE_BASE_URL;

//   let sliderImages = [];
//   let images = {};
//   if (withBase) {
//     images = holidayImages.map((item) => ({
//       original: item,
//       thumbnail: item,
//     }));
//   } else {
//     images = holidayImages.map((item) => ({
//       original: BASE + item.substring(1),
//       thumbnail: BASE + item.substring(1),
//     }));
//   }

//   sliderImages.push(images);

//   return (
//     <>
//       <div className="carousel-wrapper holiday-carousel">
//         {
//           <div className="holiday-carousel-box">
//             {sliderImages.length > 0 ? (
//               <ImageGallery
//                 items={sliderImages[0]}
//                 thumbnailPosition={"left"}
//                 showNav={false}
//                 showFullscreenButton={false}
//                 showPlayButton={false}
//                 autoPlay={true}
//               />
//             ) : null}
//           </div>
//         }
//       </div>
//     </>
//   );
// };
// export default HolidayLightbox;
