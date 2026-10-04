import React, { useState, useEffect } from "react";
import { Col, Row, Skeleton } from "antd";
import { Link } from "react-router-dom";
import Banner from "../../../components/banner/Banner";
import ApiClient from "../../Helpers/ApiClient";
import Hotels from "../../../components/Hotels/Hotels";
import SubscribeN from "../../../components/subscribe/SubscribeN";
// import { DiscountBan } from "../../../components/HomeBanners/DiscountBan";
import lower from "../../../assets/images/Icons/busofs.jpg";
import offer from "../../../assets/images/Icons/busre.jpg";
import quick from "../../../assets/images/Icons/247l1.jpg";

// import Animation from "../../../components/AnimationBall/AnimationBalls";

import queryString from "query-string";
import Subscribe from "../../../components/subscribe/Subscribe";
import moment from "moment";

import Combinebartest from "../../../components/CombineSearchbar/Combinebartest";
import { AppConstants } from "../../../helpers/constants";
import "../HotelSearch/HotelSearch.scss";
import OffersSlider from "../../../common/LandingPageOffers/LandingPageOffers";
import HomeCarousel from "../../../components/HomeCarousel/HomeCarousel";
import CombineServLink from "../../../common/CombineServicesLink/CombineServLink";
import Nav from "../../../common/navbar/Nav";
import TopDestination from "./TopDestination";
import PopularDestinations from "./PopularDestination";
import ImageGrid from "./ImageGrid";
import HotelCities from "../../../components/Hotels/HotelCities";
import TripPlanner from "../../../components/Hotels/HotelCities";
import QueryContainer from "./QueryContainer";
const ImBUrl = import.meta.env.VITE_Image_URL;
const HotelSearch = (props) => {
  const BASE = import.meta.env.VITE_BASE_URL;
  const hotelBanners = [];
  const [cityHotelData, setCityHotelData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [deal, setDeal] = useState([])
  const [recentSearchResults, setRecentSearchResults] = useState([]);

  const promoDataSource = [];

  const getCityHotelList = () => {
    ApiClient.get("admin/cityHotels")
      .then((res) => {

        if (res.status === 200) {
          let data = res.data.filter(
            (item) => item.Status === 0 && item.Servicetype === 2
          );
          let result = data.reduce(function (obj, key) {
            obj[`${key.CityName}, ${key.CountryName}`] =
              obj[`${key.CityName}, ${key.CountryName}`] || [];
            obj[`${key.CityName}, ${key.CountryName}`].push(key);
            return obj;
          }, {});

          setCityHotelData(result);
        }
      })
      .catch((e) => console.log("api error", e));
  };

  useEffect(() => {

    if (promoDataSource.length) {
      let data = promoDataSource.filter((item) => item.ServiceType === 2);
      setDataSource(data);
    }
  }, [promoDataSource]);



  const [docTitle, setDocTitle] = useState("Book Best Luxury Hotels Online");

  useEffect(() => {
    const handleBlur = () => {
      document.title = "Come Back, We Got Best Hotels";
    };

    const handleFocus = () => {
      document.title = docTitle + " - " + AppConstants.DOMAIN_NAME;
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [docTitle]);



  const getHotelUrl = (url) => {
    if (url) {
      let params = queryString.parse(url);
      params.checkInDate = moment().add(1, "days").format("YYYY-MM-DD");
      params.checkOutDate = moment().add(2, "days").format("YYYY-MM-DD");
      params = queryString.stringify(params);
      return `/hotels/listing?${params}`;
    } else {
      return "";
    }
  };


  return (
    <>
      <Nav />
      <div className="hotels_search_container">
        <Helmet>
          <title>
            {docTitle} - {AppConstants.DOMAIN_NAME}

          </title>
          <meta
            name="description"
            content="Best hotel deals are available at eTravos. Book budget hotels, luxury hotels or resorts at cost effective rates."
          />
        </Helmet>
        <section className="hotel_banner">
          <div className="head" >
            {/* <Banner banner={hotelBanners} size={"400px"} /> */}


          </div>

          <div className="heading_text ">
            <h2>

            </h2>
          </div>
          <div className="hero-banner">

            <Combinebartest activetab={2} />
          </div>
        </section>

        <div className="content-wrapper">
          <div className="content-cards">
            <div className="site-card-wrapper">

              <Row className="book-travels-with">
                <Col style={{ display: "flex", alignItems: "center", justifyContent: "center" }} lg={24} xs={24}>
                  <h3 style={{ marginTop: "0%" }} className="reason-book">
                    New Experience in Hotel Booking
                  </h3>
                </Col>
                <Col lg={8} xs={24}>
                  <div className="travel-flex">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={lower}
                        alt="book-img"
                        width={"200px"}
                      />
                    </div>
                    <div className="info-text-book">
                      <h3>Lower Booking Prices</h3>
                      <p>
                        Book a bus ticket with us and get amazing offers and the lowest prices than other agents in the market.
                      </p>
                    </div>
                  </div>
                </Col>
                <Col lg={8} xs={24}>
                  <div className="travel-flex">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={offer}
                        alt="book-img"
                        width={"240px"}
                      />
                    </div>
                    <div className="info-text-book">
                      <h3>Heavy Discounts</h3>
                      <p>
                        We offer instant refunds on cancellation and, rebooking options with heavy discounts and many more interesting deals.
                      </p>
                    </div>
                  </div>
                </Col>
                <Col lg={8} xs={24}>
                  <div className="travel-flex">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={quick}
                        alt="book-img"
                        width={"200px"}
                      />
                    </div>
                    <div className="info-text-book">
                      <h3>Dedicated Account Manager</h3>
                      <p>
                        You will find a single point of contact that delicately resolves your queries and issues during the process of Hotel booking.
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

        </div>



        {/* <section className="home-best-24" >
          <div className="container" style={{ display: "flex", justifyContent: "center" }}>
            <img width="70%" classname="bann1" src={ImBUrl+"images/htImgs/bann3.png"} alt="" style={{ borderRadius: "6px" }} />

          </div>
        </section> */}


        {/* <section className="home-st" >
          <div className="mark-st-banner1">
            <h6>Top Cities For You</h6>
            <TopDestination />
            
          </div>
        </section> */}
        {/* <section className="cont-bann-sec">
          <div className="comm-ban">
            <div className="banner-wrapper">
              <div data-testid="wcu_bh_banner-desktop" className="banner-container">
                <a target="_blank" href="#" className="banner-link">
                  <div className="circle-containerM1">
                    <div className="heartbeat-circle1"></div>
                    <div className="blue-circle1"></div>
                  </div>
                  <div className="circle-containerM">
                    <div className="heartbeat-circle"></div>
                    <div className="blue-circle"></div>
                  </div>
                  <div className="text-and-button">
                    <div className="text-container">
                      <span className="main-text">Find </span>
                      <div className="scrolling-list-wrapper">
                        <ul className="scrolling-list">
                          <li className="list-item">apartments</li>
                          <li className="list-item">villas</li>
                          <li className="list-item">hostels</li>
                          <li className="list-item">holiday homes</li>
                          <li className="list-item">cottages</li>
                          <li className="list-item">homes</li>
                         
                        </ul>
                      </div>
                      <div className="main-text1"> for your next trip</div>
                    </div>
                    <button className="discover-button">Discover homes</button>
                  </div>
                  <div className="image-container1">
                    <img src={ImBUrl+"images/htImgs/ban-icon (2).png"} alt="Banner" className="banner-image-icon" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section> */}
        <section className="home-st">
          <div className="mark-st-banner">

            <PopularDestinations />

          </div>
        </section>






        {/* <section className="home-st not-wel" style={{width:1200, margin:"4% 9%"}}>
          <TripPlanner />
        </section> */}

        {/* <DiscountBan page={"h"} /> */}
        {/* <section className="home-st">
          <div className="mark-st-banner">
            <h6>Trending Destinations</h6>
            <p>Most Popular Destinations For Travellers From India</p>
            <ImageGrid />
         
          </div>
        </section> */}
        <section className="queries_about_hotels">
          {/* <Animation />
           */}
          <QueryContainer />
        </section>


        {/* <SubscribeN /> */}

      </div >
    </>
  );
};

export default HotelSearch;
