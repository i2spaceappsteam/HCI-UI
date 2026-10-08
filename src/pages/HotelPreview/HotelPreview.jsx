import React, { useContext, useEffect, useState, useReducer } from "react";
import { useNavigate, Link } from "react-router";
import { Card, Col, message, Row, Modal, Statistic } from "antd";
import {
  ArrowLeftOutlined,

} from "@ant-design/icons";
import GlobalStatesContext from "../../Providers/GlobalStatesContext";
import { selectIsAgent } from "../../store/slices/authSlice";
import { useSelector } from "react-redux";
import HotelDetailsBox from "../../components/HotelDetailsBox/HotelDetailsBox";

import ApiClient from "../../Helpers/ApiClient";
import Apiclient1 from "../../Helpers/Apiclient1";
import HotelBookPayCard from "../HotelCheckout/HotelBookPayCard";

import HotelFairBox, {
  getHotelGrandTotal,
} from "../HotelCheckout/HotelFairBox";
import "../HotelPreview/HotelPreview.scss";
import HotelPassengers from "./HotelPassengers/HotelPassengers";
import moment from "moment";



import queryString from "query-string";

const PGTYPE = "PGTYPE";
const PGDISPLAY = "PGDISPLAY";
const PGDATA = "PGDATA";

const initialState = { pgDisplay: false, pgData: {}, pgType: -1 };
// const timeoutimg = process.env.PUBLIC_URL + "images/timeout.jpg";
function reducer(state, action) {
  switch (action.type) {
    case PGTYPE:
      return { ...state, pgType: action.payload };
    case PGDISPLAY:
      return { ...state, pgDisplay: action.payload };
    case PGDATA:
      return { ...state, pgData: action.payload };
    default:
      return state;
  }
}
const { Countdown } = Statistic;
const HotelPreview = () => {
  const user = useSelector((state) => state.auth.user);
  const agent = useSelector(selectIsAgent);
  const hotelCheckOutData = useSelector(state => state.hotel.hotelCheckOutData);
  const sessiontimeout = useSelector(state => state.hotel.sessiontimeout);
  const status = useSelector(state => state.hotel.status);

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [loadSpin, setLoadSpin] = useState(false)
  const [agentTax, setAgentTax] = useState(0);
  const [pgDetails, dispatchPgDetails] = useReducer(reducer, initialState);
  const [openCashfreeNewVersionCheckout, setOpenCashfreeNewVersionCheckout] = useState(false);
  const [openCCavanueCheckout, setOpenCCavanueCheckout] = useState(false)
  const [pgData, setPgData] = useState({});

  const [pgIsLoading, setPgIsLoading] = useState({
    direct: false,
    hold: false,
  });
  const {
    state: {
      otherData: { promoData, ConvFee, selectedInsuranceData, redeemAmount },
    },
  } = useContext(GlobalStatesContext);
  let history = useNavigate();

  console.log(hotelCheckOutData)
  useEffect(() => {
    if (hotelCheckOutData && hotelCheckOutData.agentTax !== undefined) {
      setAgentTax(hotelCheckOutData.agentTax);
    }
  }, [hotelCheckOutData]);
  useEffect(() => {
    if (Object.keys(hotelCheckOutData).length <= 0) {
      history(-1);
    }
  }, [hotelCheckOutData]);

  const [currencies, setCurrencies] = useState({ INR: 1 });

  // useEffect(() => {
  //   ApiClient.get("admin/currencyConversionLatest")
  //     .then((resp) => {

  //       if (resp?.status == 200) {
  //         setCurrencies(resp.data);
  //       } else {

  //       }
  //     })
  //     .catch((e) => {

  //     });
  // }, []);


  const navigateToTicket = ({ pgType = null, blockType = 1 }) => {
    let guestsList = hotelCheckOutData.guests.map((pax) => {
      return pax.paxInfoList.map((item) => {
        return item;
      });
    });

    let lastCancellationDate = "";
    let lastVoucherDate = "";
    let cancellationDates = [];
    let voucherDate = [];

    if (hotelCheckOutData?.hotelPriceData?.rooms?.length > 0) {
      cancellationDates = hotelCheckOutData?.hotelPriceData?.rooms?.map(
        (roomDates) => {
          return roomDates.ratePlans[0]?.lastCancellationDate;
        }
      );

      voucherDate = hotelCheckOutData?.hotelPriceData?.rooms?.map(
        (roomDates) => {
          return roomDates.ratePlans[0]?.lastVoucherDate;
        }
      );
    }

    if (cancellationDates?.length > 1) {
      lastCancellationDate = cancellationDates.reduce((prev, cur, i) => {
        if (prev && cur) {
          return moment(prev).isSameOrBefore(cur) ? prev : cur;
        } else if (prev) {
          return prev;
        } else {
          return cur;
        }
      });
    } else if (cancellationDates?.length === 1) {
      lastCancellationDate = cancellationDates[0] ? cancellationDates[0] : "";
    }

    if (voucherDate?.length > 1) {
      lastVoucherDate = voucherDate.reduce((prev, cur) => {
        if (prev && cur) {
          return moment(prev).isSameOrBefore(cur) ? prev : cur;
        } else if (prev) {
          return prev;
        } else return cur;
      });
    } else if (voucherDate?.length === 1) {
      lastVoucherDate = voucherDate[0] ? voucherDate[0] : "";
    }

    let allAmount = getHotelGrandTotal(
      hotelCheckOutData.hotelPriceData,
      hotelCheckOutData.hotelSearchData,
      ConvFee,
      promoData,
      selectedInsuranceData,
      redeemAmount,
      agentTax
    );
    console.log(allAmount)
    let guestsDetails = [];

    if (guestsList.length > 0) {
      guestsList.forEach((item) => {
        if (item && item?.length > 0) {
          item.forEach((guestInfo) => {
            guestsDetails.push(guestInfo);
          });
        }
      });
    }

    let commissionAmount = 0;
    let agentMarkupAmount = 0;
    let adminCommissionAmount = 0;
    if (user?.Role?.RoleId === 5) {
      commissionAmount = Number(allAmount.totalCommission);
      agentMarkupAmount = Number(allAmount.agentMarkup);
      adminCommissionAmount = Number(allAmount.adminCommission);
    }
    const supplierParamVal =
      hotelCheckOutData?.hotelSearchData?.supplierParameter ||
      hotelCheckOutData?.hotelSearchData?.supplierParamter ||
      hotelCheckOutData?.hotelPriceData?.supplierParameter ||
      hotelCheckOutData?.hotelPriceData?.supplierParamter ||
      hotelCheckOutData?.supplierParameter ||
      hotelCheckOutData?.supplierParamter ||
      "";

    let data = {
      traceId: hotelCheckOutData?.hotelPriceData?.traceId || "",
      checkInDate: hotelCheckOutData?.hotelSearchData?.checkInDate || "",
      checkOutDate: hotelCheckOutData?.hotelSearchData?.checkOutDate || "",
      // supplierParameter: supplierParamVal,
      supplierParamter: supplierParamVal,
      consolidationWaitTime: 0,
      repriceId: hotelCheckOutData?.hotelPriceData?.repriceId || "",
      currency: user?.Currency || "INR",
      hotelCode: hotelCheckOutData?.hotelPriceData?.hotelCode || "",
      nationality: hotelCheckOutData?.addressInfo?.countryCode || "IN",
      roomGuests: hotelCheckOutData?.guests?.map((room, idx) => ({
        roomNo: idx + 1,
        guests: room.paxInfoList.map((pax) => ({
          leadGuest: pax.leadGuest || false,
          guestType: pax.guestType === "Adult" ? "adult" : "child",
          guestInRoom: pax.guestInRoom || idx + 1,
          title: pax.title || "mr",
          firstName: pax.firstName || "",
          lastName: pax.lastName || "",
          age: Number(pax.age) || 0,
          passportNo: pax.passportNo || "",
          passportDOI: pax.passportDOI || "",
          passportDOE: pax.passportDOE || "",
          pan: pax.pan || ""
        }))
      })) || [],
      addressInfo: {
        addressLine1: hotelCheckOutData?.addressInfo?.addressLine1 || "",
        addressLine2: hotelCheckOutData?.addressInfo?.addressLine2 || "",
        cellCountryCode: hotelCheckOutData?.addressInfo?.cellCountryCode || "",
        countryCode: hotelCheckOutData?.addressInfo?.countryCode || "",
        areaCode: hotelCheckOutData?.addressInfo?.areaCode || "",
        phoneNo: hotelCheckOutData?.addressInfo?.phoneNo || "",
        email: hotelCheckOutData?.addressInfo?.email || "",
        city: hotelCheckOutData?.addressInfo?.city || "",
        state: hotelCheckOutData?.addressInfo?.state || "",
        country: hotelCheckOutData?.addressInfo?.country || "",
        zipCode: hotelCheckOutData?.addressInfo?.zipCode || ""
      },
      paymentModeType: "deposit",
      purchaseType: hotelCheckOutData?.hotelPriceData?.purchaseType || "instant"
    };

    let paymentPaxInfo = {
      CustomerName: guestsList[0][0].firstName,
      CustomerEmail: hotelCheckOutData.addressInfo.email,
      CustomerPhone: hotelCheckOutData.addressInfo.phoneNo,
    };


    setLoadingSpin(true);
    setLoadSpin(true)
    // Note: Use blockType instead of assuming it's always HotelBook
    const endpoint = blockType === 2 ? "Hotel/HotelHold" : "Hotel/HotelBook";

    Apiclient1.post(endpoint, data)
      .then((res) => {
    setPgIsLoading({
      direct: false,
      hold: false,
    });
    setLoadingSpin(false);
    setLoadSpin(false)

    const dataObj = res?.data || res;
    const hasErrors = dataObj?.errors?.length > 0 && dataObj.errors.some(e => e.errorCode || e.message);
    const refNum =
      dataObj?.referenceNumber ||
      dataObj?.RefNumber ||
      dataObj?.refNumber ||
      dataObj?.referenceNo ||
      dataObj?.BookingRefNo ||
      "";

    const isSuccess =
      !hasErrors &&
      (res?.status === 200 ||
        dataObj?.bookingStatus === "confirmed" ||
        dataObj?.bookingStatus === "Confirmed" ||
        dataObj?.bookingStatus === 2 ||
        !!refNum);

    if (isSuccess) {
      if (dataObj?.pgType === 1) {
        CashFreeNewVersionCheckoutData(dataObj);
      } else if (dataObj?.pgType === 3) {
        window.location.href = dataObj?.payment_link?.url;
      } else if (refNum) {
        history(`/admin/hotel/ticket?ref=${refNum}`);
      } else {
        history(`/admin/hotel/ticket`);
      }
    } else {
      if (res?.message) message.error(res.message, 3);
      else if (dataObj?.errors?.[0]?.errorMessage) message.error(dataObj.errors[0].errorMessage, 3);
      else if (dataObj?.errors?.[0]?.errorDetail) message.error(dataObj.errors[0].errorDetail, 3);
      else message.error("Booking Failed", 3);
    }
  })
  .catch((err) => {
    setPgIsLoading({
      direct: false,
      hold: false,
    });
    setLoadingSpin(false);
    setLoadSpin(false)
  });
  };

const ccavanueCheckoutData = (resp) => {
  // console.log("comecc");
  setPgData(resp)
  setOpenCCavanueCheckout(true)
}

const CashFreeNewVersionCheckoutData = (resp) => {
  setPgData(resp)
  setOpenCashfreeNewVersionCheckout(true)
}
const handleVerifyOtp = (otpValue) => {
  ApiClient.post("admin/verifyserviceOtp", {
    Mobile: hotelCheckOutData?.addressInfo?.phoneNo,
    DialingCode: hotelCheckOutData?.addressInfo?.areaCode,
    Otp: Number(otpValue),
  })
    .then((res) => {
      if (res?.status === 200) {
        setVerifyModalVisible(false);
        navigateToTicket({ pgType: pgDetails.pgType });
      } else {
        if (res?.message) message.error(res.message, 3);
        else message.error("Booking Failed", 3);
      }
    })
    .catch();
};

const handleSendOTP = () => {
  ApiClient.post("admin/sendserviceOtp", {
    Mobile: hotelCheckOutData?.addressInfo?.phoneNo,
    DialingCode: hotelCheckOutData?.addressInfo?.areaCode,
  })
    .then((res) => {
      if (res?.status === 200) {
        setVerifyModalVisible(true);
      } else {
        if (res?.message) message.error(res.message, 3);
        else message.error("Booking Failed", 3);
      }
    })
    .catch();
};

const ValidateBookingLimit = () => {
  let { totalAmount } = getHotelGrandTotal(
    hotelCheckOutData.hotelPriceData,
    hotelCheckOutData.hotelSearchData,
    ConvFee,
    promoData,
    selectedInsuranceData,
    redeemAmount
  );
  ApiClient.post("admin/validatebookinglimit", {
    serviceType: 2,
    roleType: user?.Role?.RoleId ?? 4,
    bookingAmount: totalAmount ? totalAmount : 0,
  })
    .then((res) => {
      if (res?.status === 200 && res?.isValid) {
        handleSendOTP();
      } else {
        if (res?.message) message.error(res.message, 3);
        else message.error("Booking Failed", 3);
      }
    })
    .catch();
};

const blockApiReq = (pgType) => {
  dispatchPgDetails({ type: PGTYPE, payload: pgType });
  if (pgType) {

    navigateToTicket({ pgType: pgType });

  }
};

const processPayGateway = (blockType) => {
  setPgIsLoading({
    direct: blockType === 1 ? true : false,
    hold: blockType === 2 ? true : false,
  });
  navigateToTicket({ blockType: blockType, pgType: 1 });
};

const timeout = () => {
  return (

    <div>

      <div className="timeout-popup-main">
        <div className="timeout-popup-main1">
          {/* <img className="timeout-img" src={timeoutimg} alt="time" /> */}
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

  //const query = queryString.stringify(searchhotelobj);
  let query = queryString.stringify(JSON.parse(localStorage.getItem('HotelSearchBar')));

  Modal.warning({
    icon: <></>,
    //title: "",
    content: timeout(),
    onOk() {
      history("/hotels/listing?" + query);

    },
  });
};

return (
  <>

    <div className="hotel-preview-container">
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
      <div className="form-body ">
        <div className="form-body-container">

          {Object.keys(hotelCheckOutData).length > 0 ? (
            <Row gutter={[16, 16]}>
              <Col md={16} sm={24} xs={24}>

                <Card bordered={false} className="hotel-card-wrapper">
                  <HotelDetailsBox
                    hotelDetailsObj={hotelCheckOutData.hotelPriceData}
                    hotelSearchData={hotelCheckOutData.hotelSearchData}
                    Ids={"hotel-review"}
                  />
                </Card>
                <div className="contact-header">
                  <div className="contact-title">
                    <p className="booking-summary-div" style={{ marginTop: 10 }}>Guests Details</p>
                  </div>
                </div>

                <Card bordered={false} className="hotel-card-wrapper" style={{ padding: 10 }}>
                  <HotelPassengers passengersInfo={hotelCheckOutData.guests} />
                </Card>
              </Col>
              <Col md={8} sm={24} xs={24}>

                <div className="hotel-price-wrapper">
                  <div style={{ background: "#f9f9f9", marginBottom: 0 }}>

                  </div>
                  <HotelFairBox
                    hotelDetailsObj={hotelCheckOutData.hotelPriceData}
                    hotelSearchData={hotelCheckOutData.hotelSearchData}
                    isPromoVisible={false}
                    agentTax={agentTax} // Pass agent tax
                    isEditable={false}
                  />
                </div>
                {(() => {
                  const roomsList = hotelCheckOutData?.hotelPriceData?.hotels?.rooms || hotelCheckOutData?.hotelPriceData?.rooms || [];
                  const isHoldAllowed = roomsList.some(r => r.ratePlans?.some(rp => rp.isHold)) || false;
                  return (
                    <HotelBookPayCard
                      isHoldAllowed={isHoldAllowed}
                  isLoading={false}
                  pgIsLoading={pgIsLoading.direct}
                  holdLoading={pgIsLoading.hold}
                  purchaseType={
                    hotelCheckOutData?.hotelPriceData?.purchaseType
                  }
                  bookpaycardinfo={"hotel-review"}

                  agent={agent}
                  blockApiReq={blockApiReq}
                  processPayGateway={processPayGateway}
                  loadingSpin={loadingSpin}
                  loadSpin={loadSpin}
                />
                  );
                })()}

              </Col>
            </Row>
          ) : (
            "No Hotel Selected "
          )}
        </div>
      </div>




    </div>
  </>
);
};

export default HotelPreview;
