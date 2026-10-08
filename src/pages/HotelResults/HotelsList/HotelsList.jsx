import React, { useState } from "react";
import { Link } from "react-router";
import {
  EnvironmentOutlined,
  CheckOutlined,
  StarFilled,
  PictureOutlined,
  SafetyCertificateFilled,
  CoffeeOutlined,
  WifiOutlined,
  CarOutlined,
  CheckCircleFilled,
  RightOutlined,
  HeartOutlined,
  HeartFilled
} from "@ant-design/icons";
import {
  Button,
  Modal,
  Rate,
  Space,
  Skeleton,
  Carousel,
  Checkbox,
  Tag,
  Tooltip
} from "antd";
import queryString from "query-string";
import { useSelector } from "react-redux";
import { selectActiveCurrency } from "../../../store/slices/currencySlice";
import ImagesLightbox from "../../../components/ImagesLightbox/ImagesLightbox";
import "./HotelsList.scss";

const ImBaseUrl = import.meta.env.VITE_Image_URL;

const HotelsList = ({
  keyId,
  availableHotel,
  hotelTraceId,
  isFromPackage,
  isFromShortListed,
  activeTab,
  setActiveTab,
  isHotelSearchLoad,
  showNetFare,
  searchHotelReq,
  handelShortedHotelsList,
  handelCopmareHotel,
  Loader,
}) => {
  const hotelCardProps = availableHotel;

  const activeCurrency = useSelector(selectActiveCurrency) || "INR";
  const currencySymbol = activeCurrency === "INR" ? "₹" : activeCurrency;

  const currencyValue = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const [isAmenitiesModal, setIsAmenitiesModal] = useState(false);
  const [isImagesModal, setIsImagesModal] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);

  const hotelImages = availableHotel?.images?.length > 0
    ? availableHotel.images
    : [ImBaseUrl + "images/htImgs/no-htl.jpg"];

  const addressText = hotelCardProps?.addresses?.length > 0
    ? [
      hotelCardProps.addresses[0]?.address,
      hotelCardProps.addresses[0]?.cityName || hotelCardProps?.city,
    ].filter(Boolean).join(", ")
    : hotelCardProps?.city || hotelCardProps?.cityName || "City Center";

  const starRatingNum = Number(hotelCardProps?.starRating || 0);
  const rawPrice = Number(hotelCardProps?.hotelPublishPrice || hotelCardProps?.hotelMinPrice || 0);
  const publishPrice = rawPrice > 0 ? rawPrice : 0;
  const originalFakePrice = publishPrice > 0 ? publishPrice * 1.15 : 0;

  const goToHotelDetails = (hotelObj) => {
    const urlParams = queryString.parse(window.location.search);
    let queryObj = {
      hotelId: hotelObj.hotelCode || hotelObj.hotelId || "",
      traceId: hotelObj.traceId || "",
      supplier: hotelObj.supplier || "",
      hotelName: hotelObj.hotelName || hotelObj.name || "",
      starRating: hotelObj.starRating || hotelObj.rating || "",
      address:
        hotelObj.hotelAddress ||
        hotelObj.address ||
        hotelObj.addresses?.address ||
        "",
      checkInDate:
        searchHotelReq?.checkInDate ||
        urlParams?.checkInDate ||
        urlParams?.checkIn ||
        "",
      checkOutDate:
        searchHotelReq?.checkOutDate ||
        urlParams?.checkOutDate ||
        urlParams?.checkOut ||
        "",
      hotelCityCode:
        searchHotelReq?.hotelCityCode ||
        searchHotelReq?.cityId ||
        urlParams?.hotelCityCode ||
        urlParams?.cityId ||
        "",
      roomGuests:
        typeof searchHotelReq?.roomGuests === "object"
          ? JSON.stringify(searchHotelReq.roomGuests)
          : (searchHotelReq?.roomGuests || (typeof urlParams?.roomGuests === "object" ? JSON.stringify(urlParams.roomGuests) : urlParams?.roomGuests) || ""),
      nationality:
        searchHotelReq?.nationality || urlParams?.nationality || "IN",
      supplierParamter: hotelObj?.supplierParamter || "",
    };
    const query = queryString.stringify(queryObj);
    return "/hotels/detail?" + query;
  };

  // Curated facilities (show up to 3 concise items)
  const facilities = hotelCardProps?.hotelFacility || [];
  const topFacilities = facilities.slice(0, 3);

  return (
    <div key={keyId} className="modern-hotel-card-item">
      <div className="hotel-card-container">
        {/* 1. Left Gallery Column */}
        <div className="hotel-media-col">
          <Link className="media-link-wrapper">
            <Carousel autoplay autoplaySpeed={4000} dots={{ className: "carousel-custom-dots" }} effect="fade">
              {hotelImages.slice(0, 4).map((img, i) => (
                <div key={i} className="carousel-slide-item">
                  <img
                    src={img}
                    alt={hotelCardProps?.hotelName || "Hotel Image"}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = ImBaseUrl + "images/htImgs/no-htl.jpg";
                    }}
                  />
                </div>
              ))}
            </Carousel>
          </Link>

          {/* Top Badges */}
          <div className="media-overlay-top">
            {starRatingNum >= 4 ? (
              <span className="premium-tag">
                <SafetyCertificateFilled /> Luxury Stay
              </span>
            ) : (
              null
              // <span className="featured-tag">Verified Hotel</span>
            )}

            <button
              type="button"
              className={`wishlist-btn ${isShortlisted ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsShortlisted(!isShortlisted);
                if (handelShortedHotelsList) {
                  handelShortedHotelsList(hotelCardProps);
                }
              }}
              title="Save Hotel"
            >
              {isShortlisted ? <HeartFilled /> : <HeartOutlined />}
            </button>
          </div>

          {/* Bottom Photo Count */}
          <div className="media-overlay-bottom">
            <button
              type="button"
              className="photo-count-pill"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsImagesModal(true);
              }}
              title="Click to view all photos"
            >
              <PictureOutlined /> {hotelImages.length} Photos
            </button>
          </div>
        </div>

        {/* 2. Middle Content Column */}
        <div className="hotel-info-col">
          <div className="info-header-block">
            <div className="title-and-stars">
              <Link to={goToHotelDetails(hotelCardProps)} className="hotel-title-link">
                <h3 className="hotel-card-title">{hotelCardProps?.hotelName || "Premium Hotel & Suites"}</h3>
              </Link>

              {starRatingNum > 0 && (
                <div className="hotel-star-badge">
                  {[...Array(Math.min(5, Math.floor(starRatingNum)))].map((_, i) => (
                    <StarFilled key={i} className="star-icon" />
                  ))}
                  <span className="star-rating-text">{starRatingNum} Star</span>
                </div>
              )}
            </div>

            <p className="hotel-address-line">
              <EnvironmentOutlined className="loc-pin" />
              <span className="address-text">{addressText}</span>
            </p>
          </div>

          {/* Key Amenities Chips */}
          <div className="hotel-amenities-strip">
            {topFacilities.map((fac, idx) => (
              <span key={idx} className="amenity-chip" title={fac}>
                <CheckCircleFilled className="check-icon" /> {fac}
              </span>
            ))}

            {facilities.length > 3 && (
              <button
                type="button"
                className="more-amenities-link"
                onClick={() => setIsAmenitiesModal(true)}
              >
                +{facilities.length - 3} more
              </button>
            )}
          </div>

          {/* Perks & Cancellation Highlights */}
          <div className="hotel-perks-row">
            <span className="perk-highlight green">
              <CheckOutlined /> Free Cancellation Available
            </span>
            <span className="perk-highlight blue">
              <CheckOutlined /> Instant Confirmation
            </span>
          </div>
        </div>

        {/* 3. Right Price & Action Column */}
        <div className="hotel-pricing-col">
          {/* TripAdvisor or Rating Badge */}
          {hotelCardProps?.tripAdvisorRating ? (
            <div className="review-score-box">
              <div className="score-text">
                <strong>{Number(hotelCardProps.tripAdvisorRating) >= 4 ? "Excellent" : "Very Good"}</strong>
                <span>TripAdvisor Rating</span>
              </div>
              <div className="score-badge">
                {Number(hotelCardProps.tripAdvisorRating).toFixed(1)}
              </div>
            </div>
          ) : (
            <div className="review-score-box">
              <div className="score-text">
                <strong>Top Rated</strong>
                <span>Guest Choice</span>
              </div>
              <div className="score-badge">4.5</div>
            </div>
          )}

          {/* Price Block */}
          <div className="price-container">
            {showNetFare ? (
              <div className="agent-fare-block">
                <span className="original-strikethrough">{currencySymbol} {currencyValue(publishPrice)}</span>
                <div className="main-price-val">
                  <span className="symbol">{currencySymbol}</span>
                  <span className="amount">
                    {currencyValue(
                      (hotelCardProps?.hotelNetPrice || publishPrice) -
                      (hotelCardProps?.commission || 0) -
                      (hotelCardProps?.agentMarkup || 0)
                    )}
                  </span>
                </div>
                <div className="agent-meta-tag">
                  COM: {currencyValue(hotelCardProps?.commission || 0)} | MU: {currencyValue(hotelCardProps?.agentMarkup || 0)}
                </div>
              </div>
            ) : (
              <div className="standard-price-block">
                <span className="price-starts-from">Price starts at</span>
                {/* {originalFakePrice > publishPrice && (
                  <span className="original-strikethrough">
                    {currencySymbol} {currencyValue(originalFakePrice)}
                  </span>
                )} */}
                <div className="main-price-val">
                  <span className="symbol">{currencySymbol}</span>
                  <span className="amount">{currencyValue(publishPrice)}</span>
                  <span className="night-lbl">/ night</span>
                </div>
                <span className="taxes-note">+ taxes & charges exclusive</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="action-button-wrapper">
            <Link to={goToHotelDetails(hotelCardProps)} className="cta-link">
              <Button type="primary" size="large" className="choose-room-cta-btn">
                <span>View Rooms</span>
                <RightOutlined className="arrow-icon" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* All Amenities Modal */}
      <Modal
        wrapClassName="modalHeader amenitiesModal"
        title="All Hotel Amenities & Facilities"
        open={isAmenitiesModal}
        onOk={() => setIsAmenitiesModal(false)}
        width={780}
        centered
        onCancel={() => setIsAmenitiesModal(false)}
        footer={null}
        styles={{ body: { maxHeight: "65vh", overflowY: "auto", padding: "16px 24px" } }}
      >
        <div className="amenities-modal-grid">
          {facilities.map((amenity, i) => (
            <div key={i} className="amenity-grid-cell">
              <CheckCircleFilled className="cell-check" />
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Hotel Images Gallery Modal */}
      <Modal
        wrapClassName="modalHeader hotelGalleryModal"
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: "16px", color: "#00164d" }}>
              {hotelCardProps?.hotelName || "Hotel Gallery"}
            </span>
            {starRatingNum > 0 && (
              <span style={{ display: "inline-flex", gap: "2px", color: "#f59e0b", fontSize: "13px" }}>
                {[...Array(Math.min(5, Math.floor(starRatingNum)))].map((_, i) => (
                  <StarFilled key={i} />
                ))}
              </span>
            )}
          </div>
        }
        open={isImagesModal}
        onCancel={() => setIsImagesModal(false)}
        footer={null}
        width={860}
        centered
        destroyOnClose
        styles={{ body: { padding: "12px 16px 20px" } }}
      >
        <ImagesLightbox hotelImages={hotelImages} />
      </Modal>
    </div>
  );
};

export default HotelsList;
