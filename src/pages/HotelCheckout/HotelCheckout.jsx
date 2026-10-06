import React, { useContext, useState, useEffect, useRef } from "react";

import HotelDetailsBox from "../../components/HotelDetailsBox/HotelDetailsBox";
import {
  Row,
  Card,
  Col,
  Form,
  Input,
  DatePicker,
  Select,
  Skeleton,
  message,
  Radio,
  TimePicker,
  Tooltip,
  Modal, Statistic,
} from "antd";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,

} from "@ant-design/icons";
import HotelFairBox from "./HotelFairBox";

import GlobalStatesContext from "../../Providers/GlobalStatesContext";
import { selectIsAgent } from "../../store/slices/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { setHotelCheckOutData as setHotelCheckOutDataAction, getsessiontimeout } from "../../store/slices/hotelSlice";
import { getPassengerData } from "../../Helpers/PassegerData";

import HotelBookPayCard from "./HotelBookPayCard";
import CountryList from "../../common/CountryList";
import queryString from "query-string";

import ApiClient from "../../Helpers/ApiClient";
import Apiclient1 from "../../Helpers/Apiclient1";
import "./HotelCheckout.scss";

import moment from "moment";
import dayjs from "dayjs";
const { Option } = Select;
const { Countdown } = Statistic;
const timeoutimg = import.meta.env.VITE_BASE_URL + "images/timeout.jpg";
const HotelCheckout = ({ location }) => {
  const dispatch = useDispatch();
  const sessiontimeout = useSelector(state => state.hotel.sessiontimeout);
  const status = useSelector(state => state.hotel.status);
  const setHotelCheckOutData = (data) => dispatch(setHotelCheckOutDataAction(data));
  const getsessiontimeoutHandler = () => dispatch(getsessiontimeout());
  const user = useSelector((state) => state.auth.user);
  const agent = useSelector(selectIsAgent);
  const {
    state: {
      otherData: { insuranceData, selectedInsuranceData },
    },

    setSelectedInsuranceData,

  } = useContext(GlobalStatesContext);
  let history = useNavigate();
  const [contact_form] = Form.useForm();
  const [guestDetailsForm] = Form.useForm();
  const [arrival_form] = Form.useForm();
  const [departure_form] = Form.useForm();
  const [value, setValue] = useState(1);
  const [ids, setIds] = useState({
    traceId: null,
    repriceId: null,
  });
  const [loading, setLoading] = useState(true);
  const [hotelPriceData, setHotelPriceData] = useState({});
  const [transportType, setTransportType] = useState(0);
  const [arrivalType, setArrivalType] = useState(0);
  const [hotelSearchData, setHotelSearchData] = useState({});
  const [agentTax, setAgentTax] = useState(0);
  const [roomGuestInfo, setRoomGuestInfo] = useState([]);
  const mobile = useRef();

  const mobileRef = useRef(null);
  const areaCodeRef = useRef(null);
  const handleAgentTaxChange = (taxValue) => {
    setAgentTax(taxValue);
  };

  const handleAreaCodeChange = () => {

    if (mobileRef.current) {
      mobileRef.current.focus();
    }
  };

  const handlePaxField = (val, roomIndex, paxIndex, key) => {

    let temp = [...roomGuestInfo];

    if (paxIndex === 0) {
      temp[roomIndex].paxInfoList[paxIndex]["leadGuest"] = true;
    } else {
      temp[roomIndex].paxInfoList[paxIndex]["leadGuest"] = false;
    }

    temp[roomIndex].paxInfoList[paxIndex][key] = val;

    setRoomGuestInfo(temp);

  };

  const [insuranceRequired, setInsuranceRequired] = useState(-1);

  const loadpassengerData = () => {
    if (user && user?.UserID) {
      getPassengerData(user.UserID).then((data) => {
        if (data.status) {
          contact_form.setFieldsValue({
            phoneNo: data.Mobile,
            email: data.Email,

            addressLine1: data?.Address1 ? data?.Address1 : "",
            city: data?.city ? data?.city : "",
            state: data?.state ? data?.state : "",
          });
        }
      });
    }
  };

  useEffect(() => {

    fetchHotelPrice();
    loadpassengerData();
    getsessiontimeout();
  }, []);



  const HotelGuestReqFields = (paxObj, guestRequiredFields) => {

    let isFirstAdult = true;

    guestRequiredFields.map((paxReqFieldsObj) => {
      Object.keys(paxReqFieldsObj).map((paxReqKeys) => {
        if (paxReqFieldsObj[paxReqKeys] === true) {
          if (paxObj.type === 'adult' && isFirstAdult) {
            paxObj[paxReqKeys] = "";
            isFirstAdult = false;
          } else if (paxObj.type !== 'child') {
            paxObj[paxReqKeys] = "";
          }
        }
      });
    });
    return paxObj;
  };



  const fetchHotelPrice = () => {
    const hotelParams = queryString.parse(window.location.search);

    setLoading(true);
    setHotelPriceData({});
    setHotelSearchData({});
    setRoomGuestInfo([]);

    let ratePlansObj = [];
    try {
      if (typeof hotelParams.ratePlans === "string") {
        ratePlansObj = JSON.parse(hotelParams.ratePlans);
      } else if (Array.isArray(hotelParams.ratePlans)) {
        ratePlansObj = hotelParams.ratePlans;
      }
    } catch (e) {
      ratePlansObj = [];
    }

    const supplierParamVal =
      hotelParams.supplierParameter ||
      hotelParams.supplierParamter ||
      "";

    const requestBody = {
      traceId: hotelParams.traceId || "",
      hotelCode: hotelParams.hotelCode || "",
      roomsId: hotelParams.roomsId || hotelParams.roomsID || "",
      supplierParameter: supplierParamVal,
      supplierParamter: supplierParamVal,
      ratePlans: ratePlansObj.map((rp) => ({
        roomsId: rp.roomsId || rp.roomsID || "",
        ratePlanId: rp.ratePlanId || "",
      })),
    };

    console.log("HotelPrice request body:", requestBody);

    Apiclient1.post("Hotel/HotelPrice", requestBody)
      .then((res) => {
        console.log("HotelPrice response:", res);

        const hasErrors = res?.errors?.length > 0 && res.errors.some((e) => e.errorCode);

        if (!hasErrors && res?.hotels) {
          const hotels = res.hotels;
          const {
            purchaseType,
            repriceId,
            traceId,
            currencyISOCode,
            sessionInfo,
            isPriceChange,
          } = res;

          const traceIdVal = traceId || hotelParams.traceId || "";

          setIds({
            traceId: traceIdVal,
            repriceId: repriceId || null,
          });

          // Build combineRoom for backwards compatibility with UI components
          let combineRoom = [];
          if (hotels.combineRoom && hotels.combineRoom.length > 0) {
            combineRoom = hotels.combineRoom;
          } else if (hotels.rooms && hotels.rooms.length > 0) {
            let totalBasePrice = 0;
            let totalTax = 0;
            let totalOtherCharges = 0;
            let totalExtraGuestCharges = 0;
            let totalDiscount = 0;
            let grandTotal = 0;
            let agentMarkup = 0;

            const combineRooms = hotels.rooms.map((room) => {
              const ratePlan = room.ratePlans?.[0] || {};
              const priceObj = ratePlan.price || ratePlan.prefPrice || {};
              const base = Number(priceObj.base || 0);
              const tax = Number(priceObj.tax || 0);
              const discount = Number(priceObj.discount || 0);
              const total = Number(priceObj.total || (base + tax));

              totalBasePrice += base;
              totalTax += tax;
              totalOtherCharges += Number(priceObj.otherCharges || 0);
              totalExtraGuestCharges += Number(priceObj.extraGuestCharges || 0);
              totalDiscount += discount;
              grandTotal += total;
              agentMarkup += Number(priceObj.agentMarkup || 0);

              return {
                roomId: room.roomId,
                roomName: room.roomName,
                roomType: room.roomTypeId || room.roomName || "",
                ratePlanName: ratePlan.ratePlanName || room.roomName || "",
                priceDetails: {
                  base,
                  tax,
                  discount,
                  total,
                  totalBasePrice: base,
                  otherCharges: Number(priceObj.otherCharges || 0),
                  extraGuestCharges: Number(priceObj.extraGuestCharges || 0),
                  agentMarkup: Number(priceObj.agentMarkup || 0),
                  markup: 0,
                  adminCommission: 0,
                },
                price: total,
                cancellationPolicy: ratePlan.cancellationPolicy || [],
                lastCancellationDate: ratePlan.lastCancellationDate || null,
                refundable: ratePlan.refundable ?? true,
              };
            });

            combineRoom = [
              {
                combineRooms,
                price: grandTotal,
                agentMarkup,
                priceDetails: {
                  base: totalBasePrice,
                  tax: totalTax,
                  totalTax: totalTax,
                  discount: totalDiscount,
                  total: grandTotal,
                  totalBasePrice,
                  otherCharges: totalOtherCharges,
                  extraGuestCharges: totalExtraGuestCharges,
                  agentMarkup,
                  markup: 0,
                  adminCommission: 0,
                },
              },
            ];
          }

          const priceSupplierParam =
            res?.hotels?.rooms?.[0]?.ratePlans?.[0]?.supplierParamter ||
            res?.hotels?.rooms?.[0]?.ratePlans?.[0]?.supplierParameter ||
            res?.hotels?.combineRoom?.[0]?.supplierParamter ||
            res?.hotels?.combineRoom?.[0]?.supplierParameter ||
            res?.hotels?.supplierParamter ||
            res?.hotels?.supplierParameter ||
            res?.supplierParamter ||
            res?.supplierParameter ||
            supplierParamVal ||
            "";

          setHotelPriceData({
            ...hotels,
            address: hotels.hotelAddress || hotels.address || "",
            images: hotels.imageList || hotels.images || [],
            country: hotels.countryCode || hotels.countryName || "IN",
            combineRoom,
            purchaseType: purchaseType || "instant",
            traceId: traceIdVal,
            repriceId,
            currencyISOCode: currencyISOCode || "INR",
            sessionInfo,
            isPriceChange,
            supplierParameter: priceSupplierParam,
            supplierParamter: priceSupplierParam,
          });

          // Build searchDataObj (dates, rooms, guests)
          const checkInDate = hotels.checkIn || hotelParams.checkInDate || hotelParams.checkIn || "";
          const checkOutDate = hotels.checkOut || hotelParams.checkOutDate || hotelParams.checkOut || "";

          let roomGuests = [];
          if (hotelParams.roomGuests) {
            try {
              roomGuests = typeof hotelParams.roomGuests === "string" ? JSON.parse(hotelParams.roomGuests) : hotelParams.roomGuests;
            } catch (e) {
              roomGuests = [];
            }
          }
          if (!roomGuests || roomGuests.length === 0) {
            if (hotels.rooms?.length > 0) {
              roomGuests = hotels.rooms.map((r) => ({
                noOfAdults: Number(r.adultCount || 1),
                noOfChilds: Number(r.childCount || 0),
                childAge: [],
              }));
            }
          }

          const searchDataObj = {
            checkInDate,
            checkOutDate,
            roomGuests,
            supplier: hotels.supplier || hotelParams.supplier || "none",
            supplierParameter: priceSupplierParam,
            supplierParamter: priceSupplierParam,
          };
          setHotelSearchData(searchDataObj);
          setHotelCheckOutData({});

          // Generate pax guest input lists
          const roomInfoArr = [];
          roomGuests.forEach((room, roomIndex) => {
            const paxListArr = [];
            const noOfAdults = Number(room.noOfAdults || 1);
            const noOfChilds = Number(room.noOfChilds || 0);

            [...Array(noOfAdults)].forEach(() => {
              let paxObj = {
                firstName: "",
                lastName: "",
                title: "Mr.",
                guestType: "Adult",
                guestInRoom: roomIndex + 1,
                age: "",
              };
              if (hotels.guestRequiredFields) {
                paxObj = HotelGuestReqFields(paxObj, hotels.guestRequiredFields);
              }
              paxListArr.push(paxObj);
            });

            [...Array(noOfChilds)].forEach((_, index) => {
              let paxObj = {
                firstName: "",
                lastName: "",
                title: "Mstr",
                guestType: "Child",
                guestInRoom: roomIndex + 1,
                age: room.childAge?.[index] ? parseInt(room.childAge[index]) : "",
              };
              if (hotels.guestRequiredFields) {
                paxObj = HotelGuestReqFields(paxObj, hotels.guestRequiredFields);
              }
              paxListArr.push(paxObj);
            });

            roomInfoArr.push({ paxInfoList: paxListArr });
          });

          setRoomGuestInfo(roomInfoArr);
        } else if (res?.errors?.length > 0) {
          res.errors.forEach((err) => {
            if (err.errorCode === "SOLDOUT") {
              message.error(err.errorDetail || "Room is sold out", 5);
            } else {
              message.error(err.errorDetail || err.errorMessage || "Price fetch failed");
            }
          });
        } else {
          message.error("Failed to fetch hotel pricing details.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("HotelPrice API call error:", err);
        message.error("Error fetching hotel price");
        setLoading(false);
      });
  };
  const updateTranportType = (e) => {
    if (e.target) {

      setTransportType(e.target.value);
    } else {
      setTransportType(e);
    }
  };
  const updateArrivalType = (e) => {
    if (e.target) {

      setArrivalType(e.target.value);
    } else {
      setArrivalType(e);
    }
  };

  const handleInsuranceChange = (val) => {
    if (val === 1) {
      setSelectedInsuranceData(insuranceData);
    } else {
      setSelectedInsuranceData({ amount: 0, insuranceCoverage: 0, status: 0 });
    }
    setInsuranceRequired(val);
  };

  const redirectToPreview = () => {
    departure_form
      .validateFields()
      .then((departData) => {
        arrival_form
          .validateFields()
          .then((arrivalData) => {
            contact_form
              .validateFields()
              .then((val) => {
                guestDetailsForm
                  .validateFields()
                  .then((passegersData) => {
                    let countryName = "";
                    if (val.countryCode) {
                      countryName = CountryList.filter(
                        (item) => item.code === val.countryCode
                      );
                      countryName = countryName[0].name;
                    }

                    let data = {
                      hotelPriceData,
                      hotelSearchData,
                      addressInfo: {
                        addressLine1: val.addressLine1,
                        addressLine2: val.addressLine1,
                        cellCountryCode: val.areaCode,
                        countryCode: val.countryCode,
                        areaCode: val.areaCode,
                        phoneNo: val.phoneNo,
                        email: val.email,
                        city: val.city,
                        state: val.state,
                        country: countryName,
                        zipCode: val.zipCode,
                      },
                      arrivalTransport: {
                        ArrivalTransportType: arrivalType,
                        TransportInfoId:
                          arrivalType == 0
                            ? arrivalData.FlightNo
                            : arrivalData.TransportTypeNo,
                        Time: moment(arrivalData.DateTime).format(
                          "YYYY-MM-DDTHH:mm:ss"
                        ),
                      },
                      departureTransport: {
                        DepartureTransportType: transportType,
                        TransportInfoId:
                          transportType == 0
                            ? departData.FlightNo
                            : departData.TransportTypeNo,
                        Time: moment(departData.DateTime).format(
                          "YYYY-MM-DDTHH:mm:ss"
                        ),
                      },
                      guests: roomGuestInfo,
                      agentTax: agentTax,

                      insuranceRequired:
                        passegersData?.insuranceRequired === 1 ? 1 : 0,
                      insuranceData: selectedInsuranceData,
                    };
                    { console.log(roomGuestInfo, "guest") }

                    setHotelCheckOutData(data);

                    history("/hotels/preview");
                  })
                  .catch((e) => {
                    if (e?.errorFields && e?.errorFields.length > 0)
                      guestDetailsForm.scrollToField(e.errorFields[0].name);
                  });
              })
              .catch((e) => {
                if (!e.errorFields) {
                  return;
                }
                contact_form.scrollToField(e.errorFields[0].name);
              });
          })
          .catch((e) => {
            if (!e.errorFields) {
              return;
            }
            arrival_form.scrollToField(e.errorFields[0].name);
          });
      })
      .catch((e) => {
        if (!e.errorFields) {
          return;
        }
        departure_form.scrollToField(e.errorFields[0].name);
      });
  };



  const gotoHotelDetail = (hotelCode) => {
    let queryObj = {
      hotelId: hotelCode,
      traceId: ids.traceId,
      supplier: hotelSearchData.supplier,
    };
    const query = queryString.stringify(queryObj);
    history(`/hotels/hotel-details?${query}`);
  };

  const timeout = () => {
    return (

      <div>

        <div className="timeout-popup-main">
          <div className="timeout-popup-main1">
            <img className="timeout-img" src={timeoutimg} alt="time" />
          </div>
          <div className="timeout-popup-main2">
            <h4 style={{ color: "red", }}><strong>SESSION TIMEOUT</strong></h4>
            <p className="popup-session-timeout-p-tag">Your Session is Expired</p>
            <p className="popup-session-timeout-p-tag">Click on "OK" to continue with New Search</p>
          </div>
        </div>

      </div>
    );
  }
  const handelCountdown = () => {


    let query = queryString.stringify(JSON.parse(localStorage.getItem('HotelSearchBar')));

    Modal.warning({
      icon: <></>,

      content: timeout(),
      onOk() {
        history("/hotels/listing?" + query);

      },
    });
  };

  return (
    <>

      <div className="hotel-checkout-wrapper">
        <div className="checkout-heading">
          <div

            fluid
            className="checkout-heading-container"
          >
            <div className="goback">
              <Link
                onClick={() => {
                  history(-1);
                }}
              >
                <ArrowLeftOutlined />
                <span>Go back and select another Room</span>
              </Link>
            </div>
            <h3>Fill out the form below and book your stay now!</h3>
          </div>
        </div>


        <div className="form-body">
          <div className="form-body-container">

            <Row gutter={[16]}>

              <Col md={16} sm={24} xs={24}>


                {loading ? (
                  <Card bordered={false} className="hotel-card-wrapper">
                    <Skeleton active />
                  </Card>
                ) : Object.keys(hotelPriceData).length > 0 ? (
                  <Card bordered={false} className="hotel-card-wrapper">
                    <HotelDetailsBox
                      Ids={ids}
                      hotelDetailsObj={hotelPriceData}
                      hotelSearchData={hotelSearchData}
                    />
                  </Card>
                ) : null}

                <div className="contact-header">
                  <div className="contact-title">
                    <p className="booking-summary-div" style={{ marginBottom: "4px" }}>Guests Details</p>
                  </div>
                </div>

                {loading ? (
                  <Card bordered={false} className="hotel-card-wrapper">
                    <Skeleton active />
                  </Card>
                ) : roomGuestInfo?.length > 0 ? (
                  <Form
                    form={guestDetailsForm}
                    scrollToFirstError={true}
                    layout="vertical"
                    style={{ marginBottom: 20 }}

                  >


                    {roomGuestInfo.map((roomsObj, roomIndex) => (
                      <Card
                        bordered={false}
                        className="guest-details-form hotel-card-wrapper"
                        key={roomIndex}
                      >
                        <div className="room-card-header-pill">
                          <p className="room-title">Room {1 + roomIndex}</p>
                        </div>

                        {roomsObj.paxInfoList.map((pax, paxIndex) => (

                          <div
                            key={roomIndex + "detials" + paxIndex}
                            className="guest-input-wrapper"
                          >

                            <p className="guestsType">
                              {pax.guestType === "Adult" ? "Adult" : "Child"}{" "}
                            </p>

                            <Row gutter={[16, 16]} style={{ padding: 10 }}>
                              <Col md={4} sm={12} xs={24}>
                                {pax.guestType === "Adult" ? (
                                  <Form.Item
                                    name={`Title_${roomIndex}_${paxIndex}`}
                                    label="Title"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Required",
                                      },
                                    ]}
                                  >
                                    <Select
                                      placeholder="Title"
                                      size="large"
                                      onChange={(val) => {
                                        handlePaxField(
                                          val,
                                          roomIndex,
                                          paxIndex,
                                          "title"
                                        );
                                      }}
                                    >
                                      <Option value="Mr">Mr</Option>
                                      <Option value="Ms">Ms</Option>
                                      <Option value="Mrs">Mrs</Option>
                                    </Select>
                                  </Form.Item>
                                ) : (
                                  <Form.Item
                                    name={`Title_${roomIndex}_${paxIndex}`}
                                    label="Title"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Required",
                                      },

                                    ]}
                                  >
                                    <Select
                                      size="large"
                                      onChange={(val) => {
                                        handlePaxField(
                                          val,
                                          roomIndex,
                                          paxIndex,
                                          "title"
                                        );
                                      }}
                                    >
                                      <Option value="Mstr">Mstr</Option>
                                    </Select>
                                  </Form.Item>
                                )}
                              </Col>

                              <Col md={8} sm={12} xs={24}>
                                <Form.Item
                                  label="First Name"
                                  name={`firstname_${roomIndex}_${paxIndex}`}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Required",
                                    },
                                    {
                                      pattern: /^[A-Za-z]+$/,
                                      message: "Only alphabets are allowed",
                                    },
                                  ]}
                                >
                                  <Input
                                    placeholder="Enter Your First Name"
                                    onChange={(e) => {
                                      handlePaxField(
                                        e.target.value,
                                        roomIndex,
                                        paxIndex,
                                        "firstName"
                                      );
                                    }}
                                    onInput={(e) => e.target.value = ("" + e.target.value).toUpperCase()}
                                    size="large"
                                  />
                                </Form.Item>
                              </Col>

                              <Col md={8} sm={12} xs={24}>
                                <Form.Item
                                  label="Last Name"
                                  name={`lastname_${roomIndex}_${paxIndex}`}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Required",
                                    },
                                    {
                                      pattern: /^[A-Za-z]+$/,
                                      message: "Only alphabets are allowed",
                                    },
                                  ]}
                                >
                                  <Input
                                    placeholder="Enter Your Last Name"
                                    onInput={(e) => e.target.value = ("" + e.target.value).toUpperCase()}
                                    onChange={(e) => {
                                      handlePaxField(
                                        e.target.value,
                                        roomIndex,
                                        paxIndex,
                                        "lastName"
                                      );
                                    }}
                                    size="large"
                                  />
                                </Form.Item>
                              </Col>
                              {pax.guestType === "Child" ? (
                                <Col md={4} sm={12} xs={24}>
                                  <Form.Item
                                    name={`childAge_${roomIndex}_${paxIndex}`}
                                    label="Child Age"
                                    initialValue={pax.age ?? ""}
                                  >

                                    <Input

                                      className="inputbg"
                                      size="large"

                                      readOnly
                                    />


                                  </Form.Item>
                                </Col>
                              ) : (
                                <Col md={4} sm={12} xs={24}>
                                  <Form.Item
                                    name={`adultage_${roomIndex}_${paxIndex}`}
                                    label="Age"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Required",
                                      },
                                      {
                                        type: "number",
                                        transform: (value) =>
                                          value >= 2 && value <= 12
                                            ? value
                                            : undefined,
                                        max: 99,
                                        message: "Age must be > 12y",
                                      },

                                    ]}
                                  >

                                    <Input
                                      // type="number"
                                      placeholder="Enter Your Age"
                                      className="inputbg"
                                      maxLength={2} // Prevents input of more than 2 digits
                                      onKeyPress={(e) => {
                                        if (!/^\d$/.test(e.key)) {
                                          e.preventDefault(); // Prevents typing non-numeric characters
                                        }
                                      }}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, ""); // Removes non-numeric characters
                                        if (Number(value) < 100) {
                                          handlePaxField(value, roomIndex, paxIndex, "age");
                                        }
                                        handlePaxField(
                                          e.target.value,
                                          roomIndex,
                                          paxIndex,
                                          "age"
                                        );
                                      }}
                                      // onChange={(e) => {
                                      //   handlePaxField(
                                      //     e.target.value,
                                      //     roomIndex,
                                      //     paxIndex,
                                      //     "age"
                                      //   );
                                      // }}
                                      size="large"
                                    />
                                  </Form.Item>
                                </Col>
                              )}
                              {pax.hasOwnProperty("pan") && (
                                <Col md={8} sm={12} xs={24}>
                                  <Form.Item
                                    name={`pan_${roomIndex}_${paxIndex}`}
                                    label={
                                      <span>
                                        PAN Number &nbsp;
                                        {pax.guestType === "Child" ?
                                          <Tooltip title="Add Pancard No Same As Adult">
                                            <QuestionCircleOutlined />
                                          </Tooltip> : null}
                                      </span>
                                    }
                                    rules={[
                                      {
                                        required: true,

                                      },
                                      {
                                        pattern:
                                          "^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$",
                                        message:
                                          "Please Enter A Valid PAN No",
                                      },
                                    ]}

                                  >
                                    <Input
                                      size="large"
                                      className="inputbg"
                                      placeholder="PAN Number"
                                      onInput={(e) => e.target.value = ("" + e.target.value).toUpperCase()}
                                      onChange={(e) => {

                                        handlePaxField(

                                          e.target.value,
                                          roomIndex,
                                          paxIndex,
                                          "pan"
                                        )
                                      }}

                                    />
                                  </Form.Item>
                                </Col>
                              )}


                              {pax.hasOwnProperty("passportNo") && (
                                <Col md={8} sm={12} xs={24}>
                                  <Form.Item
                                    label="Passport Number"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Required",
                                      },
                                    ]}
                                    name={`passportNo_${roomIndex}_${paxIndex}`}
                                  >
                                    <Input
                                      size="large"
                                      className="inputbg"
                                      placeholder="Passport Number"
                                      onChange={(e) =>
                                        handlePaxField(
                                          e.target.value,
                                          roomIndex,
                                          paxIndex,
                                          "passportNo"
                                        )
                                      }
                                    />
                                  </Form.Item>
                                </Col>
                              )}
                              {pax.hasOwnProperty("passportDOI") && (
                                <Col md={8} sm={12} xs={24}>
                                  <Form.Item
                                    label="Passport DOI"
                                    className="passport-dates"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Required",
                                      },
                                    ]}
                                    name={`passportDOI_${roomIndex}_${paxIndex}`}
                                  >
                                    <DatePicker
                                      placeholder="Issued Date"
                                      size="large"
                                      onChange={(date, dateString) =>
                                        handlePaxField(
                                          dateString,
                                          roomIndex,
                                          paxIndex,
                                          "passportDOI"
                                        )
                                      }
                                      format={"YYYY-MM-DD"}
                                      style={{ width: "100%" }}
                                    />
                                  </Form.Item>
                                </Col>
                              )}
                              {pax.hasOwnProperty("passportDOE") && (
                                <Col md={8} sm={12} xs={24}>
                                  <Form.Item
                                    label="Passport DOE"
                                    className="passport-dates"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Required",
                                      },
                                    ]}
                                    name={`passportDOE_${roomIndex}_${paxIndex}`}
                                  >
                                    <DatePicker
                                      placeholder="Expiry Date"
                                      size="large"
                                      onChange={(_, dateString) =>
                                        handlePaxField(
                                          dateString,
                                          roomIndex,
                                          paxIndex,
                                          "passportDOE"
                                        )
                                      }
                                      format={"YYYY-MM-DD"}
                                      style={{ width: "100%" }}
                                    />
                                  </Form.Item>
                                </Col>
                              )}
                            </Row>
                          </div>
                        ))}

                      </Card>
                    ))}{" "}


                  </Form>
                ) : null}
                <Card bordered={false} className="guest-details-form hotel-card-wrapper">
                  <div className="contact-card-header">
                    <p className="bk-cntct">Contact Details</p>
                  </div>
                  <div>
                    <Form
                      layout="vertical"
                      name="contactForm"
                      form={contact_form}
                      scrollToFirstError={true}
                      initialValues={{
                        areaCode: "+91",
                      }}
                    >
                      <div className="guest-input-wrapper">
                        <Row gutter={16} style={{ padding: 10 }}>
                          <Col md={8} sm={12} xs={24}>
                            <Form.Item
                              label="Email"
                              name="email"
                              rules={[
                                { required: true, message: "Required" },
                                { type: "email", message: "Invalid Email" },
                              ]}
                            >
                              <Input
                                size="large"
                                placeholder="Enter Valid Email"
                              />
                            </Form.Item>
                          </Col>
                          <Col md={8} sm={12} xs={24}>
                            <Form.Item
                              label="Phone number"
                              name="phoneNo"
                              className="phno"
                              rules={[
                                {
                                  required: true,
                                  message: "Required",
                                },


                                {
                                  minLength: 10,
                                  maxLength: 10,
                                  pattern: "^[0-9]{10}$",
                                  message: "Must be 10 digits",
                                },

                              ]}
                            >
                              <Input
                                placeholder="Enter Mobile Number"
                                size="large"
                                ref={mobileRef}
                                addonBefore={
                                  <Form.Item
                                    style={{ width: "35%" }}
                                    name="areaCode"
                                    className="phno"
                                    rules={[
                                      {
                                        required: true,
                                        message:
                                          "Phone Number Code Required",
                                      },
                                    ]}
                                    noStyle
                                  >
                                    <Select
                                      showSearch
                                      placeholder="Select "
                                      style={{ width: "100%" }}
                                      onChange={handleAreaCodeChange}
                                      ref={areaCodeRef}

                                      focusRef={mobile}
                                      filterOption={(input, option) =>
                                        option.children
                                          .toLowerCase()
                                          .indexOf(input.toLowerCase()) >= 0
                                      }
                                    >
                                      {CountryList.map((item) => (
                                        <Option
                                          key={item.dial_code}
                                          value={item.dial_code}
                                        >
                                          {item.dial_code}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                }
                                onKeyPress={(event) => {
                                  if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                  }
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col md={8} sm={12} xs={24}>
                            <Form.Item
                              name="addressLine1"
                              label="Address"
                              rules={[
                                {
                                  required: true,
                                  message: "Required",
                                },
                              ]}
                            >
                              <Input
                                placeholder="Enter Your Address"
                                size="large"
                              />
                            </Form.Item>
                          </Col>



                          <Col md={8} sm={12} xs={24}>
                            <Form.Item
                              name="countryCode"
                              label="Country"
                              rules={[
                                {
                                  required: true,
                                  message: "Required",
                                },
                              ]}
                            >
                              <Select
                                size="large"
                                showSearch
                                placeholder="Select Country"
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {CountryList.map((item) => (
                                  <Option key={item.code} value={item.code}>
                                    {item.name}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    </Form>
                  </div>
                </Card>

                {(hotelPriceData?.isDepartureDetailsMandatory ||
                  hotelPriceData?.isPackageDetailsMandatory) && (
                    <div className="extra-pax-det">
                      <div className="contact-header">
                        <div className="contact-title">
                          <p className="booking-summary-div">Package Details</p>
                        </div>
                      </div>
                      <Card className="pax-details-card">
                        {hotelPriceData?.isDepartureDetailsMandatory && (
                          <div className="guest-input-wrapper">
                            <p className="arriv-d"> Arrival Details</p>


                            <Radio.Group
                              onChange={updateArrivalType}
                              value={arrivalType}
                              style={{ margin: "1%" }}
                            >
                              <Radio value={0} style={{ fontWeight: "bold" }}>
                                Arriving By Flight
                              </Radio>
                              <Radio value={1} style={{ fontWeight: "bold" }}>
                                {" "}
                                Arriving By Surface
                              </Radio>
                            </Radio.Group>
                            <Form
                              autoComplete="off"
                              layout="vertical"
                              name="arrivalform"
                              form={arrival_form}
                              scrollToFirstError={true}
                            >
                              <div className="guest-input-arr">
                                <Row gutter={16}>
                                  {arrivalType == 0 ? (
                                    <Col md={8} sm={12} xs={24}>
                                      <Form.Item
                                        label="Flight No"
                                        name="FlightNo"

                                      >
                                        <Input
                                          size="large"
                                          placeholder="Enter Your Flight Code"
                                          autoComplete="off"
                                        />
                                      </Form.Item>
                                    </Col>
                                  ) : (
                                    <Col md={8} sm={12} xs={24}>
                                      <Form.Item
                                        label="Transport Type/No"
                                        name="TransportTypeNo"

                                      >
                                        <Input
                                          size="large"
                                          placeholder="Transport Type / Vehicle No"
                                          autoComplete="off"
                                        />
                                      </Form.Item>
                                    </Col>
                                  )}

                                  <Col md={8} sm={12} xs={24}>
                                    <Form.Item
                                      label="Date:"
                                      name="DateTime"
                                      className="DateTime"
                                    >

                                      <DatePicker size="large" />
                                    </Form.Item>
                                  </Col>

                                  <Col md={8} sm={12} xs={24}>
                                    <Form.Item
                                      label=" Time:"
                                      name="Time"
                                      className="DateTime"
                                    >

                                      <TimePicker size="large" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </div>
                            </Form>
                          </div>
                        )}
                        {hotelPriceData?.isPackageDetailsMandatory && (
                          <div className="guest-input-wrapper mt-4">
                            <p className="dep-det"> Departure Details</p>

                            <Radio.Group
                              onChange={updateTranportType}
                              value={transportType}
                              style={{ margin: "1%" }}
                            >
                              <Radio value={0} style={{ fontWeight: "bold" }}>
                                {" "}
                                Departing By Flight
                              </Radio>
                              <Radio value={1} style={{ fontWeight: "bold" }}>
                                {" "}
                                Departing By Surface
                              </Radio>
                            </Radio.Group>
                            <Form
                              autoComplete="off"
                              layout="vertical"
                              name="departureform"
                              form={departure_form}
                              scrollToFirstError={true}
                            >
                              <div className="guest-input-dep">
                                <Row gutter={16}>
                                  {transportType == 0 ? (
                                    <Col md={8} sm={12} xs={24}>
                                      <Form.Item
                                        label="Flight No"
                                        name="FlightNo"

                                      >
                                        <Input
                                          size="large"
                                          placeholder="Enter Your Flight Code"
                                          autoComplete="off"
                                        />
                                      </Form.Item>
                                    </Col>
                                  ) : (
                                    <Col md={8} sm={12} xs={24}>
                                      <Form.Item
                                        label="Transport Type/No"
                                        name="TransportTypeNo"

                                      >
                                        <Input
                                          size="large"
                                          placeholder="Transport Type / Vehicle No"
                                          autoComplete="off"
                                        />
                                      </Form.Item>
                                    </Col>
                                  )}

                                  <Col md={8} sm={12} xs={24}>
                                    <Form.Item
                                      label="Date:"
                                      name="DateTime"
                                      className="DateTime"
                                    >

                                      <DatePicker size="large" />
                                    </Form.Item>
                                  </Col>

                                  <Col md={8} sm={12} xs={24}>
                                    <Form.Item
                                      label=" Time:"
                                      name="Time"
                                      className="DateTime"
                                    >

                                      <TimePicker size="large" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </div>
                            </Form>
                          </div>
                        )}
                      </Card>
                    </div>
                  )}
              </Col>

              <Col md={8} sm={24} xs={24}>

                <div className="hotel-price-wrapper">

                  {loading ? (
                    <Card bordered={false} className="hotel-card-wrapper">
                      <Skeleton active />
                    </Card>
                  ) : Object.keys(hotelPriceData).length > 0 ? (
                    <HotelFairBox
                      hotelDetailsObj={hotelPriceData}
                      hotelSearchData={hotelSearchData}
                      isPromoVisible={true}
                      location={location}
                      agentTax={agentTax} // Pass agent tax
                      isEditable={true}
                      onAgentTaxChange={handleAgentTaxChange}
                    />
                  ) : null}
                </div>

              </Col>
            </Row>
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <HotelBookPayCard
                  isLoading={loading}
                  pgIsLoading={false}
                  holdLoading={false}
                  purchaseType={false}
                  bookpaycardinfo={"hotel-checkout"}
                  redirectToPreview={redirectToPreview}
                  agent={false}
                />
              </Col>
            </Row>
          </div>
        </div>
      </div >
    </>
  );
};

export default HotelCheckout;
