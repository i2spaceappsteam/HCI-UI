import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import moment from "moment";
import { getHotelPrice } from "../../AllTickets/Hotel/hotelhelper";

const dateFormat = "DD MMM, YYYY";

const styles = StyleSheet.create({
  page: {
    padding: 18,
    backgroundColor: "#f8fafc",
    fontFamily: "Helvetica",
  },
  cardWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },

  // 🌟 LUXURY HEADER BANNER
  headerBanner: {
    backgroundColor: "#0f172a",
    borderBottom: "4px solid #f59e0b",
    padding: "16px 20px",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    width: "65%",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  officialBadge: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fcd34d",
    borderRadius: 3,
    padding: "2px 6px",
    marginRight: 6,
  },
  officialBadgeText: {
    color: "#b45309",
    fontSize: 7.5,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  starsText: {
    color: "#f59e0b",
    fontSize: 9.5,
    fontWeight: "bold",
  },
  hotelTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
    lineHeight: 1.2,
  },
  cityText: {
    color: "#94a3b8",
    fontSize: 8.5,
  },
  headerRight: {
    width: "35%",
    alignItems: "flex-end",
  },
  statusBadgeConfirmed: {
    backgroundColor: "#ecfdf5",
    border: "1px solid #10b981",
    borderRadius: 12,
    padding: "4px 10px",
    alignSelf: "flex-end",
  },
  statusBadgeTextConfirmed: {
    color: "#059669",
    fontSize: 8.5,
    fontWeight: "bold",
  },
  statusBadgeCancelled: {
    backgroundColor: "#fef2f2",
    border: "1px solid #ef4444",
    borderRadius: 12,
    padding: "4px 10px",
    alignSelf: "flex-end",
  },
  statusBadgeTextCancelled: {
    color: "#dc2626",
    fontSize: 8.5,
    fontWeight: "bold",
  },
  statusBadgePending: {
    backgroundColor: "#fffbeb",
    border: "1px solid #f59e0b",
    borderRadius: 12,
    padding: "4px 10px",
    alignSelf: "flex-end",
  },
  statusBadgeTextPending: {
    color: "#d97706",
    fontSize: 8.5,
    fontWeight: "bold",
  },
  refText: {
    color: "#94a3b8",
    fontSize: 8,
    marginTop: 5,
    textAlign: "right",
  },
  refNumberText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  bookedDateText: {
    color: "#94a3b8",
    fontSize: 7.5,
    marginTop: 2,
    textAlign: "right",
  },

  // 📅 TIMELINE BAR
  timelineBar: {
    backgroundColor: "#ffffff",
    padding: "12px 18px",
    borderBottom: "1px solid #e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeBox: {
    width: "38%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "8px 12px",
  },
  timeLabel: {
    fontSize: 7,
    color: "#64748b",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  timeDate: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 2,
  },
  timeSub: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 1,
  },
  durationBox: {
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
  },
  durationPill: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "3px 8px",
  },
  durationPillText: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#1d4ed8",
  },
  durationDivider: {
    width: "80%",
    borderBottom: "1px dashed #cbd5e1",
    marginVertical: 3,
  },
  durationSub: {
    fontSize: 7,
    color: "#94a3b8",
    fontWeight: "bold",
  },

  // 🏢 CARDS & SECTIONS
  sectionCard: {
    padding: "12px 18px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  gridColHalf: {
    width: "48%",
  },
  gridColFourth: {
    width: "24%",
  },
  gridColThird: {
    width: "32%",
  },
  colLabel: {
    fontSize: 7,
    color: "#64748b",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  colValue: {
    fontSize: 8.5,
    color: "#1e293b",
    marginTop: 2,
  },
  colValueBold: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 2,
  },

  // Rooms and Inclusions
  roomCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "7px 10px",
    marginTop: 6,
  },
  inclusionCard: {
    width: "48%",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 6,
    padding: "7px 10px",
    marginTop: 6,
  },
  tagCyan: {
    backgroundColor: "#e0f2fe",
    borderRadius: 3,
    padding: "2px 5px",
    marginTop: 3,
    alignSelf: "flex-start",
  },
  tagCyanText: {
    fontSize: 7,
    color: "#0284c7",
    fontWeight: "bold",
  },

  // Guests
  roomGuestsHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 4,
    marginTop: 6,
  },
  guestCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "6px 10px",
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guestName: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  guestType: {
    fontSize: 7,
    color: "#64748b",
    marginTop: 1,
  },
  leadTag: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 3,
    padding: "1px 4px",
  },
  leadTagText: {
    fontSize: 6.5,
    color: "#2563eb",
    fontWeight: "bold",
  },

  // Payment Box
  paymentBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "8px 12px",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.5,
    borderBottom: "1px dashed #f1f5f9",
  },
  paymentLabel: {
    fontSize: 8,
    color: "#475569",
  },
  paymentValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
  },
  paymentTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    marginTop: 3,
    borderTop: "1px dashed #cbd5e1",
  },
  paymentTotalLabel: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  paymentTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2563eb",
  },

  // Rules Section
  rulesSection: {
    backgroundColor: "#f8fafc",
    padding: "12px 18px",
    borderBottom: "1px solid #e2e8f0",
  },
  rulesTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  policyHighlight: {
    fontSize: 7.5,
    color: "#1e293b",
    fontWeight: "bold",
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 7,
    color: "#64748b",
    marginBottom: 2,
    lineHeight: 1.35,
  },

  // Footer Note
  footerNote: {
    padding: "7px 18px",
    textAlign: "center",
    fontSize: 6.5,
    color: "#94a3b8",
    backgroundColor: "#ffffff",
  },
});

