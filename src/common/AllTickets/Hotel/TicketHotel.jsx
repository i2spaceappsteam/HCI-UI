import React, { useState } from "react";
import "../NewTicket.scss";
import { Col, Row, Layout, Card, Tag, Divider } from "antd";
import dayjs from "dayjs";
import { getHotelPrice, getStatus } from "./hotelhelper";
import {
  SafetyCertificateOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  StarFilled,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import parse from "html-react-parser";

const dateFormat = "DD MMM, YYYY";

const TicketHotel = ({ ticketData = {}, cmsFareRules }) => {
  let {
    baseAmount,
    taxAmount,
    convienenceFee,
    discount,
    grandTotal,
    insuranceTotal,
    noOfNights,
  } = getHotelPrice(ticketData);

  const [curr] = useState(ticketData?.Currency || "INR");
  const [value] = useState(ticketData?.CurrencyRatio || "1");

  const guests = ticketData?.guests || [];
  const groupedGuests = guests.reduce((acc, guest) => {
    const roomKey = guest?.RoomSerialNo || 1;
    if (!acc[roomKey]) {
      acc[roomKey] = [];
    }
    acc[roomKey].push(guest);
    return acc;
  }, {});

  const hotelName = ticketData?.HotelName || ticketData?.booking?.hotelName || "Hotel Voucher";
  const cityName = ticketData?.CityName || ticketData?.booking?.cityName || "";
  const address =
    ticketData?.HotelAddress?.address ||
    (typeof ticketData?.HotelAddress === "string" ? ticketData.HotelAddress : "") ||
    ticketData?.booking?.hotelAddress ||
    "Address provided at check-in";

  const refNumber =
    ticketData?.RefNumber ||
    ticketData?.ConfirmationNumber ||
    ticketData?.booking?.referenceNumber ||
    "N/A";

  const pnr = ticketData?.SupplierConfirmationNo || ticketData?.booking?.pnr || "";
  const bookingDate = ticketData?.BookingDate || ticketData?.booking?.bookingDate;
  const checkInDate = ticketData?.CheckInDate || ticketData?.booking?.checkInDate;
  const checkOutDate = ticketData?.CheckOutDate || ticketData?.booking?.checkOutDate;
  const starRating = Number(ticketData?.StarRating || ticketData?.booking?.starRating || 5);

  const isConfirmed =
    ticketData?.BookingStatus === 2 ||
    ticketData?.booking?.bookingStatus === 2 ||
    ticketData?.Status === "Confirmed";

  return (
    <div className="premium-ticket-wrapper" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* 🌟 LUXURY HEADER VOUCHER BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
          borderRadius: "16px 16px 0 0",
          padding: "24px 28px",
          color: "#ffffff",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.4)",
          position: "relative",
          overflow: "hidden",
          borderBottom: "4px solid #f59e0b",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "120px",
            height: "120px",
            background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(255,255,255,0) 70%)",
            borderRadius: "50%",
          }}
        />

        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col md={15} xs={24}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <Tag
                color="gold"
                style={{
                  fontWeight: "700",
                  letterSpacing: "1px",
                  fontSize: "11px",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  textTransform: "uppercase",
                }}
              >
                OFFICIAL E-VOUCHER
              </Tag>
              <div style={{ display: "flex", gap: "2px" }}>
                {[...Array(Math.min(Math.max(starRating, 1), 5))].map((_, i) => (
                  <StarFilled key={i} style={{ color: "#f59e0b", fontSize: "14px" }} />
                ))}
              </div>
            </div>

            <h1
              style={{
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: "800",
                margin: 0,
                lineHeight: "1.2",
              }}
            >
              {hotelName}
            </h1>

            {cityName && (
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <EnvironmentOutlined style={{ color: "#38bdf8" }} />
                {cityName}, India
              </p>
            )}
          </Col>

          <Col md={9} xs={24} style={{ textAlign: "right" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <div
                style={{
                  background: isConfirmed ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                  border: `1px solid ${isConfirmed ? "#10b981" : "#f59e0b"}`,
                  padding: "6px 14px",
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: isConfirmed ? "#34d399" : "#fbbf24",
                  fontWeight: "700",
                  fontSize: "13px",
                }}
              >
                <CheckCircleOutlined />
                {getStatus(ticketData?.BookingStatus ?? ticketData?.booking?.bookingStatus ?? 2)}
              </div>

              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                Reference No: <strong style={{ color: "#ffffff" }}>{refNumber}</strong>
              </div>

              {bookingDate && (
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Booked on: <span style={{ color: "#e2e8f0" }}>{dayjs(bookingDate).format("DD MMM YYYY")}</span>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* 📅 CHECK-IN & CHECK-OUT TIMELINE BAR */}
      <div
        style={{
          background: "#ffffff",
          padding: "20px 24px",
          borderLeft: "1px solid #e2e8f0",
          borderRight: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col md={9} xs={24}>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                <CalendarOutlined />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                  CHECK-IN
                </span>
                <p style={{ margin: "2px 0 0 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                  {checkInDate ? dayjs(checkInDate).format(dateFormat) : "N/A"}
                </p>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>From 14:00 hrs</span>
              </div>
            </div>
          </Col>

          <Col md={6} xs={24} style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tag
                color="blue"
                style={{
                  borderRadius: "20px",
                  padding: "4px 16px",
                  fontWeight: "700",
                  fontSize: "13px",
                  border: "1px solid #bfdbfe",
                }}
              >
                {noOfNights || 1} {noOfNights === 1 ? "NIGHT" : "NIGHTS"}
              </Tag>
              <div
                style={{
                  width: "100%",
                  height: "2px",
                  background: "dashed #cbd5e1",
                  margin: "8px 0",
                }}
              />
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>
                {ticketData?.NoOfRooms || ticketData?.booking?.noOfRooms || 1} Room(s)
              </span>
            </div>
          </Col>

          <Col md={9} xs={24}>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  background: "#fef3c7",
                  color: "#d97706",
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                <ClockCircleOutlined />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                  CHECK-OUT
                </span>
                <p style={{ margin: "2px 0 0 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                  {checkOutDate ? dayjs(checkOutDate).format(dateFormat) : "N/A"}
                </p>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Until 12:00 hrs</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 🏢 HOTEL & ROOM SPECIFICATIONS CARD */}
      <div
        style={{
          background: "#ffffff",
          padding: "24px",
          borderLeft: "1px solid #e2e8f0",
          borderRight: "1px solid #e2e8f0",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <Card
          style={{
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <HomeOutlined style={{ color: "#2563eb", fontSize: "18px" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
              Hotel & Room Information
            </h3>
          </div>

          <Row gutter={[20, 16]}>
            <Col md={12} xs={24}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "block" }}>
                HOTEL ADDRESS
              </span>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b", fontWeight: "500" }}>
                {address}
              </p>
            </Col>

            <Col md={6} xs={12}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "block" }}>
                CONFIRMATION NO (PNR)
              </span>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#0f172a", fontWeight: "700" }}>
                {pnr || refNumber}
              </p>
            </Col>

            <Col md={6} xs={12}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "block" }}>
                TOTAL ROOMS
              </span>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#0f172a", fontWeight: "700" }}>
                {ticketData?.NoOfRooms || ticketData?.booking?.noOfRooms || 1} Room(s)
              </p>
            </Col>

            {(ticketData?.Rooms || []).map((room, idx) => (
              <Col md={12} xs={24} key={idx}>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>
                    ROOM {idx + 1}
                  </span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                    {room.roomName || room.roomTypeName || "Standard Room"}
                  </p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    <Tag color="cyan" style={{ borderRadius: "4px", fontSize: "11px" }}>
                      {room.adultCount || 1} Adult(s) {room.childCount > 0 ? `, ${room.childCount} Child(ren)` : ""}
                    </Tag>
                  </div>
                </div>
              </Col>
            ))}

            <Col md={12} xs={24}>
              <div
                style={{
                  background: "#f0fdf4",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <span style={{ fontSize: "11px", color: "#166534", fontWeight: "700" }}>INCLUSIONS & MEAL PLAN</span>
                <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "700", color: "#15803d" }}>
                  {ticketData?.Inclusions?.[0]?.inclusions ||
                    ticketData?.Inclusions?.[0]?.boardBasis?.description ||
                    "Room Only"}
                </p>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 👥 GUEST & PASSENGER BREAKDOWN */}
      <div
        style={{
          background: "#ffffff",
          padding: "0 24px 24px 24px",
          borderLeft: "1px solid #e2e8f0",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        <Card
          style={{
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <UserOutlined style={{ color: "#2563eb", fontSize: "18px" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
              Passenger & Contact Details
            </h3>
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
            <Col md={8} xs={24}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>LEAD GUEST NAME</span>
              <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                {guests.length > 0 ? `${guests[0]?.Title || "Mr"} ${guests[0]?.FirstName} ${guests[0]?.LastName}` : "Lead Guest"}
              </p>
            </Col>
            <Col md={8} xs={24}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                <PhoneOutlined /> MOBILE NUMBER
              </span>
              <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                {ticketData?.phoneNo || ticketData?.booking?.mobileNumber || "N/A"}
              </p>
            </Col>
            <Col md={8} xs={24}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                <MailOutlined /> EMAIL ADDRESS
              </span>
              <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                {ticketData?.email || ticketData?.booking?.email || "N/A"}
              </p>
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0" }} />

          {Object.entries(groupedGuests).map(([roomSerial, roomGuestsList]) => (
            <div key={roomSerial} style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "8px" }}>
                ROOM {roomSerial} GUESTS
              </span>
              <Row gutter={[12, 12]}>
                {roomGuestsList.map((g, idx) => (
                  <Col md={12} xs={24} key={idx}>
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                          {g.Title || "Mr"} {g.FirstName} {g.LastName}
                        </strong>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          Type: {g.GuestType || "Adult"} {g.Age ? `• Age: ${g.Age}` : ""}
                        </div>
                      </div>
                      {g.IsLeadPax && <Tag color="blue">Lead</Tag>}
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Card>
      </div>

      {/* 💰 FARE BREAKDOWN CARD */}
      <div
        style={{
          background: "#ffffff",
          padding: "0 24px 24px 24px",
          borderLeft: "1px solid #e2e8f0",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        <Card
          style={{
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <FileTextOutlined style={{ color: "#2563eb", fontSize: "18px" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
              Payment Summary
            </h3>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
            <Row justify="space-between" style={{ padding: "6px 0", borderBottom: "1px dashed #e2e8f0" }}>
              <span style={{ color: "#475569", fontSize: "13px" }}>Base Fare</span>
              <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                {curr} {parseFloat((Number(baseAmount) / Number(value)).toFixed(2))}
              </strong>
            </Row>

            <Row justify="space-between" style={{ padding: "6px 0", borderBottom: "1px dashed #e2e8f0" }}>
              <span style={{ color: "#475569", fontSize: "13px" }}>Taxes & Service Charges</span>
              <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                {curr} {parseFloat((Number(taxAmount) / Number(value)).toFixed(2))}
              </strong>
            </Row>

            {convienenceFee > 0 && (
              <Row justify="space-between" style={{ padding: "6px 0", borderBottom: "1px dashed #e2e8f0" }}>
                <span style={{ color: "#475569", fontSize: "13px" }}>Convenience Fee</span>
                <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                  {curr} {parseFloat((Number(convienenceFee) / Number(value)).toFixed(2))}
                </strong>
              </Row>
            )}

            {discount > 0 && (
              <Row justify="space-between" style={{ padding: "6px 0", borderBottom: "1px dashed #e2e8f0" }}>
                <span style={{ color: "#16a34a", fontSize: "13px" }}>Discount Applied</span>
                <strong style={{ color: "#16a34a", fontSize: "13px" }}>
                  - {curr} {parseFloat((Number(discount) / Number(value)).toFixed(2))}
                </strong>
              </Row>
            )}

            <Row justify="space-between" style={{ padding: "12px 0 4px 0" }} align="middle">
              <span style={{ color: "#0f172a", fontSize: "16px", fontWeight: "800" }}>Total Amount Paid</span>
              <span style={{ color: "#2563eb", fontSize: "20px", fontWeight: "800" }}>
                {curr} {parseFloat((Number(grandTotal) / Number(value)).toFixed(2))}
              </span>
            </Row>
          </div>
        </Card>
      </div>

      {/* ⚠️ POLICIES & TERMS FOOTER */}
      <div
        style={{
          background: "#f8fafc",
          borderRadius: "0 0 16px 16px",
          padding: "24px",
          border: "1px solid #e2e8f0",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <InfoCircleOutlined style={{ color: "#2563eb", fontSize: "16px" }} />
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
            Important Check-in & Cancellation Rules
          </h4>
        </div>

        <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
          {cmsFareRules?.cancelPolicyDescription ? (
            <div>{parse(cmsFareRules.cancelPolicyDescription)}</div>
          ) : ticketData?.cancellationPolicy ? (
            <p style={{ margin: "0 0 8px 0", color: "#1e293b", fontWeight: "600" }}>
              Cancellation Policy: {ticketData.cancellationPolicy}
            </p>
          ) : (
            <p style={{ margin: "0 0 8px 0" }}>
              Standard cancellation and check-in policies apply as per hotel terms.
            </p>
          )}

          <ul style={{ paddingLeft: "16px", margin: "8px 0 0 0" }}>
            <li>Please present a valid government-issued photo ID at the time of check-in.</li>
            <li>Standard check-in time is 14:00 hrs and check-out time is 12:00 hrs.</li>
            <li>Incidentals, mini-bar, and extra charges are to be settled directly with the hotel upon check-out.</li>
            <li><strong>Important:</strong> Cancellation requests on or close to the check-in date fall under the non-refundable window and are subject to hotel/supplier approval. Refunds are not guaranteed upon cancellation and cancellation charges may apply as per the booking policy.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TicketHotel;
