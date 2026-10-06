import React from "react";
import Slider from "react-slick";
import { Card } from "antd";

import "./QueryContainer.scss";
import { WeiboCircleFilled } from "@ant-design/icons";

const MobileSlidersettings = {
  arrows: false,
  dots: false,
  slidesToShow: 4,
  speed: 500,
  smooth: true,
  slidesToScroll: 1,
  initialSlide: 1,
  infinite: true,
  autoplay: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 1,
        infinite: true,
        centerMode: true,
        arrows: false,
      },
    },
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        arrows: false,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
      },
    },
  ],
};

const QueryContainer = () => {
  const queryData = [
    {
      title: "What do hotel ratings?",
      description:
        "The number of stars indicates the standard and amenities that you can expect in a hotel. The more, the more luxurious the conditions are.",
    },
    {
      title: "Different types of rooms",
      description:
        "Hotel rooms may be divided by the number of guests and types of beds. Single Room, Double Room, Executive, VIP Rooms, etc.",
    },
    {
      title: "Types of breakfast",
      description:
        "In different hotels around the world, you can find various kinds of breakfast. It's worth checking the breakfast offer during the booking process.",
    },
    {
      title: "Check-in procedures",
      description:
        "All hotels or similar establishments usually require guests to reach at their mentioned check-in time and carry ID proof.",
    },
    {
      title: "Types of Boarding's",
      description:
        "There are several basic types of hotel boarding: Room Only, Half-Board, Full-Board, and Only Breakfast.",
    },
    {
      title: "Additional services",
      description:
        "Many hotels offer additional services such as wake-up calls, laundry, and transportation.",
    },
  ];

  return (
    <div className="query-container">
      <div className="query-hotels-heading">
        <h2 style={{ color: "#003b95" }}>
          Any Questions about Hotel or your Booking?
        </h2>
        <p>You will find the answers in our Travel Guide</p>
      </div>
      <div className="query-hotels-body" >
        <Slider {...MobileSlidersettings}>
          {queryData.map((item, index) => (
            <Card
              key={index}




            >

              <div style={{ padding: 20, width: 220, height: 200 }}>
                <h1 style={{ color: "#003b95", fontFamily: "jost", fontSize: 16, fontWeight: 700 }}>{item.title}</h1>
                <p style={{ color: "#666", fontFamily: "jost", fontSize: 14 }}>{item.description}</p>
              </div>
            </Card>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default QueryContainer;