const HotelDoc = ({ ticketData = {}, cmsFareRules = {}, withFare = true }) => {
  const {
    baseAmount,
    taxAmount,
    convienenceFee,
    discount,
    grandTotal,
    noOfNights,
  } = getHotelPrice(ticketData);

  const curr = ticketData?.Currency || "INR";
  const value = ticketData?.CurrencyRatio || "1";

  const hotelName = ticketData?.HotelName || ticketData?.booking?.hotelName || "Hotel Voucher";
  const cityName = ticketData?.CityName || ticketData?.booking?.cityName || "";
  const address =
    ticketData?.HotelAddress?.address ||
    (typeof ticketData?.HotelAddress === "string" ? ticketData.HotelAddress : "") ||
    ticketData?.booking?.hotelAddress ||
    ticketData?.CityName ||
    "Address provided at check-in";

  const refNumber =
    ticketData?.RefNumber ||
    ticketData?.ConfirmationNumber ||
    ticketData?.booking?.referenceNumber ||
    "N/A";

  const pnr = ticketData?.SupplierConfirmationNo || ticketData?.booking?.pnr || refNumber;
  const bookingDate = ticketData?.BookingDate || ticketData?.booking?.bookingDate;
  const checkInDate = ticketData?.CheckInDate || ticketData?.booking?.checkInDate;
  const checkOutDate = ticketData?.CheckOutDate || ticketData?.booking?.checkOutDate;
  const starRating = Number(ticketData?.StarRating || ticketData?.booking?.starRating || 5);

  const statusNum = Number(ticketData?.BookingStatus ?? ticketData?.booking?.bookingStatus);
  const statusStr = String(ticketData?.BookingStatus ?? ticketData?.booking?.bookingStatus ?? ticketData?.Status ?? "").toLowerCase();
  const isConfirmed = statusNum === 2 || statusStr.includes("confirm");
  const isCancelled = statusNum === 3 || statusStr.includes("cancel");
  const isHold = statusNum === 6 || statusStr.includes("hold");

  const statusText = isConfirmed
    ? "CONFIRMED"
    : isCancelled
    ? "CANCELLED"
    : isHold
    ? "HOLD"
    : statusStr
    ? statusStr.toUpperCase()
    : "CONFIRMED";

  const statusStyle = isConfirmed
    ? styles.statusBadgeConfirmed
    : isCancelled
    ? styles.statusBadgeCancelled
    : styles.statusBadgePending;

  const statusTextStyle = isConfirmed
    ? styles.statusBadgeTextConfirmed
    : isCancelled
    ? styles.statusBadgeTextCancelled
    : styles.statusBadgeTextPending;

  const guestsList = Array.isArray(ticketData?.guests) ? ticketData.guests : [];
  const groupedGuests = guestsList.reduce((acc, guest) => {
    const roomKey = guest?.RoomSerialNo || 1;
    if (!acc[roomKey]) {
      acc[roomKey] = [];
    }
    acc[roomKey].push(guest);
    return acc;
  }, {});

  const roomsList = Array.isArray(ticketData?.Rooms)
    ? ticketData.Rooms
    : Array.isArray(ticketData?.rooms)
    ? ticketData.rooms
    : [];

  const inclusionsText =
    ticketData?.Inclusions?.[0]?.boardBasis?.description ||
    ticketData?.Inclusions?.[0]?.inclusions ||
    (typeof ticketData?.Inclusions?.[0] === "string" ? ticketData?.Inclusions?.[0] : "Room Only");

  const leadGuestName =
    guestsList.length > 0
      ? `${guestsList[0]?.Title ? guestsList[0].Title + " " : ""}${guestsList[0]?.FirstName || ""} ${guestsList[0]?.LastName || ""}`.trim() || "Lead Guest"
      : "Lead Guest";

  const phone = ticketData?.phoneNo || ticketData?.booking?.mobileNumber || "N/A";
  const email = ticketData?.email || ticketData?.booking?.email || "N/A";

  const numStars = Math.min(Math.max(starRating || 5, 1), 5);
  const starsString = "★ ".repeat(numStars).trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.cardWrapper}>
          {/* 🌟 1. LUXURY HEADER BANNER */}
          <View style={styles.headerBanner}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <View style={styles.officialBadge}>
                  <Text style={styles.officialBadgeText}>OFFICIAL E-VOUCHER</Text>
                </View>
                <Text style={styles.starsText}>{starsString}</Text>
              </View>

              <Text style={styles.hotelTitle}>{hotelName}</Text>

              {cityName ? (
                <Text style={styles.cityText}>{cityName}, India</Text>
              ) : null}
            </View>

            <View style={styles.headerRight}>
              <View style={statusStyle}>
                <Text style={statusTextStyle}>{statusText}</Text>
              </View>

              <Text style={styles.refText}>
                Reference No: <Text style={styles.refNumberText}>{refNumber}</Text>
              </Text>

              {bookingDate ? (
                <Text style={styles.bookedDateText}>
                  Booked on: {moment(bookingDate).format("DD MMM YYYY")}
                </Text>
              ) : null}
            </View>
          </View>

          {/* 📅 2. CHECK-IN & CHECK-OUT TIMELINE BAR */}
          <View style={styles.timelineBar}>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>CHECK-IN</Text>
              <Text style={styles.timeDate}>
                {checkInDate ? moment(checkInDate).format(dateFormat) : "N/A"}
              </Text>
              <Text style={styles.timeSub}>From 14:00 hrs</Text>
            </View>

            <View style={styles.durationBox}>
              <View style={styles.durationPill}>
                <Text style={styles.durationPillText}>
                  {noOfNights || 1} {noOfNights === 1 ? "NIGHT" : "NIGHTS"}
                </Text>
              </View>
              <View style={styles.durationDivider} />
              <Text style={styles.durationSub}>
                {ticketData?.NoOfRooms || ticketData?.booking?.noOfRooms || (roomsList.length > 0 ? roomsList.length : 1)} Room(s)
              </Text>
            </View>

            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>CHECK-OUT</Text>
              <Text style={styles.timeDate}>
                {checkOutDate ? moment(checkOutDate).format(dateFormat) : "N/A"}
              </Text>
              <Text style={styles.timeSub}>Until 12:00 hrs</Text>
            </View>
          </View>

          {/* 🏢 3. HOTEL & ROOM SPECIFICATIONS CARD */}
          <View style={styles.sectionCard} wrap={false}>
            <Text style={styles.sectionTitle}>Hotel & Room Information</Text>

            <View style={styles.gridRow}>
              <View style={styles.gridColHalf}>
                <Text style={styles.colLabel}>HOTEL ADDRESS</Text>
                <Text style={styles.colValue}>{address}</Text>
              </View>

              <View style={styles.gridColFourth}>
                <Text style={styles.colLabel}>CONFIRMATION NO (PNR)</Text>
                <Text style={styles.colValueBold}>{pnr || refNumber}</Text>
              </View>

              <View style={styles.gridColFourth}>
                <Text style={styles.colLabel}>TOTAL ROOMS</Text>
                <Text style={styles.colValueBold}>
                  {ticketData?.NoOfRooms || ticketData?.booking?.noOfRooms || 1} Room(s)
                </Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              {(roomsList.length > 0 ? roomsList : [{ roomName: "Standard Room", adultCount: 1, childCount: 0 }]).map((room, idx) => (
                <View key={`room-${idx}`} style={styles.roomCard}>
                  <Text style={styles.colLabel}>ROOM {idx + 1}</Text>
                  <Text style={styles.colValueBold}>
                    {room.roomName || room.roomTypeName || "Standard Room"}
                  </Text>
                  <View style={styles.tagCyan}>
                    <Text style={styles.tagCyanText}>
                      {room.adultCount || 1} Adult(s){room.childCount > 0 ? `, ${room.childCount} Child(ren)` : ""}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.inclusionCard}>
                <Text style={[styles.colLabel, { color: "#166534" }]}>INCLUSIONS & MEAL PLAN</Text>
                <Text style={[styles.colValueBold, { color: "#15803d" }]}>{inclusionsText}</Text>
              </View>
            </View>
          </View>

          {/* 👥 4. PASSENGER & CONTACT DETAILS CARD */}
          <View style={styles.sectionCard} wrap={false}>
            <Text style={styles.sectionTitle}>Passenger & Contact Details</Text>

            <View style={styles.gridRow}>
              <View style={styles.gridColThird}>
                <Text style={styles.colLabel}>LEAD GUEST NAME</Text>
                <Text style={styles.colValueBold}>{leadGuestName}</Text>
              </View>

              <View style={styles.gridColThird}>
                <Text style={styles.colLabel}>MOBILE NUMBER</Text>
                <Text style={styles.colValue}>{phone}</Text>
              </View>

              <View style={styles.gridColThird}>
                <Text style={styles.colLabel}>EMAIL ADDRESS</Text>
                <Text style={styles.colValue}>{email}</Text>
              </View>
            </View>

            {Object.keys(groupedGuests).length > 0 ? (
              <View style={{ marginTop: 6 }}>
                {Object.entries(groupedGuests).map(([roomSerial, guests]) => (
                  <View key={`grp-${roomSerial}`}>
                    <Text style={styles.roomGuestsHeader}>ROOM {roomSerial} GUESTS</Text>
                    <View style={styles.gridRow}>
                      {guests.map((g, idx) => (
                        <View key={`guest-${idx}`} style={styles.guestCard}>
                          <View>
                            <Text style={styles.guestName}>
                              {g.Title ? g.Title + " " : ""}{g.FirstName} {g.LastName}
                            </Text>
                            <Text style={styles.guestType}>
                              Type: {g.GuestType || "Adult"} {g.Age ? `• Age: ${g.Age}` : ""}
                            </Text>
                          </View>
                          {g.IsLeadPax ? (
                            <View style={styles.leadTag}>
                              <Text style={styles.leadTagText}>Lead</Text>
                            </View>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* 💰 5. PAYMENT SUMMARY CARD */}
          {withFare ? (
            <View style={styles.sectionCard} wrap={false}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.paymentBox}>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Base Fare</Text>
                  <Text style={styles.paymentValue}>
                    {curr} {parseFloat((Number(baseAmount) / Number(value)).toFixed(2))}
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Taxes & Service Charges</Text>
                  <Text style={styles.paymentValue}>
                    {curr} {parseFloat((Number(taxAmount) / Number(value)).toFixed(2))}
                  </Text>
                </View>

                {Number(convienenceFee) > 0 ? (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Convenience Fee</Text>
                    <Text style={styles.paymentValue}>
                      {curr} {parseFloat((Number(convienenceFee) / Number(value)).toFixed(2))}
                    </Text>
                  </View>
                ) : null}

                {Number(discount) > 0 ? (
                  <View style={styles.paymentRow}>
                    <Text style={[styles.paymentLabel, { color: "#16a34a" }]}>Discount Applied</Text>
                    <Text style={[styles.paymentValue, { color: "#16a34a" }]}>
                      - {curr} {parseFloat((Number(discount) / Number(value)).toFixed(2))}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.paymentTotalRow}>
                  <Text style={styles.paymentTotalLabel}>Total Amount Paid</Text>
                  <Text style={styles.paymentTotalValue}>
                    {curr} {parseFloat((Number(grandTotal) / Number(value)).toFixed(2))}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* ⚠️ 6. IMPORTANT CHECK-IN & CANCELLATION RULES */}
          <View style={styles.rulesSection} wrap={false}>
            <Text style={styles.rulesTitle}>Important Check-in & Cancellation Rules</Text>

            {ticketData?.cancellationPolicy ? (
              <Text style={styles.policyHighlight}>
                Cancellation Policy: {ticketData.cancellationPolicy}
              </Text>
            ) : cmsFareRules?.cancelPolicyDescription ? (
              <Text style={styles.policyHighlight}>
                Cancellation Policy: Standard booking cancellation terms apply.
              </Text>
            ) : (
              <Text style={styles.policyHighlight}>
                Cancellation Policy: Subject to hotel and supplier approval. Charges may apply.
              </Text>
            )}

            <Text style={styles.bulletItem}>
              • Please present a valid government-issued photo ID and booking confirmation at check-in.
            </Text>
            <Text style={styles.bulletItem}>
              • Standard check-in time is 14:00 hrs and check-out time is 12:00 hrs unless specified.
            </Text>
            <Text style={styles.bulletItem}>
              • Incidentals, mini-bar, and extra charges are to be settled directly with the hotel upon check-out.
            </Text>
            <Text style={styles.bulletItem}>
              • Important: Cancellation requests on or close to the check-in date fall under the non-refundable window and are subject to hotel/supplier approval.
            </Text>
            <Text style={styles.bulletItem}>
              • The refund for early check-out or unutilized nights is subject to hotel & supplier discretion.
            </Text>
          </View>

          {/* 7. FOOTER NOTE */}
          <Text style={styles.footerNote}>
            Thank you for booking with HCI. This is a computer-generated voucher and does not require a physical signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default HotelDoc;