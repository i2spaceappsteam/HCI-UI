import React, { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  message,
  Modal,
  Row,
  Spin,
  Image,
} from "antd";
import moment from "moment";
import queryString from "query-string";
import { useSelector } from "react-redux";
import { selectIsAgent } from "../../../store/slices/authSlice";
import ApiClient from "../../../Helpers/ApiClient";
import Apiclient1 from "../../../Helpers/Apiclient1";
import TicketHotel from "./TicketHotel";
import TicketSidebar from "../TicketSidebar";


import Base from "antd/lib/typography/Base";


const { Panel } = Collapse;
const dateFormat = "DD MMM YYYY";
const HotelTicketScreen = ({ mode }) => {
  const user = useSelector((state) => state.auth.user);
  const agent = useSelector(selectIsAgent);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalStatus, setModalStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const ticketSearchParams = queryString.parse(window.location.search);
  const BASE = import.meta.env.VITE_BASE_URL;
  //  const enums =  {
  //     Failed = 1,
  //     Confirmed = 2,
  //     Cancelled = 3,
  //     Pending = 4,
  //     Rejected = 5,
  //     Hold = 6,
  //     CancellationRequest = 7,
  //     CancellationPending = 8,
  //     CancellationInProgress = 9
  //   }

  const [ticketData, setTicketData] = useState({});
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [cmsFareRules, setCmsFareRules] = useState({});

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const normalizeTicketData = (raw) => {
    if (!raw) return {};
    const rootData = raw.data || raw;
    const booking = rootData.booking || rootData;
    const rooms = rootData.rooms || rootData.Rooms || [];
    const passengers = rootData.passengers || rootData.guests || [];
    const policies = rootData.policies || [];
    const nightlyRates = rootData.nightlyRates || [];

    const getTitleString = (t) => {
      if (t === 1 || t === "1" || t === "Mr" || t === "mr") return "Mr";
      if (t === 2 || t === "2" || t === "Mrs" || t === "mrs") return "Mrs";
      if (t === 3 || t === "3" || t === "Ms" || t === "ms") return "Ms";
      if (t === 4 || t === "4" || t === "Mstr" || t === "mstr") return "Mstr";
      return "Mr";
    };

    const roomMap = new Map();
    let currentRoomIndex = 1;

    const formattedGuests = passengers.map((p, idx) => {
      let roomSerial = 1;
      if (p.bookingRoomId) {
        if (!roomMap.has(p.bookingRoomId)) {
          roomMap.set(p.bookingRoomId, currentRoomIndex++);
        }
        roomSerial = roomMap.get(p.bookingRoomId);
      } else if (p.RoomSerialNo) {
        roomSerial = p.RoomSerialNo;
      }

      return {
        ID: p.bookingPaxId || p.ID || idx + 1,
        RoomSerialNo: roomSerial,
        FirstName: p.firstName || p.FirstName || "",
        LastName: p.lastName || p.LastName || "",
        Title: getTitleString(p.title),
        Age: p.age || p.Age || 0,
        GuestType: p.paxType === 1 || p.paxType === "Adult" || p.paxType === 0 ? "Adult" : "Child",
        IsLeadPax: p.isLeadPax || false,
      };
    });

    const formattedRooms = rooms.map((r) => ({
      roomName: r.roomName || r.roomTypeName || r.roomDescription || "Standard Room",
      adultCount: r.noOfAdults || 1,
      childCount: r.noOfChilds || 0,
      roomPrice: Number(r.roomPrice) || 0,
      taxAmount: Number(r.taxAmount) || 0,
      mealPlan: r.mealPlan || "Room Only",
    }));

    const roomBaseSum = rooms.length > 0
      ? rooms.reduce((sum, r) => sum + (Number(r.roomPrice || r.roomPublishPrice || r.price) || 0), 0)
      : 0;

    const totalBasePrice = Number(
      rootData.priceDetails?.totalBasePrice ??
      rootData.totalBasePrice ??
      booking.totalBasePrice ??
      booking.basePrice ??
      (roomBaseSum > 0 ? roomBaseSum : (booking.price || 0))
    );

    const roomTaxSum = rooms.length > 0
      ? rooms.reduce((sum, r) => sum + (Number(r.taxAmount || r.tax) || 0), 0)
      : 0;

    const bookingTotalTax = Number(
      rootData.priceDetails?.totalTax ??
      rootData.totalTax ??
      rootData.tax ??
      booking.totalTax ??
      booking.taxAmount ??
      booking.tax ??
      roomTaxSum ??
      0
    );

    const bookingTotal = Number(
      rootData.grandTotal ??
      rootData.totalAmount ??
      booking.totalAmount ??
      booking.grandTotal ??
      booking.price ??
      0
    );

    const resolvedTax = bookingTotalTax > 0
      ? bookingTotalTax
      : (bookingTotal > totalBasePrice && totalBasePrice > 0 ? bookingTotal - totalBasePrice : 0);

    const mainPolicy = policies?.[0]?.cancellationPolicy || booking.cancellationPolicy || "";
    const mainHotelPolicy = policies?.[0]?.hotelPolicy || booking.hotelPolicy || "";

    return {
      ...rootData,
      booking,
      rooms,
      passengers,
      policies,
      nightlyRates,

      HotelName: booking.hotelName || rootData.HotelName || "",
      CityName: booking.cityName || rootData.CityName || "",
      ConfirmationNumber: booking.referenceNumber || booking.pnr || rootData.ConfirmationNumber || "",
      SupplierConfirmationNo: booking.pnr || rootData.SupplierConfirmationNo || "",
      RefNumber: booking.referenceNumber || rootData.RefNumber || "",
      BookingDate: booking.bookingDate || rootData.BookingDate || "",
      CheckInDate: booking.checkInDate || rootData.CheckInDate || "",
      CheckOutDate: booking.checkOutDate || rootData.CheckOutDate || "",
      BookingStatus: booking.bookingStatus,
      Status: booking.bookingStatus,
      NoOfRooms: booking.noOfRooms || rooms.length || rootData.NoOfRooms || 1,
      HotelAddress: typeof booking.hotelAddress === "string"
        ? { address: booking.hotelAddress || booking.cityName || "" }
        : (rootData.HotelAddress || { address: booking.hotelAddress || "" }),
      StarRating: booking.starRating || rootData.StarRating || "5",
      phoneNo: booking.mobileNumber || rootData.phoneNo || "",
      email: booking.email || rootData.email || "",
      Currency: booking.currency || rootData.Currency || "INR",
      priceDetails: rootData.priceDetails || {
        totalBasePrice: totalBasePrice,
        totalTax: resolvedTax,
      },
      totalTax: resolvedTax,
      totalBasePrice: totalBasePrice,
      Rooms: formattedRooms.length > 0 ? formattedRooms : (rootData.Rooms || []),
      guests: formattedGuests.length > 0 ? formattedGuests : (rootData.guests || []),
      Inclusions: rootData.Inclusions || [
        {
          inclusions: rooms[0]?.mealPlan || "Room Only",
          boardBasis: { description: rooms[0]?.mealPlan || "Room Only" },
          combineRooms: rooms,
        },
      ],
      cancellationPolicy: mainPolicy,
      hotelPolicy: mainHotelPolicy,
      UserId: booking.userId || rootData.UserId || 1,
    };
  };

  const fetchTicketDetails = (ref) => {
    setLoadingTicket(true);
    ApiClient.get("HotelBooking/GetBookingDetailsByRef/" + ref)
      .then((res) => {
        const normalized = normalizeTicketData(res);
        if (
          normalized &&
          (normalized.RefNumber ||
            normalized.ConfirmationNumber ||
            normalized.booking?.referenceNumber ||
            normalized.HotelName ||
            normalized.booking)
        ) {
          setTicketData(normalized);
        } else {
          setTicketData({});
        }
        setLoadingTicket(false);
      })
      .catch((error) => {
        console.error("Error fetching ticket details:", error);
        setTicketData({});
        setLoadingTicket(false);
      });
  };

  const cancelTicket = () => {
    setModalVisible(true);
  };
  const getStatus = () => {
    setModalStatus(true);
  };
  const submitStatusForm = (val) => {
    setLoading(true);

    if (ticketData.traceId == "" && ticketData.RefNumber == "") {
      return;
    }
    let data = {
      traceId: ticketData.traceId,
      RefNumber: ticketData.RefNumber,
    };
    Apiclient1.post("hotels-v2/hotelCancelStatus/", data)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          if (res.data.bookingStatus == 3) {
            message.success(
              `${res.data.message}. Your total refund amount is Rs. ${res.data.refundAmount} `);
          }
          else {
            message.success(
              `Your Status is Still In Progress.`
              // `${res.data.message}. Your total refund amount is Rs. ${res.data.refundAmount} `,
              // 10
            );
          }
          getTicketDetails();
          setModalVisible(false);
          setModalStatus(false)
          // getCmsFareRules(3);
        } else if (res.status === 400) {
          if (res.data.length > 0) {
            res.data.map((err) => {
              if (err.errorCode === "6033") {
                message.error("Ticket has cancelled already.");
              }
            });
            setModalVisible(false);
          }
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });

  };

  const submitCancelForm = (val) => {
    setLoading(true);

    if (!ticketData?.booking) {
      setLoading(false);
      return;
    }

    let data = {
      traceId: ticketData.booking?.tokenId || ticketData.traceId || "",
      supplierParameter: ticketData.booking?.supplierParameter || ticketData.supplierParameter || "",
      confirmationNo: ticketData.booking?.pnr || ticketData.SupplierConfirmationNo || "",
      RefNumber: ticketData.RefNumber || ticketData.booking?.referenceNumber || "",
    };

    Apiclient1.post("Hotel/HotelCancel", data)
      .then((res) => {
        setLoading(false);
        // Apiclient1 returns the unwrapped JSON payload directly.
        if (res && (!res.errors || res.errors.length === 0)) {
          message.success(
            res.description || res.message || "This booking has been cancelled successfully, refund will be credited to your wallets if applicable."
          );
          getTicketDetails();
          setModalVisible(false);
        } else if (res?.errors?.length > 0) {
          res.errors.forEach((err) => {
            if (err.errorCode === "6033") {
              message.error("Ticket has been cancelled already.");
            } else {
              message.error(err.message || "Cancellation failed");
            }
          });
          setModalVisible(false);
        } else {
          message.error(res?.description || res?.message || "Cancellation failed");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
  };

  // const hotelCancelStatus = (data) => {
  //   Apiclient1.post("hotels-v2/hotelCancelStatus/", data)
  //     .then((res) => {
  //       setLoading(false);
  //       if (res.status === 200) {
  //         if (res.data.bookingStatus == 3) {
  //           message.success(
  //             `${res.data.message}. Your total refund amount is Rs. ${res.data.refundAmount} `);
  //         }
  //         else {
  //           message.success(
  //             `Your Status is Still In Progress.`
  //             // `${res.data.message}. Your total refund amount is Rs. ${res.data.refundAmount} `,
  //             // 10
  //           );
  //         }

  //         // message.success(
  //         //   `${res.data.message}. Your total refund amount is Rs. ${res.data.refundAmount} `,
  //         //   10
  //         // );
  //         getTicketDetails();
  //         setModalVisible(false);
  //         // getCmsFareRules(3);
  //       } else if (res.status === 400) {
  //         if (res.data.length > 0) {
  //           res.data.map((err) => {
  //             if (err.errorCode === "6033") {
  //               //message.error("Ticket has cancelled already.");
  //             }
  //           });
  //           setModalVisible(false);
  //         }
  //       }
  //     })
  //     .catch((error) => {
  //       setLoading(false);
  //       console.error(error);
  //     });
  // };

  const getTicketDetails = () => {
    const refVal =
      ticketSearchParams.ref ||
      ticketSearchParams.refNumber ||
      ticketSearchParams.referenceNumber ||
      ticketSearchParams.ReferenceNumber ||
      ticketSearchParams.RefNumber;
    if (refVal) {
      fetchTicketDetails(refVal);
    } else {
      setLoadingTicket(false);
      setTicketData({});
    }
  };
  useEffect(() => {
    getTicketDetails();
  }, [
    ticketSearchParams.ref,
    ticketSearchParams.refNumber,
    ticketSearchParams.referenceNumber,
    ticketSearchParams.ReferenceNumber,
    ticketSearchParams.RefNumber,
  ]);

  return (
    <>
      {user?.UserID === 1 ? "" :
        <div style={{ marginTop: "-3px" }}>

        </div>
      }
      <div className="flight-ticket-collapse" >


        <Card>
          <div className="fligh-ticket-container">
            {loadingTicket ? (
              <div style={{ textAlign: "center" }} className="flight-ticket">
                <Spin indicator={antIcon} description="Loading..." />
              </div>
            ) : Object.keys(ticketData).length > 0 &&
              (ticketData.RefNumber ||
                ticketData.ConfirmationNumber ||
                ticketData.HotelName ||
                ticketData.booking ||
                ticketData.BookingStatus !== undefined) ? (
              <div className="flight-ticket">
                <Row gutter={[32, 16]} className="ticket-row">
                  <Col md={18} className="ticket-coloum">

                    <TicketHotel
                      ticketData={ticketData}
                      cmsFareRules={cmsFareRules}
                    />
                  </Col>

                  <Col xs={24} md={6} className="tic-info-flight">
                    <div className="web-tic-info">
                      <TicketSidebar
                        ticketData={ticketData}
                        ticketSearchParams={ticketSearchParams}
                        type="Hotel"
                        onCancelTicket={cancelTicket}
                        getTicketDetails={getTicketDetails}
                        cmsFareRules={cmsFareRules}
                        onGetStatus={getStatus}
                      />
                    </div>

                    <div className="mobile-tic-info">
                      <Collapse
                        accordion
                        items={[
                          {
                            key: "1",
                            label: "Manage Tickets",
                            children: (
                              <TicketSidebar
                                ticketData={ticketData}
                                ticketSearchParams={ticketSearchParams}
                                type="Hotel"
                                onCancelTicket={cancelTicket}
                                getTicketDetails={getTicketDetails}
                                cmsFareRules={cmsFareRules}
                                onGetStatus={getStatus}
                              />
                            ),
                          },
                        ]}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            ) : (
              <p className="no-tickt">No Ticket Found</p>
            )}
          </div>
        </Card>

        <Modal
          title="Cancel Ticket"
          className="promo-modal-header"
          open={modalVisible}
          onOk={(e) => setModalVisible(false)}
          onCancel={(e) => setModalVisible(false)}
          footer={[
            <div>
              <Button
                key="add"
                type="primary"
                onClick={submitCancelForm}
                loading={loading}
              >
                Cancel Ticket
              </Button>
            </div>,
          ]}
          width={"600px"}
        >
          <>

            {Object.keys(ticketData).length > 0 ? (
              <div className="wrapper">
                <p>
                  <b>Reference No</b> : {ticketData.RefNumber}
                </p>
                <p>
                  <b>PNR :</b> : {ticketData.ConfirmationNumber}
                </p>
                <p>
                  <b>Hotel Name :</b> : {ticketData.HotelName}
                </p>

                <p>
                  <b>Check In Date:</b> :{" "}
                  {moment(ticketData.CheckInDate).format(dateFormat)}
                </p>
                <p>
                  <b> Check Out Date:</b> :{" "}
                  {moment(ticketData.CheckOutDate).format(dateFormat)}
                </p>
              </div>
            ) : null}
          </>
        </Modal>
        <Modal
          title="Cancel Ticket"
          className="promo-modal-header"
          open={modalStatus}
          onOk={(e) => setModalStatus(false)}
          onCancel={(e) => setModalStatus(false)}
          footer={[
            <div>
              <Button
                key="add"
                type="primary"
                onClick={submitStatusForm}
                loading={loading}
              >
                Get Status
              </Button>
            </div>,
          ]}
          width={"600px"}
        >
          {Object.keys(ticketData).length > 0 ? (
            <div className="wrapper">
              <p>
                <b>Reference No</b> : {ticketData.RefNumber}
              </p>
              <p>
                <b>PNR :</b> : {ticketData.ConfirmationNumber}
              </p>
              <p>
                <b>Hotel Name :</b> : {ticketData.HotelName}
              </p>

              <p>
                <b>Check In Date:</b> :{" "}
                {moment(ticketData.CheckInDate).format(dateFormat)}
              </p>
              <p>
                <b> Check Out Date:</b> :{" "}
                {moment(ticketData.CheckOutDate).format(dateFormat)}
              </p>
            </div>
          ) : null}
        </Modal>
      </div>
    </>
  );
};
export default HotelTicketScreen;
