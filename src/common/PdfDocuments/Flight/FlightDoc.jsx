import React from "react";
import {
  Page,
  Text,
  Image,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import {
  getFlightPrice,
  calculateDuration,
} from "../../AllTickets/Flight/flightHelper";

// Helper functions
const getAllSegments = (ticketData) => {
  const segments = [];

  // Add oneWay segments first (both outbound and return marked ones)
  if (ticketData.oneWaySegment && ticketData.oneWaySegment.length > 0) {
    segments.push(
      ...ticketData.oneWaySegment.map((seg) => ({
        ...seg,
        segmentType: seg.isReturnSegement ? "return" : "outbound",
      })),
    );
  }

  // Add return segments if they exist
  if (ticketData.returnSegment && ticketData.returnSegment.length > 0) {
    segments.push(
      ...ticketData.returnSegment.map((seg) => ({
        ...seg,
        segmentType: "return",
      })),
    );
  }

  // Add multi-destination segments
  if (
    ticketData.multiDestinationSegment &&
    ticketData.multiDestinationSegment.length > 0
  ) {
    // Flatten the multi-destination segments
    ticketData.multiDestinationSegment.forEach((journeyArray, journeyIndex) => {
      if (Array.isArray(journeyArray)) {
        journeyArray.forEach((segment, segmentIndex) => {
          segments.push({
            ...segment,
            journeyIndex,
            segmentIndex,
            segmentType: "multicity",
          });
        });
      }
    });
  }

  return segments;
};

const getOutboundSegments = (ticketData) => {
  if (ticketData.oneWaySegment) {
    return ticketData.oneWaySegment.filter((seg) => !seg.isReturnSegement);
  }
  return [];
};

const getReturnSegments = (ticketData) => {
  // First check if we have explicit return segments
  if (ticketData.returnSegment && ticketData.returnSegment.length > 0) {
    return ticketData.returnSegment;
  }

  // Then check for oneWay segments marked as return
  if (ticketData.oneWaySegment) {
    const returnSegments = ticketData.oneWaySegment.filter(
      (seg) => seg.isReturnSegement === true,
    );
    if (returnSegments.length > 0) {
      return returnSegments;
    }
  }

  return [];
};

// Fixed multi-destination segment handling
const getMultiCitySegments = (ticketData) => {
  if (!ticketData.multiDestinationSegment) return [];

  const allSegments = [];
  ticketData.multiDestinationSegment.forEach((journeyArray, journeyIndex) => {
    if (Array.isArray(journeyArray)) {
      journeyArray.forEach((segment, segmentIndex) => {
        allSegments.push({
          ...segment,
          journeyIndex,
          segmentIndex,
          segmentType: "multicity",
        });
      });
    }
  });

  return allSegments;
};

// Fixed multi-destination segment grouping
const getMultiDestinationJourneys = (ticketData) => {
  if (!ticketData.multiDestinationSegment) return [];

  const journeys = [];
  ticketData.multiDestinationSegment.forEach((journeyArray, journeyIndex) => {
    if (Array.isArray(journeyArray) && journeyArray.length > 0) {
      journeys.push({
        journeyIndex,
        segments: journeyArray,
        origin: journeyArray[0].origin,
        destination: journeyArray[journeyArray.length - 1].destination,
      });
    }
  });

  return journeys;
};

// Calculate layover time between segments
const calculateLayoverTime = (currentSegment, nextSegment) => {
  if (!currentSegment || !nextSegment) return null;

  const currentArrival = dayjs(currentSegment.arrivalDateTime);
  const nextDeparture = dayjs(nextSegment.departureDateTime);

  const diffMinutes = nextDeparture.diff(currentArrival, "minute");
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours}h ${minutes}m`;
};

const getPassengerPreferences = (passenger) => {
  const preferences = [];

  // Get meal preferences
  if (passenger.mealPref && passenger.mealPref.length > 0) {
    passenger.mealPref.forEach((segmentMeals, segmentIndex) => {
      segmentMeals.forEach((mealList) => {
        mealList.forEach((meal) => {
          if (meal.mealDesc) {
            preferences.push({
              type: "meal",
              value: `${meal.mealCode}`,
              segment: segmentIndex + 1,
            });
          }
        });
      });
    });
  }

  // Get baggage preferences
  if (passenger.baggagePref && passenger.baggagePref.length > 0) {
    passenger.baggagePref.forEach((segmentBaggages, segmentIndex) => {
      segmentBaggages.forEach((baggageList) => {
        baggageList.forEach((baggage) => {
          if (baggage.baggWeight) {
            preferences.push({
              type: "baggage",
              value: `${baggage.baggWeight}`,
              segment: segmentIndex + 1,
            });
          }
        });
      });
    });
  }

  // Get seat preferences
  if (passenger.seatPref && passenger.seatPref.length > 0) {
    passenger.seatPref.forEach((segmentSeats, segmentIndex) => {
      segmentSeats.forEach((seatList) => {
        seatList.forEach((seat) => {
          if (seat.seatNo) {
            const seatType = seat.seatDesc ? ` (${seat.seatDesc})` : "";
            preferences.push({
              type: "seat",
              value: `Seat ${seat.seatNo}${seatType}`,
              segment: segmentIndex + 1,
            });
          }
        });
      });
    });
  }

  return preferences;
};

const getAgencyInfo = (ticketData) => {
  // Check if it's an admin booking with adminDetails
  if (ticketData.adminDetails && ticketData.adminDetails.settings) {
    const adminSettings = ticketData.adminDetails.settings;
    return {
      agencyName:
        adminSettings?.userBusinessDetails?.AgencyName || "Etravos",
      email: adminSettings?.userDetails?.Email || "support@etravos.com",
    };
  }

  // Check if it's an agent booking with agentDetails
  if (ticketData.agentDetails) {
    return {
      agencyName: ticketData?.agentDetails?.AgencyName || "Etravos",
      email: ticketData?.agentDetails?.Email || "support@etravos.com",
    };
  }

  // Default fallback
  return {
    agencyName: "Etravos",
    email: "support@etravos.com",
  };
};

const hasValidGSTData = (ticketData) => {
  if (
    !ticketData.GSTDetails ||
    !Array.isArray(ticketData.GSTDetails) ||
    ticketData.GSTDetails.length === 0
  ) {
    return false;
  }

  const gstData = ticketData.GSTDetails[0];
  return (
    gstData &&
    ((gstData.GSTNumber && gstData.GSTNumber.trim() !== "") ||
      (gstData.GSTCompanyName && gstData.GSTCompanyName.trim() !== "") ||
      (gstData.GSTEmailId && gstData.GSTEmailId.trim() !== "") ||
      (gstData.GSTPhoneNo && gstData.GSTPhoneNo.trim() !== ""))
  );
};

// Get GST data if available
const getGSTData = (ticketData) => {
  if (hasValidGSTData(ticketData)) {
    return ticketData.GSTDetails[0];
  }
  return null;
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 15,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    color: "#0740a1",
    marginBottom: 5,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 10,
    marginBottom: 5,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 4,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  bookingInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    padding: 15,
    border: "1px solid #ddd",
    borderRadius: 4,
  },
  bookingLeft: {
    flex: 1,
    marginRight: 10,
  },
  bookingRight: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  col: {
    flex: 1,
    marginRight: 10,
  },
  colLast: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: "#0740a1",
    marginBottom: 10,
    fontWeight: "bold",
    borderBottom: "2px solid #0740a1",
    paddingBottom: 5,
  },
  segmentCard: {
    border: "1px solid #272727",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  passengerHeader: {
    flexDirection: "row",
    backgroundColor: "#0740a1",
    color: "white",
    padding: 8,
    fontWeight: "bold",
  },
  passengerRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1px solid #eee",
  },
  passengerEven: {
    backgroundColor: "#f9f9f9",
  },
  tableCol: {
    flex: 1,
    padding: 2,
  },
  tableColSmall: {
    flex: 0.5,
    padding: 2,
  },
  tableColLarge: {
    flex: 2,
    padding: 2,
  },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: "1px solid #eee",
  },
  fareTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 15,
    borderTop: "2px solid #0740a1",
    fontWeight: "bold",
    fontSize: 12,
  },
  importantInfo: {
    border: "1px solid #000",
    borderRadius: 4,
    marginTop: 20,
    padding: 10,
  },
  infoHeader: {
    backgroundColor: "#ffffff",
    color: "#000000",
    padding: 8,
    fontWeight: "bold",
    fontSize: 12,
  },
  infoList: {
    marginLeft: 15,
    marginBottom: 10,
  },
  infoListItem: {
    marginBottom: 5,
    fontSize: 9,
  },
  dangerousGoods: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  goodsColumn: {
    flex: 1,
    marginRight: 10,
  },
  goodsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
  },
  goodsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  bullet: {
    marginRight: 5,
  },
  tag: {
    backgroundColor: "#e6f7ff",
    border: "1px solid #91d5ff",
    borderRadius: 2,
    padding: "2px 4px",
    margin: 1,
    fontSize: 8,
  },
  airlineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  airlineInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  airlineLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  journeyHeader: {
    textAlign: "center",
    backgroundColor: "#e6f7ff",
    padding: 8,
    margin: "10px 0",
    border: "1px solid #91d5ff",
    fontWeight: "bold",
  },
  layover: {
    textAlign: "center",
    backgroundColor: "#fff3cd",
    padding: 6,
    margin: "8px 0",
    border: "1px solid #ffeaa7",
    fontSize: 9,
  },
  bold: {
    fontWeight: "bold",
  },
  smallText: {
    fontSize: 8,
  },
  statusConfirmed: {
    color: "green",
    fontWeight: "bold",
  },
  statusCancelled: {
    color: "red",
    fontWeight: "bold",
  },
  multiJourneyContainer: {
    marginBottom: 20,
  },
  multiJourneyTitle: {
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    margin: "15px 0",
    border: "1px solid #ddd",
    fontWeight: "bold",
  },
});

const FlightDoc = ({
  ticketData,
  withFare,
  hideMarkup = false,
  otherOptions = {},
}) => {
  const uidateFormat = "DD-MMM-YYYY";
  let {
    baseAmount,
    taxAmount,
    convienenceFee,
    discount,
    grandTotal,
    totalmeal,
    totalbagg,
    totalseat,
    agentTax,
  } = getFlightPrice(ticketData);

  if (ticketData?.fareBreakups && Array.isArray(ticketData.fareBreakups) && ticketData.fareBreakups.length > 0) {
    baseAmount = ticketData.fareBreakups.reduce((sum, item) => sum + (Number(item.baseFare) || 0), 0);
    
    const totalBreakupsSum = ticketData.fareBreakups.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const bookingTotal = Number(ticketData.totalAmount || ticketData.totalPrice || 0);
    let calculatedConvenienceFee = 0;
    
    if (bookingTotal > totalBreakupsSum) {
      calculatedConvenienceFee = bookingTotal - totalBreakupsSum;
    }
    
    convienenceFee = 0;
    taxAmount = ticketData.fareBreakups.reduce((sum, item) => sum + (Number(item.total) || 0) - (Number(item.baseFare) || 0), 0) + calculatedConvenienceFee;
    grandTotal = baseAmount + taxAmount + convienenceFee;
  } else {
    if (ticketData?.totalBaseFare !== undefined) baseAmount = ticketData.totalBaseFare;
    if (ticketData?.totalTax !== undefined) taxAmount = ticketData.totalTax;
    if (ticketData?.totalAmount !== undefined) grandTotal = ticketData.totalAmount;
  }

  if (ticketData?.ssrs && Array.isArray(ticketData.ssrs)) {
    let newMeal = 0, newBagg = 0, newSeat = 0;
    ticketData.ssrs.forEach(ssr => {
      const amount = Number(ssr.amount) || 0;
      if (ssr.type === "MEAL") newMeal += amount;
      else if (ssr.type === "BAGGAGE") newBagg += amount;
      else if (ssr.type === "SEAT") newSeat += amount;
    });
    if (newMeal > 0 || totalmeal === undefined) totalmeal = newMeal;
    if (newBagg > 0 || totalbagg === undefined) totalbagg = newBagg;
    if (newSeat > 0 || totalseat === undefined) totalseat = newSeat;
  }

  // Get agency info
  const { agencyName, email } = getAgencyInfo(ticketData);

  // Get Baggage Info based on trip type
  const getBaggageInfo = () => {
    let baggageList = [];
    const {
      tripType,
      oneWayBaggageInfo,
      returnBaggageInfo,
      multiDestinationBaggage,
    } = ticketData;

    // Normalize tripType to lowercase for comparison
    const lowerTripType = tripType?.toLowerCase();

    if (lowerTripType === "oneway" || lowerTripType === "oneway") {
      if (oneWayBaggageInfo && oneWayBaggageInfo.length > 0) {
        oneWayBaggageInfo.forEach((bag) => {
          let info = bag.BaggageInfo || "Standard";
          if (bag.cabinBaggageInfo) info += ` (Cabin: ${bag.cabinBaggageInfo})`;
          baggageList.push(info);
        });
      }
    } else if (
      lowerTripType === "roundtrip" &&
      ticketData.mappingType === "COMBINED"
    ) {
      if (oneWayBaggageInfo && oneWayBaggageInfo.length > 0) {
        let info = `Onward: ${oneWayBaggageInfo[0].BaggageInfo || "Standard"}`;
        if (oneWayBaggageInfo[0].cabinBaggageInfo)
          info += ` (Cabin: ${oneWayBaggageInfo[0].cabinBaggageInfo})`;
        baggageList.push(info);
      }
    } else if (lowerTripType === "roundtrip") {
      if (oneWayBaggageInfo && oneWayBaggageInfo.length > 0) {
        let info = `Onward: ${oneWayBaggageInfo[0].BaggageInfo || "Standard"}`;
        if (oneWayBaggageInfo[0].cabinBaggageInfo)
          info += ` (Cabin: ${oneWayBaggageInfo[0].cabinBaggageInfo})`;
        baggageList.push(info);
      }
      if (returnBaggageInfo && returnBaggageInfo.length > 0) {
        let info = `Return: ${returnBaggageInfo[0].BaggageInfo || "Standard"}`;
        if (returnBaggageInfo[0].cabinBaggageInfo)
          info += ` (Cabin: ${returnBaggageInfo[0].cabinBaggageInfo})`;
        baggageList.push(info);
      }
    } else if (
      lowerTripType === "multicity" ||
      lowerTripType === "multidestination"
    ) {
      if (multiDestinationBaggage && multiDestinationBaggage.length > 0) {
        multiDestinationBaggage.forEach((bag, idx) => {
          let info = `S${idx + 1}: ${bag.BaggageInfo || "Standard"}`;
          if (bag.cabinBaggageInfo) info += ` (Cabin: ${bag.cabinBaggageInfo})`;
          baggageList.push(info);
        });
      }
    }

    return baggageList.length > 0 ? baggageList.join(", ") : "Standard";
  };

  const getFlightTicketStatus = (status) => {
    switch (status) {
      case 1:
        return <Text style={{ color: "#f9e218" }}>CREATED</Text>;
      case 2:
        return <Text style={{ color: "#FFA500" }}>BLOCKED</Text>;
      case 3:
        return <Text style={{ color: "#008000" }}>CONFIRMED</Text>;
      case 4:
        return <Text style={{ color: "#bd0c21" }}>CANCELLED</Text>;
      case 5:
        return <Text style={{ color: "#008000" }}>PARTIALLY CANCELLED</Text>;
      case 6:
        return <Text style={{ color: "#bd0c21" }}>CANCELLATION REQUESTED</Text>;
      case 7:
        return <Text style={{ color: "#bd0c21" }}>RESCHEDULEREQUESTED</Text>;
      case 8:
        return <Text style={{ color: "#bd0c21" }}>RESCHEDULECONFIRMED</Text>;
      case 9:
        return <Text style={{ color: "#bd0c21" }}>PENDING</Text>;
      case 10:
        return <Text style={{ color: "#bd0c21" }}>ABORTED</Text>;
      case 11:
        return <Text style={{ color: "#bd0c21" }}>FAILED</Text>;
      case 12:
        return <Text style={{ color: "#bd0c21" }}>ON_HOLD</Text>;
      case 13:
        return <Text style={{ color: "#bd0c21" }}>UNCONFIRMED</Text>;
      case 15:
        return <Text style={{ color: "#bd0c21" }}>BLOCK_FAILED</Text>;
      default:
        return <Text></Text>;
    }
  };

  // Get segments for different trip types
  const allSegments = getAllSegments(ticketData);
  const outboundSegments = getOutboundSegments(ticketData);
  const returnSegments = getReturnSegments(ticketData);
  const multiCitySegments = getMultiCitySegments(ticketData);
  const multiDestinationJourneys = getMultiDestinationJourneys(ticketData);

  // Check if this is a multi-destination trip
  const isMultiDestination =
    ticketData.tripType === "multidestination" || multiCitySegments.length > 0;

  // Check if this is a round trip
  const isRoundTrip = returnSegments.length > 0;

  // Determine which segments to use for header display
  const getSegmentsForHeader = () => {
    if (isMultiDestination) {
      // For multi-destination, take first segment of each journey
      const uniqueJourneySegments = [];
      const seenJourneys = new Set();

      multiCitySegments.forEach((segment) => {
        if (!seenJourneys.has(segment.journeyIndex)) {
          uniqueJourneySegments.push(segment);
          seenJourneys.add(segment.journeyIndex);
        }
      });

      return uniqueJourneySegments;
    } else {
      return [...outboundSegments, ...returnSegments];
    }
  };

  const segmentsForHeader = getSegmentsForHeader();

  const shouldShowAgency = otherOptions.withAgency;
  const shouldShowPassportInfo = otherOptions.passportInfo;
  const shouldShowRefundable = otherOptions.showRefundable;
  const shouldShowContactDetails = otherOptions.showContactDetails;

  const renderGSTDetails = () => {
    const gstData = getGSTData(ticketData);
    if (!gstData) return null;

    return (
      <View style={styles.gstContainer}>
        <Text style={styles.title}>GST Details</Text>

        <View style={styles.gstCard}>
          {gstData.GSTCompanyName && (
            <View style={styles.gstRow}>
              <Text style={styles.gstLabel}>Company Name:</Text>
              <Text style={styles.gstValue}>{gstData.GSTCompanyName}</Text>
            </View>
          )}

          {gstData.GSTNumber && (
            <View style={styles.gstRow}>
              <Text style={styles.gstLabel}>GST Number:</Text>
              <Text style={styles.gstValue}>{gstData.GSTNumber}</Text>
            </View>
          )}

          {gstData.GSTEmailId && (
            <View style={styles.gstRow}>
              <Text style={styles.gstLabel}>Email:</Text>
              <Text style={styles.gstValue}>{gstData.GSTEmailId}</Text>
            </View>
          )}

          {gstData.GSTPhoneNo && (
            <View style={styles.gstRow}>
              <Text style={styles.gstLabel}>Phone:</Text>
              <Text style={styles.gstValue}>{gstData.GSTPhoneNo}</Text>
            </View>
          )}

          {(gstData.GSTAddressLine1 ||
            gstData.GSTAddressLine2 ||
            gstData.GSTCity ||
            gstData.GSTState ||
            gstData.GSTPINCode) && (
            <View style={styles.gstRow}>
              <Text style={styles.gstLabel}>Address:</Text>
              <Text style={styles.gstValue}>
                {[
                  gstData.GSTAddressLine1,
                  gstData.GSTAddressLine2,
                  gstData.GSTCity,
                  gstData.GSTState,
                  gstData.GSTPINCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render flight segment card
  const renderFlightSegment = (segment, index, segmentType) => (
    <View key={`${segmentType}-${index}`} style={styles.segmentCard}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.bold}>Flight</Text>
          <Text>
            {segment.airlineName} - {segment.flightNumber}
          </Text>
        </View>
        {shouldShowRefundable && (
          <View style={styles.col}>
            <Text style={styles.bold}>Type</Text>
            <Text
              style={
                ticketData.refundable
                  ? styles.statusConfirmed
                  : styles.statusCancelled
              }
            >
              {ticketData.refundable ? "Refundable" : "Non-Refundable"}
            </Text>
          </View>
        )}
        <View style={styles.col}>
          <Text style={styles.bold}>Departing</Text>
          <Text>
            {dayjs(segment.departureDateTime).format("ddd, D MMM YY, HH:mm")}
          </Text>
          <Text>
            {segment.origin}, {segment.departureTerminal || "Terminal"}
          </Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.bold}>Arriving</Text>
          <Text>
            {dayjs(segment.arrivalDateTime).format("ddd, D MMM YY, HH:mm")}
          </Text>
          <Text>
            {segment.destination}, {segment.arrivalTerminal || "Terminal"}
          </Text>
        </View>
        <View style={styles.colLast}>
          <Text style={styles.bold}>Duration</Text>
          <Text>
            {calculateDuration(
              segment.departureDateTime,
              segment.arrivalDateTime,
            )}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render passenger preferences
  const renderPassengerPreferences = (passenger) => {
    const preferences = getPassengerPreferences(passenger);

    if (preferences.length === 0) {
      return <Text style={styles.smallText}>No preferences</Text>;
    }

    return (
      <View style={{ flexDirection: "column" }}>
        {preferences.map((pref, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.smallText}>
              {pref.type === "meal" ? "" : pref.type === "baggage" ? "" : ""}{" "}
              {pref.value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render passenger details section
  const renderPassengerDetails = (segments, title = "Passenger Details") => (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.card}>
        <View style={styles.passengerHeader}>
          <Text style={styles.tableCol}>Name & FF</Text>
          <Text style={styles.tableColLarge}>sector,Pnr&TicketNo</Text>
          <Text style={styles.tableCol}>Baggage (Check-in/Cabin)</Text>
          <Text style={styles.tableCol}>Preferences</Text>
          {shouldShowPassportInfo && (
            <Text style={styles.tableCol}>Document ID</Text>
          )}
        </View>

        {ticketData.passengers?.map((passenger, passIndex) => {
          const allSegmentsList = [...segments];
          const sectorText = allSegmentsList
            .map((seg) => `${seg.origin}-${seg.destination}`)
            .join(", ");

          return (
            <View
              key={passIndex}
              style={[
                styles.passengerRow,
                passIndex % 2 === 0 ? styles.passengerEven : {},
              ]}
            >
              <Text style={styles.tableCol}>
                <Text style={styles.bold}>
                  {passenger.title} {passenger.firstName} {passenger.lastName}
                </Text>
                {"\n"}
                <Text style={styles.smallText}>
                  (
                  {passenger.paxType === "ADT"
                    ? "Adult"
                    : passenger.paxType === "CHD"
                      ? "Child"
                      : "Infant"}
                  )
                </Text>
              </Text>
              <Text style={styles.tableColLarge}>
                <Text style={styles.smallText}>{sectorText}</Text>
                {"\n"}
                <Text style={[styles.smallText, styles.bold]}>
                  {ticketData.pnr
                    ? ticketData.pnr.includes("~")
                      ? ticketData.pnr.split("~").join("\n")
                      : ticketData.pnr
                    : "N/A"}
                </Text>
                {"\n"}
                <Text style={styles.smallText}>
                  {ticketData.ticketnumber
                    ? ticketData.ticketnumber.includes("~")
                      ? ticketData.ticketnumber.split("~").join("\n")
                      : ticketData.ticketnumber
                    : "N/A"}
                </Text>
              </Text>
              <Text style={styles.tableCol}>
                <Text style={styles.smallText}>{getBaggageInfo()}</Text>
              </Text>
              <View style={styles.tableCol}>
                {renderPassengerPreferences(passenger)}
              </View>

              {shouldShowPassportInfo && (
                <Text style={styles.tableCol}>
                  <Text style={styles.smallText}>
                    {passenger.passportNumber || "N/A"}
                  </Text>
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  // Render fare details
  const renderFareDetails = () => {
    if (!withFare) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.title}>Fare Details</Text>

        <View style={styles.card}>
          <View style={styles.fareRow}>
            <Text style={styles.bold}>Base Price</Text>
            <Text>
              {ticketData.currency}{" "}
              {parseFloat(
                (
                  Number(baseAmount) * Number(ticketData?.currencyRatio || 1)
                ).toFixed(2),
              ).toLocaleString()}
            </Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.bold}>Airline Taxes and Fees</Text>
            <Text>
              {ticketData.currency}{" "}
              {parseFloat(
                (
                  (Number(taxAmount) + Number(agentTax || 0)) *
                  Number(ticketData?.currencyRatio || 1)
                ).toFixed(2),
              ).toLocaleString()}
            </Text>
          </View>

          {totalmeal > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.bold}>Meals</Text>
              <Text>
                {ticketData.currency}{" "}
                {parseFloat(
                  (
                    Number(totalmeal) * Number(ticketData?.currencyRatio || 1)
                  ).toFixed(2),
                ).toLocaleString()}
              </Text>
            </View>
          )}

          {totalbagg > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.bold}>Baggage</Text>
              <Text>
                {ticketData.currency}{" "}
                {parseFloat(
                  (
                    Number(totalbagg) * Number(ticketData?.currencyRatio || 1)
                  ).toFixed(2),
                ).toLocaleString()}
              </Text>
            </View>
          )}

          {totalseat > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.bold}>Seats</Text>
              <Text>
                {ticketData.currency}{" "}
                {parseFloat(
                  (
                    Number(totalseat) * Number(ticketData?.currencyRatio || 1)
                  ).toFixed(2),
                ).toLocaleString()}
              </Text>
            </View>
          )}

          {discount > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.bold}>Discount</Text>
              <Text>
                {ticketData.currency}{" "}
                {parseFloat(
                  (
                    Number(discount) * Number(ticketData?.currencyRatio || 1)
                  ).toFixed(2),
                ).toLocaleString()}
              </Text>
            </View>
          )}

          {convienenceFee > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.bold}>Convenience Fee</Text>
              <Text>
                {ticketData.currency}{" "}
                {parseFloat(
                  (
                    Number(convienenceFee) *
                    Number(ticketData?.currencyRatio || 1)
                  ).toFixed(2),
                ).toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.fareTotal}>
            <Text style={styles.bold}>Total Price</Text>
            <Text style={styles.bold}>
              {ticketData.currency}{" "}
              {parseFloat(
                (
                  Number(grandTotal) * Number(ticketData?.currencyRatio || 1)
                ).toFixed(2),
              ).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render important information
  const renderImportantInfo = () => (
    <View style={styles.importantInfo}>
      <Text style={styles.infoHeader}>Important Information</Text>

      <View style={styles.infoList}>
        <Text style={styles.infoListItem}>
          1. You must web check-in on the airline website and obtain a boarding
          pass.
        </Text>
        <Text style={styles.infoListItem}>
          2. Reach the terminal at least 2 hours prior to the departure for
          domestic flight and 4 hours prior to the departure of international
          flight.
        </Text>
        <Text style={styles.infoListItem}>
          3. For departure terminal please check with the airline first.
        </Text>
        <Text style={styles.infoListItem}>
          4. Date & Time is calculated based on the local time of the
          city/destination.
        </Text>
        <Text style={styles.infoListItem}>
          5. Use the Airline PNR for all Correspondence directly with the
          Airline.
        </Text>
        <Text style={styles.infoListItem}>
          6. For rescheduling/cancellation within 4 hours of the departure time
          contact the airline directly.
        </Text>
        <Text style={styles.infoListItem}>
          7. Your ability to travel is at the sole discretion of the airport
          authorities and we shall not be held responsible.
        </Text>
      </View>

      <View style={styles.dangerousGoods}>
        <View style={styles.goodsColumn}>
          <Text style={[styles.goodsTitle, { color: "#d32f2f" }]}>
            ❌ The items are Dangerous Goods and are not permitted to be carried
            as Hand/Check-in Baggage
          </Text>
          {[
            "Lighters",
            "Flammable Liquids",
            "Toxic",
            "Bleach",
            "Explosives",
            "Infectious Substances",
            "Pepper Spray",
            "RadioActive Materials",
            "Flammable Gas",
            "Corrosive",
          ].map((item, index) => (
            <View key={index} style={styles.goodsItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.smallText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.goodsColumn}>
          <Text style={[styles.goodsTitle, { color: "#2e7d32" }]}>
            ✅ Items allowed only in Hand Baggage
          </Text>
          {["Power Banks", "Lithium Batteries"].map((item, index) => (
            <View key={index} style={styles.goodsItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.smallText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Render one-way/return journey layout
  const renderStandardLayout = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.title}>Flight Details</Text>

        {outboundSegments.length > 0 && (
          <>
            {isRoundTrip && (
              <Text style={styles.journeyHeader}>ONWARD JOURNEY</Text>
            )}

            {outboundSegments.map((segment, index) => (
              <React.Fragment key={`outbound-${index}`}>
                {renderFlightSegment(segment, index, "outbound")}

                {index < outboundSegments.length - 1 && (
                  <Text style={styles.layover}>
                    Layover Time -{" "}
                    {calculateLayoverTime(segment, outboundSegments[index + 1])}
                  </Text>
                )}
              </React.Fragment>
            ))}
          </>
        )}

        {returnSegments.length > 0 && (
          <>
            <Text style={styles.journeyHeader}>RETURN JOURNEY</Text>

            {returnSegments.map((segment, index) => (
              <React.Fragment key={`return-${index}`}>
                {renderFlightSegment(segment, index, "return")}

                {index < returnSegments.length - 1 && (
                  <Text style={styles.layover}>
                    Layover Time -{" "}
                    {calculateLayoverTime(segment, returnSegments[index + 1])}
                  </Text>
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </View>

      {renderPassengerDetails([...outboundSegments, ...returnSegments])}
      {renderGSTDetails()}
      {renderFareDetails()}
    </>
  );

  // Render multi-destination layout
  const renderMultiDestinationLayout = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.title}>Multi-Destination Flight Details</Text>

        {multiDestinationJourneys.map((journey, journeyIndex) => (
          <View
            key={`journey-${journeyIndex}`}
            style={styles.multiJourneyContainer}
          >
            {/* Journey Header */}
            <Text style={styles.multiJourneyTitle}>
              JOURNEY {journeyIndex + 1}: {journey.origin} to{" "}
              {journey.destination}
            </Text>

            {/* Segments in this journey */}
            {journey.segments.map((segment, segmentIndex) => (
              <React.Fragment key={`segment-${journeyIndex}-${segmentIndex}`}>
                {renderFlightSegment(segment, segmentIndex, "multicity")}

                {/* Layover between segments in same journey */}
                {segmentIndex < journey.segments.length - 1 && (
                  <Text style={styles.layover}>
                    Layover at {segment.destination} -{" "}
                    {calculateLayoverTime(
                      segment,
                      journey.segments[segmentIndex + 1],
                    )}
                  </Text>
                )}
              </React.Fragment>
            ))}
          </View>
        ))}
      </View>

      {renderPassengerDetails(multiCitySegments, "Passenger Details")}
      {renderGSTDetails()}
      {renderFareDetails()}
    </>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        {shouldShowAgency ? (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{agencyName}</Text>
            <Text style={styles.headerSubtitle}>Email: {email}</Text>
          </View>
        ) : (
          ""
        )}

        {/* Booking Information */}
        <View style={styles.bookingInfo}>
          <View style={styles.bookingLeft}>
            <View style={styles.row}>
              <Text style={styles.bold}>Booking Date:</Text>
              <Text>
                {dayjs(ticketData.bookingDate).format("MMM DD, YYYY")}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.bold}>Booking ID:</Text>
              <Text>{ticketData.referenceNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.bold}>Booking Status:</Text>
              <Text>{getFlightTicketStatus(ticketData.bookingStatus)}</Text>
            </View>
          </View>

          <View style={styles.bookingRight}>
            {segmentsForHeader.length > 0 ? (
              segmentsForHeader.map((seg, index) => (
                <View key={index} style={styles.airlineRow}>
                  <View style={styles.airlineInfo}>
                    <Image
                      style={styles.airlineLogo}
                      src={`https://www.gstatic.com/flights/airline_logos/70px/${seg.airlineCode || seg.airlineName}.png`}
                    />
                    <Text style={styles.bold}>{seg.airlineName}</Text>
                  </View>
                  <View>
                    <Text style={styles.bold}>
                      {ticketData.pnr?.includes("~")
                        ? ticketData.pnr.split("~")[index] || ticketData.pnr
                        : ticketData.pnr}
                    </Text>
                    <Text style={styles.smallText}>Airline PNR</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text>No segment data available</Text>
            )}
          </View>
        </View>

        {/* Main Content */}
        {!isMultiDestination
          ? renderStandardLayout()
          : renderMultiDestinationLayout()}

        {renderImportantInfo()}
      </Page>
    </Document>
  );
};

export default FlightDoc;
