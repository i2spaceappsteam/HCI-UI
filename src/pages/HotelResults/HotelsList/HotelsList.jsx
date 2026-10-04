import React, { useState } from "react";
import { Link } from "react-router";

import {
  Button,
  Col,
  Modal,
  Row,
  Rate,
  Space,
  Skeleton,
  Carousel,
  Checkbox,
} from "antd";
import { StarOutlined, StarTwoTone } from "@ant-design/icons";
// import HotelRoomtable from "../../HotelDet/HotelRoomtable";
import ImagesLightbox from "../../../components/ImagesLightbox/ImagesLightbox";
import queryString from "query-string";
import { EnvironmentOutlined, CheckOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectActiveCurrency } from "../../../store/slices/currencySlice";

import "../HotelsList/HotelsList.scss";

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
  const currencyValue = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const facilitiesObj = [];
  const checkIfExist = (facilities, id) =>
    facilities.filter((obj) => obj.includes(id)).length === 0;

  const [imagesModal, setImagesModal] = useState({
    visible: false,
    data: null,
  });

  const [isAmenitiesModal, setIsAmenitiesModal] = useState(false);
  const [hotelImages, sethotelImages] = useState(availableHotel?.images?.length > 1 ? availableHotel?.images : []);
  const [attractionsModalVisible, setAttractionsModalVisible] = useState(false);


  const attractions = Array.isArray(hotelCardProps?.attractions)
    ? hotelCardProps.attractions
    : (hotelCardProps?.attractions?.["1) "]
      ? hotelCardProps.attractions["1) "].replace(/<p>/g, '').replace(/<\/p>/g, '').split("<br />").filter(Boolean)
      : []);


  const handleShowMoreAttractions = () => {
    setAttractionsModalVisible(true);
  };

  const handleModalClose = () => {
    setAttractionsModalVisible(false);
  };

  const showAmenitiesModal = () => {
    setIsAmenitiesModal(true);
  };

  const handleOk = () => {
    setIsAmenitiesModal(false);
  };

  const handleCancel = () => {
    setIsAmenitiesModal(false);
  };

  const goToHotelDetails = (hotelObj) => {
    const urlParams = queryString.parse(window.location.search);
    let queryObj = {
      hotelId: hotelObj.hotelCode || hotelObj.hotelId || "",
      traceId: hotelObj.traceId || "",
      supplier: hotelObj.supplier || "",
      hotelName: hotelObj.hotelName || hotelObj.name || "",
      starRating: hotelObj.starRating || hotelObj.rating || "",
      address: hotelObj.hotelAddress || hotelObj.address || hotelObj.addresses?.address || "",
      // Pass search params needed for HotelRooms request body
      checkInDate: searchHotelReq?.checkInDate || urlParams?.checkInDate || urlParams?.checkIn || "",
      checkOutDate: searchHotelReq?.checkOutDate || urlParams?.checkOutDate || urlParams?.checkOut || "",
      hotelCityCode: searchHotelReq?.hotelCityCode || searchHotelReq?.cityId || urlParams?.hotelCityCode || urlParams?.cityId || "",
      roomGuests: searchHotelReq?.roomGuests
        ? JSON.stringify(searchHotelReq.roomGuests)
        : (urlParams?.roomGuests || ""),
      nationality: searchHotelReq?.nationality || urlParams?.nationality || "IN",
      supplierParamter: hotelObj?.supplierParamter || "",
    };
    const query = queryString.stringify(queryObj);
    return "/hotels/detail?" + query;
  };



  const onHandleModal = (hotelObj) => {
    setImagesModal((prev) => ({ ...prev, data: hotelObj, visible: true }));
  };

  function handleImagesModalClose() {
    setImagesModal((prev) => ({ ...prev, data: null, visible: false }));
  }
  const onImageError = (ui) => {

  }
  const StarRating = ({ rating }) => {
    const numStars = parseFloat(rating);
    const starsArray = Array.from({ length: numStars }, (_, index) => index);

    return (
      <div className="str-top-ht" style={{ fontsize: "14px", marginRight: 50 }}>
        {starsArray?.map((_, index) => (
          <span
            key={index}
            role="img"
            aria-label="star"
            style={{
              textShadow: "3px 2px 6px grey",
              marginRight: "1px"
            }}
          >
            <StarTwoTone />

          </span>
        ))}
      </div>
    );
  };

  return (
    <div key={keyId} className="hotels_search_list">
      <div className="hotel-card">
        <div className="results-wrapper">
          <div className="grid-item hotel-image">
            <div className="carousel-wrapper" style={{ margin: 10 }}>
              {availableHotel?.images?.length >= 1 ? (
                <Carousel showStatus={false} showIndicators={false} dynamicHeight={false} autoplay autoplaySpeed={3000}>
                  {availableHotel?.images?.map((hotelImage, i) => (
                    <div key={i + "hotelimg"}>
                      <img src={hotelImage} alt="image" className="carousel-images" style={{ width: 370, height: 150, objectFit: "fill", borderRadius: 10 }} onError={(e) => { e.target.src = ImBaseUrl + "images/htImgs/no-htl.jpg"; }} />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <img src={ImBaseUrl + "images/htImgs/no-htl.jpg"} alt="No hotel available" className="carousel-images" style={{ height: 150 }} />
              )}
            </div>

          </div>
          <div className="grid-item hotel-title">
            <div className="hotel-title-wrapper">
              {isHotelSearchLoad ? (
                <span className="hotel-name">{hotelCardProps?.hotelName || "Hotel Name Not Available"}</span>
              ) : (
                <Link to={goToHotelDetails(hotelCardProps)}>
                  <span className="hotel-name">
                    {hotelCardProps?.hotelName || "Hotel Name Not Available"}
                  </span>
                </Link>
              )}
            </div>
            {Number(hotelCardProps.starRating) === 0 ? (
              <div className="hotel-star" >
                <span className="starRat">
                  <StarOutlined />
                  <StarOutlined />
                  <StarOutlined />
                  <StarOutlined />
                  <StarOutlined />
                </span>
              </div>
            ) : (
              <div className="hotel-star" >

                <StarRating rating={hotelCardProps.starRating} />
              </div>
            )}
            <div className="hotel-address">
              <EnvironmentOutlined />
              <span className="hotel-address-title">
                {hotelCardProps?.addresses?.length > 0
                  ? [
                    hotelCardProps.addresses[0]?.address,
                    hotelCardProps.addresses[0]?.cityName || hotelCardProps?.city
                  ].filter(Boolean).join(", ")
                  : (hotelCardProps?.city || hotelCardProps?.cityName || "")}
              </span>
            </div>



            {hotelCardProps?.tripAdvisorRating && (
              <div className="tripadvisor-rating">
                <div className="rating-wrapper">
                  <div className="rating-number">
                    <span>{hotelCardProps?.tripAdvisorRating}</span>
                    <span className="sec">/5</span>
                  </div>
                  <div className="traveller-count">
                    <p>TripAdvisor travellers rating</p>
                    <div className="rating-count-value">
                      <span className="tripAd">
                        <i className="fa fa-tripadvisor" aria-hidden="true"></i>
                      </span>
                      <Rate
                        className="tripRating"
                        disabled
                        character={
                          <i className="fa fa-circle" aria-hidden="true"></i>
                        }
                        value={Number(hotelCardProps?.tripAdvisorRating)}
                        allowHalf={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {hotelCardProps.hotelFacility ? (
            <div className="hotel-facilities">
              <div className="amenity-list">
                {hotelCardProps.hotelFacility.map((amenity, i) => {
                  if (amenity.toLowerCase().indexOf("Free Wifi") > -1) {
                    return (
                      <p key={"fac" + i}>
                        <i className="fa fa-wifi" aria-hidden="true"></i>
                        {amenity}
                      </p>
                    );
                  }
                  if (amenity.toLowerCase().indexOf("swimming pool") > -1) {
                    return (
                      <p key={"fac" + i}>
                        <img src={ImBaseUrl + "images/htImgs/amenities/pool.svg"} alt="pool" /> {amenity}
                      </p>
                    );
                  }
                  if (amenity.toLowerCase().indexOf("gym") > -1) {
                    return (
                      <p key={"fac" + i}>
                        <img src={ImBaseUrl + "images/htImgs/amenities/gym.svg"} alt="gym" /> {amenity}
                      </p>
                    );
                  }
                  if (amenity.toLowerCase().indexOf("restaurant") > -1) {
                    return (
                      <p key={"fac" + i}>
                        <img src={ImBaseUrl + "images/htImgs/amenities/restaurant.svg"} alt="restaurant" />
                        {amenity}
                      </p>
                    );
                  }
                  if (amenity.toLowerCase().indexOf("bar ") > -1) {
                    return (
                      <p key={"fac" + i}>
                        <i className="fa fa-beer" aria-hidden="true"></i>
                        {amenity}
                      </p>
                    );
                  }
                  if (amenity.toLowerCase() === "parking") {
                    return (
                      <p key={"fac" + i}>
                        <img src={ImBaseUrl + "images/htImgs/amenities/parking.svg"} alt="parking" />
                        {amenity}
                      </p>
                    );
                  }
                  if (amenity.toLowerCase().indexOf("kids play") > -1) {
                    return (
                      <p key={"fac" + i}>
                        <i className="fa fa-child" aria-hidden="true"></i>
                        {amenity}
                      </p>
                    );
                  }
                  if (amenity.toLowerCase().indexOf("cafe") > -1) {
                    return (
                      <p key={"fac" + i}>
                        <i className="fa fa-coffee" aria-hidden="true"></i>{" "}
                        {amenity}
                      </p>
                    );
                  }
                })}
              </div>

              {hotelCardProps.hotelFacility.length > 5 ? (
                <>
                  <Button className="showmore-am" onClick={showAmenitiesModal}>
                    Show More
                  </Button>
                  <Modal
                    wrapClassName="modalHeader amenitiesModal"
                    title="All Amenities"
                    open={isAmenitiesModal}
                    onOk={handleOk}
                    width={800}
                    onCancel={handleCancel}
                    footer={null}
                  >
                    <Row gutter={[8, 8]}>
                      {hotelCardProps.hotelFacility.map((amenity, i) => (
                        <Col key={"ameni" + i} md={8} sm={12} xs={12}>
                          <CheckOutlined style={{ marginRight: "5px" }} />{" "}
                          {amenity}
                        </Col>
                      ))}
                    </Row>
                  </Modal>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="grid-item hotel-price-box">
            <div className="hotel-price-box-wrapper">
              {isHotelSearchLoad ? (
                <Space>
                  <Skeleton.Button
                    active={true}
                    size="default"
                    shape="default"
                    block={false}
                  />
                </Space>
              ) : (
                <>
                  <div className="hotel-price">
                    {showNetFare ? (
                      <>
                        <span className="text-line">
                          {activeCurrency}{" "}
                          <span>
                            {currencyValue(hotelCardProps?.hotelPublishPrice || hotelCardProps?.hotelMinPrice)}
                          </span>
                        </span>

                        <p className="netfare">
                          COM: {" "}
                          {currencyValue(hotelCardProps?.commission || 0)}{" "} MU : {" "}
                          {currencyValue(hotelCardProps?.agentMarkup || 0)}
                        </p>

                        <p className="netfare">
                          {activeCurrency}{" "}
                          {currencyValue((hotelCardProps?.hotelNetPrice || hotelCardProps?.hotelMinPrice) - (hotelCardProps?.commission || 0) - (hotelCardProps?.agentMarkup || 0))}{" "}
                        </p>
                      </>
                    ) : (
                      <span style={{ fontSize: "14px" }}>
                        {activeCurrency === "INR" ? "₹" : activeCurrency}{" "}
                        <span style={{ fontSize: "24px" }}>
                          {currencyValue(Number(hotelCardProps?.hotelPublishPrice || hotelCardProps?.hotelMinPrice || 0).toFixed(2))}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="pax-info">

                  </div>
                  {!isFromPackage && isFromShortListed && (
                    <div className="hotel-choose-btn1">
                      <Checkbox
                        block
                        className="select-btn activity-choose-btn"
                        onChange={(e) => {
                          handelCopmareHotel(hotelCardProps, e);
                        }}
                      >
                        Compare
                      </Checkbox>
                      <Button
                        style={{ marginLeft: "21%" }}
                        className="remove-button-main-box"

                        onClick={() => {
                          handelShortedHotelsList(hotelCardProps);
                        }}
                      >
                        <i class="fa fa-trash-o"> Remove </i>
                      </Button>
                    </div>
                  )}
                  {isFromPackage ? (
                    <div className="hotel-choose-btn">
                      {activeTab !==
                        `hotel_${hotelCardProps?.hotelCode}_${keyId}` ? (
                        <Button
                          block
                          className="select-btn activity-choose-btn"
                          onClick={() => {
                            setActiveTab(
                              `hotel_${hotelCardProps?.hotelCode}_${keyId}`
                            );
                          }}
                        >
                          Select
                        </Button>
                      ) : (
                        <Button
                          block
                          className="dark-choose-btn activity-choose-btn"
                          onClick={() => {
                            setActiveTab(null);
                          }}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  ) : (
                    !isFromShortListed && (
                      <div className="hotel-choose-btn">
                        <Link to={goToHotelDetails(hotelCardProps)}>
                          {Loader ? <Skeleton.Button className="web-choose-btnL" active={true} /> :
                            <Button block className="web-choose-btn">
                              Choose
                            </Button>
                          }
                        </Link>
                        <Link to={goToHotelDetails(hotelCardProps)}>
                          {Loader ? <Skeleton.Button className="mobile-choose-btnL" active={true} /> :
                            <Button className="mobile-choose-btn">
                              <i
                                className="fa fa-chevron-right"
                                aria-hidden="true"
                              ></i>
                            </Button>
                          }
                        </Link>

                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {/* {isFromPackage &&
          activeTab === `hotel_${hotelCardProps?.hotelCode}_${keyId}` ? (
          <div className="hotel-list">
            {Object.keys(hotelCardProps?.hotelCode).length === 0 ? (
              "Loading...."
            ) : activeTab ? (
              activeTab === `hotel_${hotelCardProps?.hotelCode}_${keyId}` ? (
                <HotelRoomtable
                  hotelCardProps={hotelCardProps}
                  hotelTraceId={hotelTraceId}
                  isfrompackage={true}
                />
              ) : null
            ) : null}
          </div>
        ) : null} */}
      </div>
      <Modal
        title="All Attractions"
        open={attractionsModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <div>
          {attractions.map((attraction, index) => (
            <p key={index}>{attraction}</p>
          ))}
        </div>
      </Modal>
      <Modal
        wrapClassName="modalHeader hotelImgModal"
        open={imagesModal?.visible}
        centered
        width={500}
        title={
          imagesModal.visible ? (
            <div className="headerwrapper">
              <span>{imagesModal?.data.hotelName} </span>{" "}
              {imagesModal.data.starRating != null && (
                <sup>
                  {Number(imagesModal?.data?.starRating) === 0 ? (

                    <span className="starRat">
                      <StarOutlined />
                      <StarOutlined />
                      <StarOutlined />
                      <StarOutlined />
                      <StarOutlined />
                    </span>

                  ) : (
                    <Rate
                      className="starRating"
                      disabled
                      value={Number(imagesModal.data.starRating)}
                      allowHalf={true}
                    />
                  )}
                </sup>
              )}
            </div>
          ) : null
        }
        onOk={handleImagesModalClose}
        onCancel={handleImagesModalClose}
        footer={null}
      >

        {imagesModal?.visible ? (

          <ImagesLightbox hotelImages={hotelImages} />
        ) : null}
      </Modal>
    </div>
  );
};

export default HotelsList;
