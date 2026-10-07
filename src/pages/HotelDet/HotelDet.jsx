//**** After Changing structure for room resp? ****//

import React, { useState, useRef, useEffect, useMemo } from "react";
import * as ReactBootstrap from "react-bootstrap";
import { Button, Card, Col, Skeleton, Rate, Row, message, Modal, Radio } from "antd";
import { useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";

import parse from 'html-react-parser';
import moment from "moment";
import { Tooltip } from 'antd';
import { useSelector, useDispatch } from "react-redux";
import { setSelectedHotelInfo } from "../../store/slices/hotelSlice";

import ImagesLightbox from "../../../components/ImagesLightbox/ImagesLightbox";
import ApiClient from "../../helpers/ApiClient";
// import noFilter from "../../../assets/images/filterno.jpg";
// import skyline from "../../../assets/images/skyline.png";
import queryString from "query-string";
import HotelCardImage from "./HotelCardImage";
import { EnvironmentOutlined } from "@ant-design/icons";
// import hotelNoImg from "../../../assets/images/hotels/no_img.png";
// import giftimg from "../../../assets/images/cp-gift-icon.png";

import "./HotelDet.scss";
import ScrollToTopButton from "../../../components/ScrollToTop";
// import Kingbed from "../../../assets/images/inclusionimages/Kindbed.png";
// import twinbeds from "../../../assets/images/inclusionimages/twin-beds.png";
// import sea from "../../../assets/images/inclusionimages/sea.png";
// import breakfast from "../../../assets/images/inclusionimages/breakfast.png";
// import wifi from "../../../assets/images/inclusionimages/wifi.png";
import { Checkbox } from "antd";

const { Group } = Checkbox;

const ImBUrl = import.meta.env.VITE_Image_URL;
const HotelDet = () => {
  let history = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
 
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [hotelDetailsRespObj, setHotelDetailsRespObj] = useState({});
  const [selectedMealPlan, setSelectedMealPlan] = useState([]);
  const [isRoomModal, setIsRoomModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomsDetails, setRoomsDetails] = useState({ roomList: [], type: "" });
  const [isShowModal, setIsShowModal] = useState(false);
  const [roomImagesModal, setRoomImagesModal] = useState({});
  const [selectedRooms, setSelectedRooms] = useState({});
  const [showcancellationModal, setShowCancellationModal] = useState(false);
  const [roomsData, setRoomsData] = useState(null);
  const [inclusiondata, setinclusiondata] = useState([]);
  const [cancellationInfo, setCancellationInfo] = useState([]);
  const [isinclusionvisible, setisinclusionvisible] = useState(false);
  const [defaultProps, setDefaultProps] = useState({
    center: {
      address: "",
      lat: 17.42159,
      lng: 78.33752,
    },
    zoom: 12,
    mapVisible: true,
  });

  useEffect(() => {
    fetchHotelDetails();
  }, []);

  const fetchHotelDetails = () => {
    const hotelDetSearchParams = queryString.parse(window.location.search);
    fetchHotelRooms({
      traceId: hotelDetSearchParams.traceId,
      hotelCode: hotelDetSearchParams.hotelId,
      supplier: hotelDetSearchParams.supplier,
      userId: user?.UserID ?? 1,
      roleType: user?.Role?.RoleId ?? 4,
      membership: user?.Membership ?? 1,
    });
  };

  const fetchHotelRooms = (params) => {
    setLoading(true);
    setHotelDetailsRespObj({});
    ApiClient.post("hotels-v2/hotelrooms", params)
      .then((res) => res)
      .then((res) => {
        if (res.status === 200) {
          if (res.data.errors.length < 1) {
            

            setHotelDetailsRespObj(res.data);
            if (res.data?.latitude && res.data?.longitude) {
              setDefaultProps((prev) => ({
                ...prev,

                center: {
                  address: res.data?.addresses[0]?.address,
                  lat: parseFloat(res.data.latitude),
                  lng: parseFloat(res.data.longitude),
                },
                mapVisible: true,
              }));
            }
           

           
            setRoomsDetails({
              roomList: res.data.combineRoom,
              type: res.data.fixedFormat,
            });
          } else {
            setRoomsDetails({
              roomList: [],
              type: "",
            });
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleSelectedRooms = (hotelRoom, key) => {
    let copyData = { ...selectedRooms };
    copyData[key] = hotelRoom;
    setSelectedRooms(copyData);
  };

  const handleCheckout = () => {
    let array = Object.keys(selectedRooms).map((key) => selectedRooms[key]);
    if (roomsDetails.roomList.length === array.length) {
      navigateToCheckout(array);
    } else {
      message.error("Please select Rooms", 3);
    }
  };

  const navigateToCheckout = (roomsArray) => {
    // Dispatch hotel info to Redux store
    if (hotelDetailsRespObj) {
      dispatch(setSelectedHotelInfo({
        ...hotelDetailsRespObj,
        hotelName: hotelDetailsRespObj?.hotelName || "",
        starRating: hotelDetailsRespObj?.starRating || 0,
        hotelAddress: hotelDetailsRespObj?.hotelAddress || hotelDetailsRespObj?.address || "",
        address: hotelDetailsRespObj?.hotelAddress || hotelDetailsRespObj?.address || "",
        images: hotelDetailsRespObj?.images || [],
        selectedRooms: roomsArray,
      }));
    }

    if (roomsArray.length > 0) {
      const hotelDetSearchParams = queryString.parse(window.location.search);

      let roomPlan = roomsArray?.map((data) => ({
        roomID: data.roomId,
        rateID: data.ratePlanId,
        
      }));
      
      let query = {
        traceId: hotelDetSearchParams.traceId,
      
        roomsId: roomsArray[0]?.roomsId,
        roomPlan: JSON.stringify(roomPlan),
        supplier: hotelDetSearchParams.supplier,
      };
    
      query = queryString.stringify(query);
      history(`/hotels/hotel-checkout?${query}`);
    }
    else if (roomsArray) {
      const hotelDetSearchParams = queryString.parse(window.location.search);


      let roomPlan = roomsArray.combineRooms.map((data) => ({
        roomID: data.roomId,
        rateID: data.ratePlanId,
      }));

      let query = {
        traceId: hotelDetSearchParams.traceId,

        roomsId: roomsArray.roomsId,
        roomPlan: JSON.stringify(roomPlan),

        supplier: hotelDetSearchParams.supplier,
      };


      query = queryString.stringify(query);
      history(`/hotels/hotel-checkout?${query}`);
    } else {
      message.error("Please select Rooms", 3);
    }
  };

  const backToList = () => {
    history("/hotels/listing");
  };

  let myRef1 = useRef(null);
  let myRef2 = useRef(null);
  let myRef3 = useRef(null);
  let myRef4 = useRef(null);
  let myRef5 = useRef(null);

  const scrollToRef = (ref) => {

    try {
      ref.current.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) { }
  };


  /* Triggering rooms images modal */
  const onHandleModal = (roomObj) => {
    setRoomImagesModal(roomObj);
    setIsShowModal(true);
  };

  const getRoomDec = (roomDesc, ratePlans) => {
    return (
      <div className="tooltipWrapper">
        <p>
          <b> {roomDesc} </b>
        </p>
        <p>Policies:</p>
        {ratePlans.cancellationPolicy[0]?.policies.map((pol, i) => (
          <div key={pol + i}> {parse(pol)}</div>
        ))}
      </div>
    );
  };
  const Marker = ({ text }) => (
    <div className="markerWrapper">
      <EnvironmentOutlined />
    </div>
  );
  const guestCount = (roomGuests) => {
    return roomGuests.reduce(
      (acc, cur) => acc + (cur.noOfChilds + cur.noOfAdults),
      0
    );
  };

  const breakfastOptions = [
    "Breakfast",
    "Full Breakfast",
    "Breakfast for 2",
    "Breakfast buffet",
    "Free breakfast",
    "Room with Breakfast",
    "BREAKFAST",
    "BBBreakfast",
    "BREAKFAST",
    "Breakfast included",
    "Bed and Breakfast",
    "BED AND BREAKFAST",
    "Bed and Breakfast: The price includes accommodation and breakfast",
    "Breakfast Tourism fee Service charge VAT Municipality fee is included in the rates",
  ];

  const breakfastDescriptions = [
    "Breakfast",
    "breakfast",
    "bed and breakfast",
    "Hot Buffet Breakfast",
    "BUFFET BREAKFAST",
    "Full Breakfast",
    "breakfast,complimentary wifi",
    "Bed & Breakfast",
    "BUFFET BREAKFAST",
    "BUFFET BREAKFAST",
    "Bed and Breakfast",
    "full breakfast,free self parking,free wifi",
    "Food/beverage credit, Breakfast buffet",
    "Bed and breakfast",
    "full breakfast",
    "Free Breakfast",
    "Free breakfast",
    "Breakfast buffet",
    "free breakfast,free valet",
    "BED AND BREAKFAST",
    "Hot Buffet Breakfast"
  ];



  const halfDescriptions = ['HalfBoard', 'Half Board', "HALF BOARD", "Half board", "half board", "Half-board", "Half Board (Dinner)"]
  const FullDescriptions = ['FullBoard', "Full Board", "Full board", "Full-board", "FULL BOARD", "full board",]
  const handleMealPlanSelection = (values) => {
    setSelectedMealPlan(values);
  };

  useEffect(() => {
    if (hotelDetailsRespObj.supplier === "TBO") {
    
      if (selectedMealPlan.includes("Breakfast") && selectedMealPlan.includes("Refundable")) {
        setFilteredRooms(
          roomsDetails?.roomList.filter(room =>
            room?.inclusions?.some((inclusion) => {
              const inclusionArray = inclusion.split(',').map(item => item.trim());
              const hasBreakfast = inclusionArray.some(value =>
                ["Breakfast", "Full Breakfast", "Breakfast for 2", "Breakfast buffet", "Free breakfast", "Room with Breakfast", "BREAKFAST", "BBBreakfast", "BREAKFAST", "Breakfast included", "Bed and Breakfast", "BED AND BREAKFAST", "Bed and Breakfast: The price includes accommodation and breakfast", "Breakfast Tourism fee Service charge VAT Municipality fee is included in the rates"].includes(value)
              );
              return hasBreakfast && room.refundable === true;
            })
          )
        );
      }
      else if (selectedMealPlan.includes("Half Board") && selectedMealPlan.includes("Refundable")) {
        setFilteredRooms(
          roomsDetails?.roomList.filter(room =>
            room?.inclusions?.some((inclusion) => {
              const inclusionArray = inclusion.split(',').map(item => item.trim());
              const hashalfboard = inclusionArray.some(value =>
                ['HalfBoard', 'Half Board', "HALF BOARD", "Half board", "half board", "Half-board", "Half Board (Dinner)"].includes(value)
              );
              return hashalfboard && room.refundable === true;
            })
          )
        );
      }
      else if (selectedMealPlan.includes("Full Board") && selectedMealPlan.includes("Refundable")) {
        setFilteredRooms(
          roomsDetails?.roomList.filter(room =>
            room?.inclusions?.some((inclusion) => {
              const inclusionArray = inclusion.split(',').map(item => item.trim());
              const hasfullboard = inclusionArray.some(value =>
                ['FullBoard', "Full Board", "Full board", "Full-board", "FULL BOARD", "full board",].includes(value)
              );
              return hasfullboard && room.refundable === true;
            })
          )
        );
      }
      else if (selectedMealPlan?.includes("Half Board")) {

        setFilteredRooms(
          roomsDetails?.roomList?.filter((room) =>
            room?.inclusions?.some((inclusion) => {
              const inclusionArray = inclusion.split(',').map(item => item.trim());
              return inclusionArray.some(value =>
                ['HalfBoard', 'Half Board', "HALF BOARD", "Half board", "half board", "Half-board", "Half Board (Dinner)"].includes(value)
              );
            })
          )
        )
      } else if (selectedMealPlan?.includes("Full Board")) {

        setFilteredRooms(
          roomsDetails?.roomList?.filter((room) =>
            room?.inclusions?.some((inclusion) => {
              const inclusionArray = inclusion.split(',').map(item => item.trim());
              return inclusionArray.some(value =>
                ['FullBoard', "Full Board", "Full board", "Full-board", "FULL BOARD", "full board",].includes(value)
              );
            })
          )
        )
      } else if (selectedMealPlan.includes("Breakfast")) {

        setFilteredRooms(
          roomsDetails?.roomList?.filter((room) =>
            room?.inclusions?.some((inclusion) => {
              const inclusionArray = inclusion.split(',').map(item => item.trim());
              return inclusionArray.some(value =>
                ["Breakfast", "Full Breakfast", "Breakfast for 2", "Breakfast buffet", "Free breakfast", "Room with Breakfast", "BREAKFAST", "BBBreakfast", "BREAKFAST", "Breakfast included", "Bed and Breakfast", "BED AND BREAKFAST", "Bed and Breakfast: The price includes accommodation and breakfast", "Breakfast Tourism fee Service charge VAT Municipality fee is included in the rates",].includes(value)
              );
            })
          )
        )
      } else if (selectedMealPlan?.includes("Refundable")) {
        setFilteredRooms(
          roomsDetails?.roomList.filter(room => room.refundable === true)
        );
      }
      else {
        setFilteredRooms(roomsDetails.roomList);
      }
    }

    else {
      if (selectedMealPlan.includes("Full Board") && selectedMealPlan.includes("Refundable")) {

        setFilteredRooms(
          roomsDetails?.roomList?.filter(room =>
            room?.boardBasis?.[0]?.description &&
            !room.boardBasis[0].description.includes("No breakfast service") &&
            FullDescriptions?.some(description =>
              room.boardBasis[0].description.includes(description)
            ) &&
            room.refundable === true

          )

        );

      }
      else if (selectedMealPlan.includes("Half Board") && selectedMealPlan.includes("Refundable")) {
        // Filter rooms for Half Board and Refundable
        setFilteredRooms(
          roomsDetails?.roomList?.filter(room =>
            room?.boardBasis?.[0]?.description &&
            !room.boardBasis[0].description.includes("No breakfast service") &&
            halfDescriptions?.some(description =>
              room.boardBasis[0].description.includes(description)
            ) &&
            room.refundable === true
          )
        );
      }
      else if (selectedMealPlan.includes("Half Board")) {
        // Filter rooms for Half Board
        setFilteredRooms(
          roomsDetails?.roomList?.filter(room =>
            room?.boardBasis?.[0]?.description &&
            !room.boardBasis[0].description.includes("No breakfast service") &&
            halfDescriptions?.some(description =>
              room.boardBasis[0].description.includes(description)
            )
          )
        );
      }
      else if (selectedMealPlan.includes("Full Board")) {
        // Filter rooms for Full Board
        setFilteredRooms(
          roomsDetails?.roomList?.filter(room =>
            room?.boardBasis?.[0]?.description &&
            !room.boardBasis[0].description.includes("No breakfast service") &&
            FullDescriptions?.some(description =>
              room.boardBasis[0].description.includes(description)
            )
          )
        );
      }
      else if (selectedMealPlan.includes("Breakfast") && selectedMealPlan.includes("Refundable")) {
        // Filter rooms for Breakfast and Refundable
        setFilteredRooms(
          roomsDetails?.roomList?.filter(room =>
            room?.boardBasis?.[0]?.description &&
            !room.boardBasis[0].description.includes("No breakfast service") &&
            breakfastDescriptions?.some(description =>
              room.boardBasis[0].description.includes(description)
            ) &&
            room.refundable === true
          )
        );
      }
      else if (selectedMealPlan.includes("Breakfast")) {
        // Filter rooms for Breakfast
        setFilteredRooms(
          roomsDetails?.roomList?.filter(room =>
            room?.boardBasis?.[0]?.description &&
            !room.boardBasis[0].description.includes("No breakfast service") &&
            breakfastDescriptions?.some(description =>
              room.boardBasis[0].description.includes(description)
            )
          )
        );
      }
      else if (selectedMealPlan.includes("Refundable")) {
        // Filter rooms for Refundable
        setFilteredRooms(
          roomsDetails?.roomList?.filter(room =>
            room?.refundable === true
          )
        );
      }
      else {
        // No specific meal plan or refundable selected
        setFilteredRooms(roomsDetails?.roomList);
      }
    }

  }, [selectedMealPlan, roomsDetails.roomList]);

  const handelCancellationPolicy = (roomInfo) => {
    setRoomsData(roomInfo);

   
    let cancellationdata = roomInfo?.cancellationPolicy ?? null;
   
    setCancellationInfo(cancellationdata); 
    setShowCancellationModal(true);
  };
  const handleinclusiondata = (val) => {
    setinclusiondata(val);
    setisinclusionvisible(true);
  };
  const RoomsInclusion = (i, idx) => {
    return (
      <>

        <p style={{ margin: '0px 0px 0px' }}>
          <span className="fa fa-check" style={{ color: 'green' }}></span> {i}
        </p>


      </>
    );
  };
  const handleCancel = () => {
    setShowCancellationModal(false);
  };
 
  return (
    <>
   
    <div className="hotel-details details-main-2">
      <section className="hotel-details-header">
        <div className="details-header-container">
          {loading ? (
            <div className="hotel-full-address">
              <div className="hotel-header-wrapper">
                <Row className="hotel-detail-header-row" align="middle">
                  <Col md={18} xs={24} className="hotel-details-header-right">
                    <Skeleton active={true} paragraph={{ rows: 1 }} />
                  </Col>
                  <Col md={6} xs={0} className="show-moreskeleton-btn">
                    <Skeleton.Button active={true} size={"large"} />
                  </Col>
                </Row>
              </div>
            </div>
          ) : (
            Object.keys(hotelDetailsRespObj).length > 0 && (
              <div className="hotel-full-address">
                <div className="hotel-header-wrapper">
                  <div className="hotel-name">
                    <div className="hotel-name-wrapper">
                      <h4>
                        {hotelDetailsRespObj?.hotelName}
                        {hotelDetailsRespObj?.starRating && (
                          <sup>
                            <Rate
                              className="starRating"
                              disabled
                              defaultValue={Number(
                                hotelDetailsRespObj.starRating
                              )}
                              allowHalf={true}
                            />
                          </sup>
                        )}
                      </h4>

                      <p>{hotelDetailsRespObj?.addresses[0]?.address}</p>

                     
                    </div>
                    <div className="show-rooms-btn">
                      <Button onClick={() => scrollToRef(myRef2)}>
                        Show rooms
                        <i
                          className="fa fa-chevron-down"
                          aria-hidden="true"
                        ></i>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          <div className="sticky-links">
            <ul>
              <li>
                <a onClick={() => scrollToRef(myRef1)}>gallery</a>
              </li>
              <li>
                <a onClick={() => scrollToRef(myRef2)}>rooms</a>
              </li>

              <li>
                <a onClick={() => scrollToRef(myRef3)}>
                  about hotel and facilities{" "}
                </a>
              </li>
              <li>
                <a onClick={() => scrollToRef(myRef4)}>
                  Check-in Instructions{" "}
                </a>
              </li>

              <li>
                <a onClick={() => scrollToRef(myRef5)}>Special Instructions </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
      {loading ? (
        <div className="cp-hotel-inf0-top">
          <Row gutter={[16, 16]}>
            <Col md={10} xs={24} className="hotel-details-carsl-img">
              <Skeleton.Image />
            </Col>
            <Col md={7} xs={24}>
              <Skeleton active />
              <Skeleton active />
            </Col>
            <Col md={7} xs={24}>
              <Skeleton active />
              <Skeleton active />
            </Col>
          </Row>
        </div>
      ) : (
        Object.keys(hotelDetailsRespObj).length > 0 && (
          <Row className="cp-hotel-inf0-top">
            <Col md={10} xs={24}>
              <section
                className="hotel-detail-images cp-slider-hotel"
                ref={myRef1}
              >
                <div className="light-box-wrapper">
                  <ReactBootstrap.Container>
                    <ReactBootstrap.Row>
                      <ReactBootstrap.Col md={12}>
                        {hotelDetailsRespObj?.images?.length > 0 ? (
                          <ImagesLightbox
                            hotelImages={hotelDetailsRespObj.images}
                          />
                        ) : (
                          <img src={ImBUrl+"images/hotels/no_img.png"} alt="no-photo" />
                        )}
                      </ReactBootstrap.Col>
                    </ReactBootstrap.Row>
                  </ReactBootstrap.Container>
                </div>
              </section>
            </Col>
            {Object.keys(hotelDetailsRespObj).length > 0 ? (
              <Col md={7} xs={24} className="check-out-cp-panel">
                <div className="cp-bdr-info">
                  <h4>{hotelDetailsRespObj.propertyName}</h4>

                  <div className="cp-details-check">
                    <p>Star Rating</p>
                    <div className="hotel-star">
                      <Rate
                        className="starRating"
                        disabled
                        value={Number(hotelDetailsRespObj.starRating)}
                        allowHalf={true}
                      />
                    </div>
                  </div>
                 
                   
                  <div className="cp-location-address">
                    <p>
                      <strong>Address: </strong>
                      <span>{hotelDetailsRespObj?.addresses[0]?.address}</span>
                    </p>
                    <p>
                      <span>{hotelDetailsRespObj?.city}</span>
                    </p>
                  </div>
                </div>

                <div className="cp-gift-img-text">
                  <div className="img-text-cp-level">
                    <img src={ImBUrl+"images/cp-gift-icon.png"} alt="no-photo" />
                    <p className="more-panel-cp">Save more</p>
                    <p className="login-bal-cp">
                      Search,Book Hotels & Apartments across global region
                    </p>
                  </div>

                  <div className="cp-app-regions">
                    <p className="rates-best-regions">
                      Get the best rates from all regions
                    </p>
                    <p className="promo-tariff-cp">
                      Promo discounts on normal room tariff{" "}
                      <a href="/offers" target="_blank">
                        Click here
                      </a>{" "}
                      to see more deals
                    </p>
                  </div>
                </div>
              </Col>
            ) : null}
            <Col md={7} xs={24} className="cp-rooms-guest">
              <div className="cp-bdr-info1">
                <div className="cp-location-date">
                  <p className="cp-best-book-fee-1">Searched Criteria</p>
                  <p>
                    <span>Check In : </span>
                    {moment(hotelDetailsRespObj?.request?.checkInDate).format(
                      "DD MMM, YYYY"
                    )}
                    
                  </p>
                  <p>
                    <span>Check Out : </span>
                    {moment(hotelDetailsRespObj?.request?.checkOutDate).format(
                      "DD MMM, YYYY"
                    )}
                  </p>
                
                  <p className="guest-bottom">
                    <span>Guest(s) : </span>
                    {guestCount(hotelDetailsRespObj?.request?.roomGuests)}
                  </p>

                  <div className="cp-other-rooms">
                    <p
                      className="book-other-cp"
                      onClick={() => scrollToRef(myRef2)}
                    >
                      View Rooms
                    </p>
                    <Button
                      className="cp-book-this"
                      onClick={() => scrollToRef(myRef2)}
                    >
                      <span>BOOK THIS NOW</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="cp-bdr-info  data-book-with-us">
                <div className="rooms-out-in-cp">
                  <p className="cp-best-book-fee">Why Book with us?</p>
                  <p className="fees-cp">Best Rates Guaranteed</p>
                  <p className="fees-cp">Get the best rates from all regions</p>
                  <p className="fees-cp">No booking fees.</p>
                </div>
              </div>
            </Col>
          </Row>
        )
      )}

      <section className="hotel-rooms-list" ref={myRef2}>
        <div className="rooms-wrapper">
          <div style={{ display: "flex" }}>
            <h5 className="rooms-available-sta" style={{ fontSize: 18 }}>Filter rooms by :  </h5>
            <Group onChange={(values) => handleMealPlanSelection(values)} >
              <Checkbox value="Breakfast" style={{ fontSize: 15, marginLeft: 13 }} >Breakfast</Checkbox>
              <Checkbox value="Half Board" style={{ fontSize: 15 }}>Half Board</Checkbox>
              <Checkbox value="Full Board" style={{ fontSize: 15 }}>Full Board</Checkbox>
              <Checkbox value="Refundable" style={{ fontSize: 15 }}>Refundable</Checkbox>
            </Group>
            
          </div>
          <div>
            <h5 className="rooms-available-sta">Available Rooms</h5>
          </div>

          <div className="rooms-list">
            {loading ? (
              <div className="hotel-details-block">
                <div className="hotel-details-room-card-container">
                  {/* ----Room Skeleton Card---- */}
                  {[...Array(2)].map((_, i) => (
                    <div key={"skeleton" + i} className="room-card">
                      <Row gutter={16}>
                        <Col md={4}>
                          <div className="room-image-skel">
                            <Skeleton.Image />
                          </div>
                        </Col>
                        <Col md={16}>
                          <Skeleton active />
                        </Col>
                        <Col md={4}>
                          <div className="choose-btn-s">
                            <Skeleton paragraph={{ rows: 0 }} />
                            <Skeleton.Button active={true} size={"large"} />
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}

                  {/* ----End Of Room Skeleton Card---- */}
                </div>
              </div>
            ) :
              

              filteredRooms?.length > 0 ? (
                filteredRooms?.map((roomsArray, index) => (
                  
                  <>
                   
                      <ScrollToTopButton />
                     
                  
                    {roomsArray.combineRooms?.length > 1 ?
                      <Card className="room-card-wrapper mb-2" key={index}>
                        <h5 className="rm-nam-tp" style={{ margin: "0" }}>   {roomsArray.combineRooms?.[0].roomName.split(",")[0]}</h5>
                        <div className="room-card">
                          <div className="hotel-room-details-main-card" >
                            <div className="hotel-room-details-main-content-card" >
                              {roomsArray?.combineRooms?.map((hotelRoom, key) => (
                                <>
                                 



                                  <div className="roomname-reff-part" >
                                    <h2 className="rm-name-t" style={{ fontSize: '16px', marginRight: '2%' }}>   {hotelRoom.roomName.split(",")[0]}</h2>
                                   
                                    {(hotelRoom && key != roomsArray?.combineRooms?.length - 1) ?
                                      <>

                                        {hotelRoom.refundable ?
                                          (<span style={{ color: "green", padding: '6px 8px', backgroundColor: '#c1ffdd', borderRadius: '7px', marginRight: '3%' }} className="roomlastcancel">Refundable</span>) :
                                          (<span style={{ color: "red", padding: '6px 8px', backgroundColor: '#fdd4cf', borderRadius: '7px', marginRight: '3%' }} className="roomlastcancel">Non-Refundable</span>)
                                        }</> : <span></span>
                                    }
                                  </div>


                                  <div className="hotel-room-details-main-inclusions-card" >
                                    <div className="hotel-room-details-main-inclusions-card1" >
                                      <div className="hotel-room-details-main-inclusions-card2" >


                                        {hotelRoom?.boardBasis &&
                                          <p className="board-b">Boarding : {hotelRoom?.boardBasis?.description}</p>}

                                        <div className="inc-r">
                                          {[...hotelRoom?.roomName?.split(",")]
                                            .map((i, idx) =>
                                              idx <= 3 ? (

                                                RoomsInclusion(i, idx)
                                              ) : (
                                                ""
                                              )
                                            )}
                                        </div>
                                        {
                                          [...hotelRoom?.roomName?.split(",")].length > 3 &&
                                          (<span style={{ color: "blue" }} onClick={() => handleinclusiondata([...hotelRoom?.roomName?.split(","), ...hotelRoom?.inclusions])}><button style={{ color: "blue", border: "1px solid white", backgroundColor: "white", marginTop: "-5%" }} >More</button></span>
                                          )
                                        }



                                       
                                      </div>
                                      {(hotelRoom && key === roomsArray?.combineRooms?.length - 1) ?
                                        <div className="hotel-room-details-main-inclusions-card-2" >
                                          {hotelRoom?.refundable ? (
                                            <>
                                              {hotelRoom.lastCancellationDate ? (
                                                <h1 style={{ fontSize: "small" }}>
                                                  Free Cancellation Till {moment(hotelRoom.lastCancellationDate).format("DD MMM YYYY")}
                                                </h1>
                                              ) : null}
                                              
                                              <span>
                                                <div
                                                  onClick={() =>
                                                    handelCancellationPolicy(
                                                      hotelRoom
                                                    )
                                                  }
                                                  // href="#"
                                                  // data-toggle="modal"
                                                  // data-target="#myBuildActivitiesModal"
                                                >

                                                  Cancellation Policy
                                                </div>
                                              </span> </>)
                                            : <span style={{ color: "#bd0c21" }}>
                                              Charges will Apply on Cancelling
                                            </span>
                                          }
                                        </div> : <div className="hotel-room-details-main-inclusions-card-2"><span></span></div>
                                      }
                                    </div>
                                    
                                    {(roomsArray && roomsArray?.combineRooms?.length > 0 && key === roomsArray?.combineRooms?.length - 1) ?
                                      <div className="hotel-room-details-main-price-card-1" >
                                      
                                        <span className="span-currency">
                                          <span style={{ fontSize: '18px', color: "green" }}>
                                            {activeCurrency}
                                          </span>
                                          <span style={{ fontSize: '22px' }}>  {currencyValue(roomsArray?.price)}
                                          </span>
                                          <span style={{ fontSize: '12px', color: 'grey' }}> / room
                                          </span>
                                        </span>



                                        <Button
                                          onClick={() => navigateToCheckout(roomsArray)}
                                          className="btn-choose-room-hotel-det chooseroom-details-hotel"
                                        >
                                          Choose Room
                                        </Button>


                                      </div> :
                                      <div className="hotel-room-details-main-price-card" >
                                        
                                        <span className="span-currency">
                                         
                                        </span>
                                        

                                       


                                      </div>
                                    }
                                  </div>




                                </>))}
                            </div>
                          </div>
                        </div>

                      </Card> :
                      <Card className="room-card-wrapper mb-2" key={index}>
                        {/* {console.log(roomsArray, "ht-rooms")} */}
                        {roomsArray?.combineRooms?.map((hotelRoom, key) => (<>
                          <div className="room-card" key={hotelRoom?.roomsId}>
                            {/* <span className="room-number-span">Room {key + 1}</span> */}
                            <h5 className="rm-nam-tp" style={{ margin: "0" }}>   {hotelRoom.roomName.split(",")[0]}</h5>
                            <div className="hotel-room-details-main-card" >


                              <div className="hotel-room-details-main-content-card" >
                                <div className="roomname-reff-part" >
                                  <h2 className="rm-name-t" style={{ fontSize: '16px', marginRight: '2%' }}>   {hotelRoom.roomName.split(",")[0]}</h2>
                                  {/* {console.log(key,"kkkk")} */}
                                  {/* {(roomsArray && roomsArray?.combineRooms?.length > 0 && key === roomsArray?.combineRooms?.length - 1) ? <> */}
                                  {hotelRoom.refundable ? <span style={{ color: "green", padding: '6px 8px', backgroundColor: '#c1ffdd', borderRadius: '7px', marginRight: '3%' }} className="roomlastcancel">Refundable</span> :
                                    <span style={{ color: "red", padding: '6px 8px', backgroundColor: '#fdd4cf', borderRadius: '7px', marginRight: '3%' }} className="roomlastcancel">Non-Refundable</span>}
                                  {/* </> : <span></span>} */}

                                </div>


                                <div className="hotel-room-details-main-inclusions-card" >
                                  <div className="hotel-room-details-main-inclusions-card1" >
                                    <div className="hotel-room-details-main-inclusions-card2" >
                                      
                                       
                                      {hotelRoom?.boardBasis &&
                                        <p className="board-b">Boarding : {hotelRoom?.boardBasis?.description === null ? hotelRoom?.boardBasis?.type : hotelRoom?.boardBasis?.description}</p>}
                                     
                                      {[...hotelRoom?.roomName?.split(",")]
                                        .map((i, idx) =>
                                          idx > 0 ? (
                                            RoomsInclusion(i, idx)
                                          ) : (
                                            ""
                                          )
                                        )}
                                      {
                                        [...hotelRoom?.roomName?.split(",")].length > 3 &&
                                        (<span style={{ color: "blue" }} onClick={() => handleinclusiondata([...hotelRoom?.roomName?.split(","), ...hotelRoom.inclusions])}><button style={{ color: "blue", border: "1px solid white", backgroundColor: "white", marginTop: "-5%" }} >More</button></span>
                                        )
                                      }

                                      
                                    </div>
                                    <div className="hotel-room-details-main-inclusions-card-2" >
                                      {hotelRoom?.refundable ? (
                                        <>
                                          {hotelRoom.lastCancellationDate ? (
                                            <h1 style={{ fontSize: "small" }}>
                                              Free Cancellation Till {moment(hotelRoom.lastCancellationDate).format("DD MMM YYYY")}
                                            </h1>
                                          ) : null}
                                         
                                          <span>
                                            <div
                                              onClick={() =>
                                                handelCancellationPolicy(
                                                  hotelRoom
                                                )
                                              }
                                              href="#"
                                              data-toggle="modal"
                                              data-target="#myBuildActivitiesModal"
                                            >
                                              Cancellation Policy
                                            </div>
                                          </span> </>)
                                        : <span style={{ color: "#bd0c21" }}>
                                          Charges will Apply on Cancelling
                                        </span>
                                      }
                                    </div>
                                  </div>
                                  <div className="hotel-room-details-main-price-card-1" >
                                   
                                    <span className="span-currency">
                                      <span style={{ fontSize: '18px', color: "green" }}>
                                        {activeCurrency}
                                      </span>
                                      <span style={{ fontSize: '22px' }}>  {currencyValue(roomsArray?.price)}
                                      </span>
                                    </span>
                                  
                                    <Button
                                      onClick={() => navigateToCheckout(roomsArray)}
                                      className="btn-choose-room-hotel-det chooseroom-details-hotel"
                                    >
                                      Choose Room
                                    </Button>

                                  </div>
                                </div>
                              </div>
                            </div>




                          </div >


                        </>))}
                        <div className="button-wrapper d-flex align-items-end flex-column chooseroom-details-hotel1">
                          <Button
                            onClick={() => navigateToCheckout(roomsArray)}
                            className="btn-choose-room-hotel-det chooseroom-details-hotel1"
                          >
                            Choose Room
                          </Button>
                        </div>
                      </Card>
                    }
                  </>
                ))
              ) :
                <Card className="no-rroms-cr" style={{ background: "#eaebee" }}>
                  <div className="rm-norooms">
                    
                    <img className="no-rm-im" src={ImBUrl+"images/filterno.jpg"} alt="No Filter" />
                    
                    <div style={{ textAlign: "center", paddingTop: "4%" }}>
                      <h4 style={{ color: "#bd0c21" }}>SORRY..!!</h4>
                      <p>We couldn't find any properties matching the criteria for hotel Rooms.</p>
                      <p>Please remove the filters applied and try again.</p>
                    </div>
                    <img className="no-rm" src={ImBUrl+"images/skyline.png"} alt="No Filter" />
                  </div>
                </Card>

            }
          </div>
        </div >
      </section >
     

      < section className="hotel-description" ref={myRef3}>
        <div className="hotel-description-wrapper">
          <div className="description-block">
           
            {loading ? (
              <div className="description-content">
                {" "}
                <Skeleton active />
              </div>
            ) : (
              <div
                className="description-content"
            
              >
                <h3>About Hotel</h3>{" "}
                {parse(hotelDetailsRespObj?.description)}
              </div>
            )}
          </div>

          <div className="description-block facilities-list">
          
            <div className="description-content miscell-data">
              <h3>Hotel Facilities</h3>
              <div className="facilities-block">
                <p className="rooms-available-sta">Miscellaneous</p>
                {loading ? (
                  <Skeleton active />
                ) : (
                  <ul>
                    <Row>
                      {hotelDetailsRespObj?.hotelFacility?.length > 0 ? (
                        hotelDetailsRespObj.hotelFacility.map(
                          (facility, index) => (
                            <Col key={"facili" + index} md={8} sm={8} xs={12}>
                              <li>
                                <i
                                  className="fa fa-check "
                                  style={{ color: "#008cff" }}
                                ></i>{" "}
                                {facility}
                              </li>{" "}
                            </Col>
                          )
                        )
                      ) : (
                        <p>No data available</p>
                      )}
                    </Row>
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="description-block facilities-list" ref={myRef4}>
          
            <div className="description-content miscell-data">
              <h3>Check-In Instructions</h3>
              <div className="facilities-block">
                <Row>
                  <Col md={24} sm={24} xs={24}>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      Extra-person charges may apply and vary depending on
                      property policy.
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      Government-issued photo identification and a credit card,
                      debit card, or cash deposit may be required at check-in
                      for incidental charges.
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      Special requests are subject to availability upon check-in
                      and may incur additional charges; special requests cannot
                      be guaranteed .
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      The primary guest must be at least 18 years of age to
                      check into this hotel(s) .
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      In some countries including India, as per Government
                      regulations, it is mandatory for all guests above 18 years
                      of age to carry a valid photo identity card & address
                      proof at the time of check-in. In case, check-in is denied
                      by the hotel due to lack of required documents, you cannot
                      claim for the refund & the booking will be considered as
                      NO SHOW. Please check with the hotel(s) directly .
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      Unless mentioned, the tariff does not include charges for
                      optional room services (such as telephone calls, room
                      service, mini bar, snacks, laundry extra bed etc.). In
                      case, such additional charges are levied by the hotel(s),
                      we shall not be held responsible for it .
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      Extra bed can be accommodated with a folding cot or a
                      mattress, subject to room size & availability .
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      The hotel(s) reserves the right to decline accommodation
                      to localities/same city residents.eTravos.com will not be
                      responsible for any check-in declined by the hotel(s) or
                      any refunds due to the above-mentioned reason .
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      eTravos.com will not be responsible for any service issues
                      at the hotel(s) .
                    </p>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          <div className="description-block facilities-list" ref={myRef5}>
           
            <div className="description-content miscell-data">
              <h3>Special Instructions</h3>
              <div className="facilities-block">
                <Row>
                  <Col md={24} sm={24} xs={24}>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      Early check -in/ Late checkout (Subject to availability,
                      Amount varies) to be Charges by the Property at time of
                      Service. .
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      To make arrangements for check-in please contact the
                      property at least 24 hours before arrival using the
                      information on the booking confirmation.
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      Guests must contact the property in advance for check-in
                      instructions. Front desk staff will greet guests on
                      arrival.
                    </p>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          <div className="description-block facilities-list">
          
            <div className="description-content miscell-data">
              <h3>Disclaimer Notification</h3>
              <div className="facilities-block">
                <Row>
                  <Col md={24} sm={24} xs={24}>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      Amenities are subject to availability and may be
                      chargeable as per the hotel policy.
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      We attempts to ensure that the information on this page is
                      complete and accurate; however this information along with
                      its links may contain typographical errors, and other
                      errors or inaccuracies. We assume no responsibility for
                      such errors or omissions, and reserve the right to correct
                      any errors, inaccuracies or omissions.
                    </p>
                    <p className="font-weight-normal">
                      <i
                        className="fa fa-check"
                        style={{ color: "#008cff" }}
                      ></i>{" "}
                      All information provided on this page is meant to serve as
                      a general information source only and does not constitute
                      professional advice. This page may not cover all
                      information available on a particular issue. Before
                      relying on this page, we urge you to independently
                      validate or obtain professional advice relevant to your
                      particular circumstances .
                    </p>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* // defaultProps.mapVisible */}
      {
        defaultProps.mapVisible ? (
          <section className="locationWrapper">
            <h3 className="rooms-available-sta">Location</h3>
            {loading ? (
              <Skeleton active paragraph={{ rows: 0 }} />
            ) : (
              <p className="loc">
                <EnvironmentOutlined /> {defaultProps.center.address}
              </p>
            )}

            <div className="mapWrapper">
              <GoogleMapReact
                bootstrapURLKeys={{
                  
                  key: "AIzaSyCWMz7PQCXuxL28R5tUY7nzjHY2L1NtgUc",
                  
                  language: "en",
                  region: "in",
                }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                distanceToMouse={() => { }}
              >
                <Marker
                  lat={defaultProps.center.lat}
                  lng={defaultProps.center.lng}
                />
              </GoogleMapReact>
            </div>
          </section>
        ) : null
      }
      <section className="hotel-details-footer e-hide">
        <div className="details-footer-wrapper">
          <div>
            <p>Ready for booking ?</p>
          </div>
          <div>
            <ReactBootstrap.Button>Show rooms</ReactBootstrap.Button>
          </div>
        </div>
        <div className="details-footer-second">
          <div className="second-footer-wrapper">
            <div>
              <p>Looking for something else in Hyderabad ?</p>
            </div>
            <div>
              <ReactBootstrap.Button>See similar hotels</ReactBootstrap.Button>
            </div>
            <div>
              <ReactBootstrap.Button>
                Return to search results
              </ReactBootstrap.Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Facilities Modal */}
      <div className="facilities-modal">
        <ReactBootstrap.Modal
          show={isRoomModal}
          onHide={(e) => setIsRoomModal(false)}
          size="lg"
          className="room-modal"
        >
          <ReactBootstrap.Modal.Header closeButton>
            <ReactBootstrap.Modal.Title>
              <div className="custom-modal-header">
                <div className="header-img">
                  <img
                    src={"https://dev-oc-images.s3.eu-north-1.amazonaws.com/images/htImgs/no_photo.png"}
                    alt="blank"
                  />
                </div>
                <div className="header-text">
                  <h4>
                  
                  </h4>
                  <p>
                    <i className="fa fa-wifi" aria-hidden="true"></i>
                   
                  </p>
                </div>
              </div>
            </ReactBootstrap.Modal.Title>
          </ReactBootstrap.Modal.Header>
          <ReactBootstrap.Modal.Body scrollable="true">
            <div className="custom-details-modal-body">
              <div>
                <p>Room facilities</p>
                <ul>
                 
                </ul>
              </div>
              <div className="room-cancellation-policy">
                
              </div>
            </div>
          </ReactBootstrap.Modal.Body>
        </ReactBootstrap.Modal>
      </div>

      {/* Room images modal */}
      <div className="images-carousel-modal">
        <ReactBootstrap.Modal
          className="hotel-images-modal"
          show={isShowModal}
          onHide={(e) => setIsShowModal(false)}
          size="lg"
        >
          <ReactBootstrap.Modal.Header closeButton className="modal-wrapper">
            <ReactBootstrap.Modal.Title>
              <p>{roomImagesModal.roomName}</p>
            </ReactBootstrap.Modal.Title>
          </ReactBootstrap.Modal.Header>
          <ReactBootstrap.Modal.Body>
            <ImagesLightbox hotelImages={roomImagesModal.images} />
          </ReactBootstrap.Modal.Body>
        </ReactBootstrap.Modal>
      </div>
      {/* <div
        className="modal left fade tabs-left-bar"
        id="myBuildActivitiesModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="myBuildActivitiesModalLabel"
      >
        <div
          className="modal-dialog"
          role="document"
          style={{ width: "500px" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                Cancellation Policy
              </span>
              <button
                type="button"
                className="close close-hide-show"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">X</span>
              </button>
            </div>

            <div className="modal-body">
              {roomsData != null && (
                <>
                  <p className="heading-part-modal-cancellation">
                    {roomsData.roomName?.split(",")[0]}
                  </p>
                  {cancellationInfo.length > 0
                    ? cancellationInfo?.map((can, i) => {
                     
                      return (

                        <div className={can?.penaltyAmount > 0 ? "modal-popup-cancellation" : "modal-popup-cancellation-1"}>
                          <div className="modal-popup-cancellation2">
                            {can?.penaltyAmount > 0 ?
                              <i
                                class="fa fa-calendar"
                                style={{ color: "red", fontSize: "20px" }}
                              ></i> : <i
                                class="fa fa-calendar"
                                style={{ color: "rgb(0, 191, 0)", fontSize: "20px" }}
                              ></i>}
                          </div>
                          <div className="modal-popup-cancellation1">
                            <p style={{ margin: "0px 0px 0px" }}>
                              <strong>From-</strong>{" "}
                              {moment(can.fromDate).format(
                                "DD MMM YYYY HH:mm:ss"
                              )}
                            </p>
                            <p style={{ margin: "0px 0px 0px" }}>
                              <strong>To-</strong>{" "}
                              {moment(can.toDate).format(
                                "DD MMM YYYY HH:mm:ss"
                              )}
                            </p>

                           
                          </div>
                          <div className="modal-popup-cancellation1">
                            <p style={{ margin: "0px 0px 0px" }}><strong>Cancellation Charges</strong></p>
                            {can.chargeType === "Amount" ?
                              <p style={{ margin: "0px 0px 0px" }}><strong>{activeCurrency}  {currencyValue(can?.penaltyAmount)} </strong></p> : null}
                            {can?.chargeType === "Nights" ?
                              <p style={{ margin: "0px 0px 0px" }}><strong>{can?.penaltyAmount} {" Nights"}</strong></p> : null}
                            {can?.chargeType == "Percentage" ?
                              <p style={{ margin: "0px 0px 0px" }}><strong>  {can.penaltyAmount} {can.chargeType == "Percentage" ? "%" : ""}</strong></p> : null}



                         
                          </div>
                        </div>
                      );
                    })
                    : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div> */}
       <Modal
        title="Cancellation Policy"
        open={showcancellationModal}
        onCancel={handleCancel}
        footer={null} 
        width={500} 
      >
        <div className="modal-body">
              {roomsData != null && (
                <>
                  <p className="heading-part-modal-cancellation">
                    {roomsData.roomName?.split(",")[0]}
                  </p>
                  {cancellationInfo.length > 0
                    ? cancellationInfo?.map((can, i) => {
                     
                      return (

                        <div className={can?.penaltyAmount > 0 ? "modal-popup-cancellation" : "modal-popup-cancellation-1"}>
                          <div className="modal-popup-cancellation2">
                            {can?.penaltyAmount > 0 ?
                              <i
                                class="fa fa-calendar"
                                style={{ color: "red", fontSize: "20px" }}
                              ></i> : <i
                                class="fa fa-calendar"
                                style={{ color: "rgb(0, 191, 0)", fontSize: "20px" }}
                              ></i>}
                          </div>
                          <div className="modal-popup-cancellation1">
                            <p style={{ margin: "0px 0px 0px" }}>
                              <strong>From-</strong>{" "}
                              {moment(can.fromDate).format(
                                "DD MMM YYYY HH:mm:ss"
                              )}
                            </p>
                            <p style={{ margin: "0px 0px 0px" }}>
                              <strong>To-</strong>{" "}
                              {moment(can.toDate).format(
                                "DD MMM YYYY HH:mm:ss"
                              )}
                            </p>

                           
                          </div>
                          <div className="modal-popup-cancellation1">
                            <p style={{ margin: "0px 0px 0px" }}><strong>Cancellation Charges</strong></p>
                            {can.chargeType === "Amount" ?
                              <p style={{ margin: "0px 0px 0px" }}><strong>{activeCurrency}  {currencyValue(can?.penaltyAmount)} </strong></p> : null}
                            {can?.chargeType === "Nights" ?
                              <p style={{ margin: "0px 0px 0px" }}><strong>{can?.penaltyAmount} {" Nights"}</strong></p> : null}
                            {can?.chargeType == "Percentage" ?
                              <p style={{ margin: "0px 0px 0px" }}><strong>  {can.penaltyAmount} {can.chargeType == "Percentage" ? "%" : ""}</strong></p> : null}



                         
                          </div>
                        </div>
                      );
                    })
                    :    (
                      <p>No cancellation information available at the moment. </p>
                    )}
                </>
              )}
            </div>
      </Modal>
      <Modal
        className="modal-css-direction-popup"
        open={isinclusionvisible}
        onCancel={() => setisinclusionvisible(false)}
        onOk={() => setisinclusionvisible(false)}
      >
        {" "}
        {inclusiondata?.length
          ? inclusiondata?.map((i, idx) =>
            idx > 0 ? (
              <>
                {idx === 1 ? (
                  <p className="mb-0 mr-1">
                    <strong>Inclusions :</strong>
                  </p>
                ) : null}

                <p className="mb-0 mr-1">
                  <i
                    className="fa fa-check color-blue"
                    aria-hidden="true"
                  ></i>{" "}
                  {i}
                </p>
              </>
            ) : (
              ""
            )
          )
          : ""}
      </Modal>
    </div >
    </>
  );
};

export default HotelDet;
