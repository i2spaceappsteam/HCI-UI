import React, { useState, useMemo } from "react";
import { Row, Col, Tag, Badge, Tooltip } from "antd";
import moment from "moment";
import queryString from "query-string";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  StarFilled,
  CalendarOutlined,
  UserOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  CoffeeOutlined,
  InfoCircleOutlined,
  CheckOutlined
} from "@ant-design/icons";
import "./HotelDetailsBox.scss";

const ImBaseUrl = import.meta.env.VITE_Image_URL;

const HotelDetailsBox = ({ Ids, hotelDetailsObj, hotelSearchData = {} }) => {
  const history = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const selectedHotelInfo = useSelector((state) => state.hotel.selectedHotelInfo);

  // Collect all available images from Redux store & props (hotel photos + room photos)
  const allImages = useMemo(() => {
    const list = [];
    const addImg = (src) => {
      if (typeof src === "string" && src.trim() && !list.includes(src.trim())) {
        list.push(src.trim());
      } else if (src && typeof src === "object" && src.url && !list.includes(src.url)) {
        list.push(src.url);
      }
    };

    if (Array.isArray(hotelDetailsObj?.images)) {
      hotelDetailsObj.images.forEach(addImg);
    }
    if (Array.isArray(hotelDetailsObj?.imageList)) {
      hotelDetailsObj.imageList.forEach(addImg);
    }
    if (Array.isArray(hotelDetailsObj?.roomImages)) {
      hotelDetailsObj.roomImages.forEach(addImg);
    }
    if (Array.isArray(selectedHotelInfo?.images)) {
      selectedHotelInfo.images.forEach(addImg);
    }
    if (Array.isArray(selectedHotelInfo?.roomImages)) {
      selectedHotelInfo.roomImages.forEach(addImg);
    }
    return list;
  }, [hotelDetailsObj, selectedHotelInfo]);

  const defaultImg = ImBaseUrl ? `${ImBaseUrl}images/htImgs/no_img.png` : "/images/hotels/no_photo.png";
  const activeImg = selectedImage || (allImages.length > 0 ? allImages[0] : defaultImg);

  const noOfNights = () => {
    if (hotelSearchData?.checkInDate && hotelSearchData?.checkOutDate) {
      const checkin = moment(hotelSearchData.checkInDate);
      const checkout = moment(hotelSearchData.checkOutDate);
      const diff = checkout.diff(checkin, "days");
      return Math.max(1, diff);
    }
    return 1;
  };

  const gotoHotelDetail = (hotelCode) => {
    if (window.history.length > 1) {
      history(-1);
    } else {
      const queryObj = {
        hotelId: hotelCode || hotelDetailsObj?.hotelCode,
        traceId: Ids?.traceId || hotelDetailsObj?.traceId,
        supplier: hotelSearchData?.supplier,
      };
      const query = queryString.stringify(queryObj);
      history(`/hotels/detail?${query}`);
    }
  };

  // Guest count summary
  const guestSummary = () => {
    let adults = 0;
    let childs = 0;
    let rooms = 0;

    if (hotelSearchData?.roomGuests && Array.isArray(hotelSearchData.roomGuests)) {
      rooms = hotelSearchData.roomGuests.length;
      hotelSearchData.roomGuests.forEach((rg) => {
        adults += Number(rg.noOfAdults || 0);
        childs += Number(rg.noOfChilds || 0);
      });
    } else {
      rooms = 1;
      adults = 2;
    }

    return {
      rooms: rooms || 1,
      adults: adults || 1,
      childs: childs || 0,
      totalGuests: (adults || 1) + (childs || 0),
    };
  };

  const guests = guestSummary();
  const nights = noOfNights();

  // Room details
  const roomData = hotelDetailsObj?.combineRoom?.[0]?.combineRooms?.[0] || hotelDetailsObj?.combineRoom?.[0] || {};
  const roomName = roomData?.ratePlanName || roomData?.roomName || "Standard Selected Room";
  const mealPlan = roomData?.mealPlan || roomData?.boardName || "";

  // Inclusions
  const inclusions = hotelDetailsObj?.combineRoom?.[0]?.inclusions || roomData?.inclusions || [];

  // Cancellation policies from all possible API locations
  const cancellationPolicies = useMemo(() => {
    const list =
      hotelDetailsObj?.combineRoom?.[0]?.combineRooms?.[0]?.cancellationPolicy ||
      hotelDetailsObj?.combineRoom?.[0]?.cancellationPolicy ||
      hotelDetailsObj?.rooms?.[0]?.ratePlans?.[0]?.cancellationPolicy ||
      hotelDetailsObj?.rooms?.[0]?.cancellationPolicy ||
      hotelDetailsObj?.cancellationPolicy ||
      roomData?.cancellationPolicy ||
      [];
    return Array.isArray(list) ? list : (list ? [list] : []);
  }, [hotelDetailsObj, roomData]);

  const formatCancellationPenalty = (rule) => {
    if (!rule) return "0";
    const penalty = rule.penaltyAmount ?? rule.amount ?? rule.penalty ?? 0;
    const penaltyStr = String(penalty).trim();
    const penaltyNum = Number(penaltyStr.replace(/[^0-9.-]/g, ""));
    const chargeType = String(rule.chargeType || "").trim().toLowerCase();

    if (penaltyNum === 0 || penaltyStr === "0") {
      return "Free (₹0)";
    }

    if (
      chargeType.includes("percent") ||
      chargeType.includes("pct") ||
      chargeType === "%" ||
      rule.chargeType === 1 ||
      rule.chargeType === "1" ||
      penaltyStr.includes("%")
    ) {
      return `${penaltyStr.replace("%", "")}%`;
    }

    if (chargeType.includes("night") || rule.chargeType === 3 || rule.chargeType === "3") {
      return `${penaltyNum} Night${penaltyNum > 1 ? "s" : ""}`;
    }

    return `₹${penaltyNum.toLocaleString("en-IN")}`;
  };

  const renderCancellationText = (cancel) => {
    if (!cancel) return null;

    // Check if policies is a full descriptive string
    const rawPolicies = Array.isArray(cancel.policies)
      ? cancel.policies.join(" ")
      : typeof cancel.policies === "string"
      ? cancel.policies
      : "";

    const isGenericWord =
      !rawPolicies ||
      ["fixed", "percentage", "percent", "amount", "night", "nights"].includes(rawPolicies.trim().toLowerCase());

    if (!isGenericWord && rawPolicies.length > 15) {
      return rawPolicies;
    }

    const parseDateStr = (d) => {
      if (!d) return "";
      const m = moment(d, ["DD-MM-YYYY HH:mm:ss", "DD-MM-YYYY", "YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DD"]);
      return m.isValid() ? m.format("DD MMM, YYYY") : String(d).split(" ")[0];
    };

    const fromDateStr = parseDateStr(cancel.fromDate);
    const toDateStr = parseDateStr(cancel.toDate);
    const penalty = cancel.penaltyAmount ?? cancel.amount ?? cancel.penalty ?? 0;
    const penaltyNum = Number(String(penalty).replace(/[^0-9.-]/g, ""));
    const penaltyDisplay = formatCancellationPenalty(cancel);

    if (penaltyNum === 0 || String(penalty) === "0") {
      if (fromDateStr && toDateStr) {
        return (
          <span>
            From <strong>{fromDateStr}</strong> to <strong>{toDateStr}</strong>: <strong style={{ color: "#16a34a" }}>Free Cancellation (₹0 charge)</strong>
          </span>
        );
      }
      if (fromDateStr) {
        return (
          <span>
            Cancellation before <strong>{fromDateStr}</strong>: <strong style={{ color: "#16a34a" }}>Free Cancellation (₹0 charge)</strong>
          </span>
        );
      }
      return <strong style={{ color: "#16a34a" }}>Free Cancellation</strong>;
    }

    if (fromDateStr && toDateStr) {
      return (
        <span>
          Cancellation between <strong>{fromDateStr}</strong> and <strong>{toDateStr}</strong>:{" "}
          <strong style={{ color: "#dc2626" }}>{penaltyDisplay} cancellation fee</strong>
        </span>
      );
    }

    if (fromDateStr) {
      return (
        <span>
          Cancellation on or after <strong>{fromDateStr}</strong>:{" "}
          <strong style={{ color: "#dc2626" }}>{penaltyDisplay} cancellation fee</strong>
        </span>
      );
    }

    return <span>Cancellation fee: <strong style={{ color: "#dc2626" }}>{penaltyDisplay}</strong></span>;
  };

  const isRefundable =
    roomData?.refundable ??
    (cancellationPolicies.length > 0 &&
      cancellationPolicies.some(p => {
        const pNum = Number(p.penaltyAmount || 0);
        return pNum === 0 || String(p.penaltyAmount) === "0";
      }));

  return (
    <div className="modern-hotel-details-box">
      {/* Header Bar */}
      <div className="details-box-header">
        <div className="header-title-group">
          <div className="hotel-icon-badge">🏨</div>
          <div>
            <h3 className="box-title">Hotel & Reservation Summary</h3>
            <span className="box-subtitle">Review your selected stay details before confirming</span>
          </div>
        </div>

        {hotelDetailsObj?.hotelCode && Ids !== "hotel-review" && (
          <button
            type="button"
            className="change-room-pill-btn"
            onClick={() => gotoHotelDetail(hotelDetailsObj.hotelCode)}
          >
            <ArrowLeftOutlined />
            <span>Change Room</span>
          </button>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="hotel-summary-card-body">
        <div className="hotel-main-info-grid">
          {/* Left: Hotel Featured Photo & Thumbnails */}
          <div className="hotel-img-column">
            <div className="hotel-img-frame">
              <img
                src={activeImg}
                alt={hotelDetailsObj?.hotelName || "Hotel"}
                onError={(e) => {
                  e.target.src = defaultImg;
                }}
              />
              <div className="hotel-photo-badge">
                <SafetyCertificateOutlined /> Verified
              </div>
            </div>

            {/* Thumbnail Strip if multiple photos exist */}
            {allImages.length > 1 && (
              <div className="hotel-thumbnails-row">
                {allImages.slice(0, 4).map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumb-btn ${activeImg === thumb ? "active" : ""}`}
                    onClick={() => setSelectedImage(thumb)}
                    title={`Photo ${idx + 1}`}
                  >
                    <img
                      src={thumb}
                      alt={`Photo ${idx + 1}`}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Hotel Name, Stars & Room Details */}
          <div className="hotel-meta-details">
            <div className="meta-top-row">
              {Number(hotelDetailsObj?.starRating) > 0 && (
                <div className="star-rating-pill">
                  {[...Array(Math.min(5, Math.floor(Number(hotelDetailsObj.starRating))))].map((_, i) => (
                    <StarFilled key={i} className="star-icon" />
                  ))}
                  <span className="star-count">{hotelDetailsObj.starRating} Star Hotel</span>
                </div>
              )}
            </div>

            <h2 className="hotel-display-name">{hotelDetailsObj?.hotelName}</h2>
            {hotelDetailsObj?.hotelAddress && (
              <p className="hotel-location-row">
                <EnvironmentOutlined /> {hotelDetailsObj.hotelAddress}
              </p>
            )}

            {/* Selected Room Pill */}
            <div className="selected-room-banner">
              <span className="room-label">Selected Room:</span>
              <strong className="room-title-val">{roomName?.split(",")?.[0]}</strong>
              {mealPlan && (
                <span className="meal-plan-tag">
                  <CoffeeOutlined /> {mealPlan}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stay Dates Timeline & Guest Count */}
        <div className="stay-timeline-container">
          {/* Check-In */}
          <div className="timeline-date-card checkin">
            <span className="date-type-lbl">CHECK-IN</span>
            <div className="date-main-val">
              <span className="day-name">{moment(hotelSearchData.checkInDate).format("ddd")},</span>
              <span className="date-num">{moment(hotelSearchData.checkInDate).format("DD MMM YYYY")}</span>
            </div>
            <span className="check-time-lbl">From 2:00 PM</span>
          </div>

          {/* Duration Badge */}
          <div className="timeline-duration-badge">
            <div className="duration-pill">
              <span>🌙 {nights} {nights > 1 ? "Nights" : "Night"}</span>
            </div>
            <div className="duration-line"></div>
          </div>

          {/* Check-Out */}
          <div className="timeline-date-card checkout">
            <span className="date-type-lbl">CHECK-OUT</span>
            <div className="date-main-val">
              <span className="day-name">{moment(hotelSearchData.checkOutDate).format("ddd")},</span>
              <span className="date-num">{moment(hotelSearchData.checkOutDate).format("DD MMM YYYY")}</span>
            </div>
            <span className="check-time-lbl">Until 11:00 AM</span>
          </div>

          {/* Guests & Rooms */}
          <div className="timeline-guests-card">
            <span className="date-type-lbl">OCCUPANCY</span>
            <div className="guests-main-val">
              <UserOutlined className="guest-icon" />
              <span>{guests.rooms} Room{guests.rooms > 1 ? "s" : ""}, {guests.adults} Adult{guests.adults > 1 ? "s" : ""}{guests.childs > 0 ? `, ${guests.childs} Child` : ""}</span>
            </div>
            <span className="check-time-lbl">{guests.totalGuests} Total Guest{guests.totalGuests > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Inclusions Chips List */}
        {inclusions?.length > 0 && (
          <div className="inclusions-strip-section">
            <span className="strip-title">Included in Rate:</span>
            <div className="inclusions-pills-wrap">
              {inclusions.map((inc, idx) => (
                <span key={idx} className="inclusion-pill">
                  <CheckCircleFilled className="inc-chk-icon" />
                  <span>{inc}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cancellation Policy Alert Banner */}
        {cancellationPolicies?.length > 0 && (
          <div className={`cancellation-policy-banner ${isRefundable ? "refundable" : "non-refundable"}`}>
            <div className="policy-banner-header">
              <InfoCircleOutlined className="banner-icon" />
              <strong>Cancellation Policy</strong>
              {isRefundable ? (
                <Tag color="success" style={{ marginLeft: 8 }}>Refundable</Tag>
              ) : (
                <Tag color="error" style={{ marginLeft: 8 }}>Non-Refundable</Tag>
              )}
            </div>
            <div className="policy-text-list">
              {cancellationPolicies.map((cancel, index) => (
                <p key={index} className="policy-rule-desc">
                  {renderCancellationText(cancel)}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelDetailsBox;
