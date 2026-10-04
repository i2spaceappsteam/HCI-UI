import React, { useState } from "react";
import {
  Page,
  Text,
  Image,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
// import bg from "../../../assets/images/bg/ticketbg.png";
// import LogoImg from "../../../assets/images/OutcL1.png";
// import shield from "../../../assets/images/bg/shield.png";
import { getHotelPrice } from "../../AllTickets/Hotel/hotelhelper";
// import Logo from "../../../assets/download.png";

import moment from "moment";

import Html from "react-pdf-html";

let dateFormat = "MMM, DD-YYYY";
const ImBaseUrl = import.meta.env.VITE_BASE_URL;
const csssheet = {
  p: {
    margin: 0,
    fontSize: 12,
  },
};

const styles = StyleSheet.create({
  textDanger: {
    color: "#dc3545",
  },

  mb: {
    marginBottom: 10,
  },

  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    flexGrow: 1,
  },

  wHalf: {
    flex: 0.5,
    marginBottom: 10,
  },
  tw: {
    flex: 0.2,
  },
  fourthHalf: {
    flex: 0.25,
    paddingRight: 5,
  },

  width32: {
    flex: 0.32,
  },
  trw: {
    flex: 0.3,
  },
  fw: {
    flex: 0.4,
  },
  sw: {
    flex: 0.6,
  },
  sew: {
    flex: 0.7,
  },

  mb8: {
    marginBottom: 8,
  },
  description: {
    paddingLeft: 5,
  },

  hr: {
    borderBottom: "1px solid #e2e2e2",
    flex: 1,
    margin: "10px 0",
  },

  page: {
    flexDirection: "row",
    padding: "15px 10px",
  },
  section: {
    flex: 1,
  },
  innerSection: {
    flex: 1,
    position: "relative",
  },
  pageBg: {
    position: "absolute",
    flex: 1,
    width: "100%",
    height: 100,
  },
  busWrapper: {
    padding: "25px 10px 10px 10px",
  },

  whiteText: { color: "#fff", fontSize: 12, marginBottom: 10, fontWeight: 600 },
  title: { fontSize: 12, fontWeight: 600, wordBreak: "break-word" },
  fadetitle: { color: "#a8a8a8", fontSize: 9, marginBottom: 2 },
  smallText: { fontSize: 10, marginBottom: 2 },
  xsmallText: {
    fontSize: 9,
    marginBottom: 3,
  },
  greytext: { color: "#666", fontSize: 9 },
  card: {
    padding: "10px 5px",
    marginBottom: 10,
    border: "1px solid #e2e2e2",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  insuranceCard: {
    border: "1px solid #02cb66",
    borderRadius: 6,
    textAlign: "center",
    padding: "10px 5px",
  },

  insurancetitle: {
    color: "#18a160",
    fontSize: 10,
  },

  dottedBorder: {
    borderTop: "1px dotted #a8a8a8",
    width: "100%",
    textAlign: "center",
  },

  coverage: {
    color: "#294782",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: "10px 0",
  },

  coveragetitle: {
    color: "#294782",
    fontSize: 9,
  },
});

export const getStatus = (status) => {
  switch (status) {
    case 1: {
      return <Text style={{ color: "#FFA500" }}>FAILED</Text>;
    }
    case 2: {
      return <Text style={{ color: "#008000" }}>CONFIRMED</Text>;
    }
    case 3: {
      return <Text style={{ color: "#bd0c21" }}>CANCELLED</Text>;
    }
    case 4: {
      return <Text style={{ color: "#bd0c21" }}>PENDING</Text>;
    }
    case 5: {
      return <Text style={{ color: "#f9e218" }}>REJECTED</Text>;
    }
    case 6: {
      return <Text style={{ color: "#bd0c21" }}>HOLD</Text>;
    }
    case 7: {
      return <Text style={{ color: "#bd0c21" }}>CANCELLATIONREQUESTED</Text>;
    }
    case 8: {
      return <Text style={{ color: "#bd0c21" }}>CANCELLATIONPENDING</Text>;
    }
    case 9: {
      return <Text style={{ color: "#bd0c21" }}>CANCELLATIONPROGRESS</Text>;
    }
    default:
      return;
  }
};

const parser = (str) => {
  if (str) {
    let doc = new DOMParser().parseFromString(str, "text/html");
    // console.log(doc);
    return doc.firstChild.innerHTML;
  }
};

const HotelDoc = ({ ticketData, cmsFareRules, withFare }) => {
  // console.log(ticketData);
  // console.log(cmsFareRules);
  let {
    baseAmount,
    taxAmount,
    convienenceFee,
    discount,
    grandTotal,
    insuranceTotal,
    noOfNights,
  } = getHotelPrice(ticketData);
  const BASE = import.meta.env.VITE_BASE_URL;
  const [curr, setCurr] = useState(ticketData?.Currency || 'INR');
  const [value, setValue] = useState(ticketData?.CurrencyRatio || '1');
  const groupedGuests = ticketData.guests.reduce((acc, guest) => {
    if (!acc[guest.RoomSerialNo]) {
      acc[guest.RoomSerialNo] = [];
    }
    acc[guest.RoomSerialNo].push(guest);
    return acc;
  }, {});
  // function addStr(str, index) {
  //   return str;
  //   console.log(str);
  //   let stringArr = [];
  //   if (str.length > index) {
  //     stringArr.push(str.substring(0, index));
  //     let secText = str.substring(index, str.length);
  //     while (secText.length > index) {
  //       let temp = secText;
  //       stringArr.push(temp.substring(0, index));
  //       secText = temp.substring(index, secText.length);
  //     }
  //     stringArr.push(secText);
  //   }

  //   return stringArr.join(" ");
  //   // return str.substring(0, index) + " " + str.substring(index, str.length);
  // }

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={true}>
        {ticketData?.BookingStatus ? (
          <View style={styles.section}>

            {/* <Image style={{ width: 100, heigh: 50 }} src={Logo} /> */}

            <View style={styles.innerSection}>
              {/* <Image src={ImBaseUrl+"images/bg/ticketbg.png"} style={styles.pageBg} /> */}
              <View style={styles.busWrapper}>
                <Text style={styles.whiteText}>{ticketData.HotelName}</Text>

                <View style={styles.card} wrap={false}>
                  <View style={styles.row}>
                    <View style={styles.sew}>
                      <Text style={styles.title}>{ticketData.HotelName}</Text>
                      <Text style={styles.fadetitle}>
                        {ticketData.CityName}
                      </Text>
                    </View>

                    <View style={styles.fw}>
                      <Text style={styles.title}>
                        {ticketData.ConfirmationNumber}
                      </Text>
                      <Text style={styles.fadetitle}>Reference No</Text>
                    </View>
                    <View style={styles.trw}>
                      <Text style={styles.title}>
                        {moment(ticketData.BookingDate).format("DD-MM-YYYY")}
                      </Text>
                      <Text style={styles.fadetitle}>Booking Date</Text>
                    </View>
                    {/* <View style={styles.fourthHalf}>
                      <Text style={styles.title}>{ticketData.SupplierConfirmationNo}</Text>
                      <Text style={styles.fadetitle}>Confirmation Id</Text>
                    </View> */}
                  </View>

                  <View style={styles.hr}></View>

                  <View style={styles.row}>
                    <View style={styles.fourthHalf}>
                      <Text style={styles.title}>{ticketData.RefNumber}</Text>
                      <Text style={styles.fadetitle}>Booking Id</Text>
                    </View>
                    <View style={styles.fourthHalf}>
                      <Text style={styles.title}>
                        {getStatus(ticketData.BookingStatus)}
                      </Text>
                      <Text style={styles.fadetitle}>Status</Text>
                    </View>
                    {ticketData.SupplierConfirmationNo === null ?

                      <View style={styles.fourthHalf}>
                        <Text style={styles.title}>{ticketData.NoOfRooms}</Text>
                        <Text style={styles.fadetitle}>Room(s)</Text>
                      </View> :
                      <View style={styles.fourthHalf}>
                        <Text style={styles.title}>{ticketData.SupplierConfirmationNo}</Text>
                        <Text style={styles.fadetitle}>Confirmation Id</Text>
                      </View>}
                    <View style={styles.fourthHalf}>
                      <Text style={styles.title}>
                        {ticketData.Status === "Hold" ? "Pending" :
                          ticketData.Status === "Confirmed" ? "Paid" :
                            ticketData.Status === "Cancelled" ? "Refund " : ""}
                      </Text>
                      <Text style={styles.fadetitle}>Payment Status</Text>
                    </View>
                  </View>
                </View>

                {/* Hotel info */}

                <View style={styles.card} wrap={false}>
                  <View style={styles.mb}>
                    <Text style={styles.title}>Hotel Details</Text>
                    <Text style={styles.fadetitle}>
                      Here are the details of your Hotel booked from{" "}
                      {moment(ticketData.CheckInDate).format(dateFormat)} to{" "}
                      {moment(ticketData.CheckOutDate).format(dateFormat)}
                    </Text>
                  </View>

                  <View style={{ ...styles.row, ...styles.mb }}>
                    <View style={styles.fw}>
                      <Text style={styles.smallText}>
                        {ticketData.HotelName}
                      </Text>
                      <Text style={{ ...styles.fadetitle, color: "#000" }}>
                        {ticketData.CityName}
                      </Text>
                    </View>

                    <View style={styles.sw}>
                      <View style={{ ...styles.row, alignItems: "flex-start" }}>
                        <View
                          style={{
                            ...styles.width32,
                            textAlign: "center",
                          }}
                        >
                          <Text style={styles.title}>
                            {moment(ticketData.CheckInDate).format(dateFormat)}
                          </Text>
                          <Text style={styles.fadetitle}>Check In</Text>
                        </View>
                        <View
                          style={{
                            ...styles.width32,
                            margin: "5px 2px 0 0",
                            paddingRight: 5,
                          }}
                        >
                          <View style={styles.dottedBorder}>
                            <Text
                              style={{
                                ...styles.fadetitle,
                                display: "inline",
                                paddingTop: 3,
                                textAlign: "center",
                              }}
                            >
                              {ticketData.CityName}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            ...styles.width32,
                            textAlign: "center",
                          }}
                        >
                          <Text style={styles.title}>
                            {moment(ticketData.CheckOutDate).format(dateFormat)}
                          </Text>
                          <Text style={styles.fadetitle}>Check Out</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.width32}>
                      <Text style={styles.fadetitle}>Hotel Address</Text>
                      <Text style={styles.smallText}>
                        {ticketData.HotelAddress.address}
                      </Text>
                    </View>
                    <View style={styles.width32}>
                      <Text style={styles.fadetitle}>Star Rating</Text>
                      <Text style={styles.smallText}>
                        {ticketData.StarRating}
                      </Text>
                    </View>
                    <View style={styles.width32}>
                      <Text style={styles.fadetitle}>No. of Nights</Text>
                      <Text style={styles.smallText}>{noOfNights}</Text>
                    </View>
                  </View>

                  <View style={styles.row}>
                    {ticketData.Rooms.map((item, i) => (
                      <View key={i + "roomid"} style={styles.wHalf}>
                        <Text style={styles.fadetitle}>Room Name</Text>
                        <Text style={styles.smallText}>{item.roomName}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.row}>
                    {ticketData.Supplier === "AKBAR" ?
                      <View style={styles.wHalf}>
                        <Text style={styles.fadetitle}>Inclusions</Text>
                        <Text style={styles.smallText}>
                          {ticketData.Inclusions[0].boardBasis.description}
                        </Text>
                      </View>
                      :
                      <View style={styles.wHalf}>
                        <Text style={styles.fadetitle}>Inclusions</Text>
                        <Text style={styles.smallText}>
                          {ticketData.Inclusions[0].inclusions}
                        </Text>
                      </View>}
                  </View>
                </View>

                {/* Contact Details */}

                <View style={styles.card} wrap={false}>
                  <View style={styles.mb}>
                    <Text style={styles.title}>Contact Details</Text>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.width32}>
                      <Text style={styles.fadetitle}>Name</Text>
                      <Text style={styles.smallText}>
                        {ticketData.guests.length > 0
                          ? `${ticketData?.guests[0]?.FirstName} ${ticketData?.guests[0]?.LastName}`
                          : null}
                      </Text>
                    </View>

                    <View style={styles.width32}>
                      <Text style={styles.fadetitle}>Mobile Number</Text>
                      <Text style={styles.smallText}>{ticketData.phoneNo}</Text>
                    </View>
                    <View style={styles.width32}>
                      <Text style={styles.fadetitle}>Email</Text>
                      <Text style={styles.smallText}>{ticketData.email}</Text>
                    </View>
                  </View>
                </View>

                {/* pax details */}

                <View style={styles.card} wrap={false}>
                  {/* <View style={styles.mb}>
                    <Text style={styles.title}>Passengers Details</Text>
                  </View> */}
                  {Object.entries(groupedGuests).map(([roomSerialNo, guests]) => (
                    <View key={`room-${roomSerialNo}`} style={styles.mb}>
                      <View style={styles.card} wrap={false}>
                        <Text style={styles.roomTitle}>Room {roomSerialNo}</Text>
                        {guests.map((item, i) => (
                          <View style={styles.row} key={i + "pax"}>
                            <View style={styles.width32}>
                              <Text style={styles.fadetitle}>Name</Text>
                              <Text style={styles.smallText}>
                                {item.FirstName} {item.LastName}
                              </Text>
                            </View>

                            <View style={styles.width32}>
                              <Text style={styles.fadetitle}>Age</Text>
                              <Text style={styles.smallText}>{item.Age}</Text>
                            </View>

                            <View style={styles.width32}>
                              <Text style={styles.fadetitle}>Guest Type</Text>
                              <Text style={styles.smallText}>{item.GuestType}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                {/* insurance  */}

                {ticketData?.insuranceRequired === 1 &&
                  ticketData.insuranceData &&
                  ticketData?.insuranceData?.serviceType === 2 ? (
                  <View style={styles.card} wrap={false}>
                    <View style={styles.mb}>
                      <Text style={styles.title}>
                        THE SMART INSURANCE COVER
                      </Text>
                      <Text style={styles.greytext}>
                        EASY CLAIM PROCESS | NO QUESTIONS ASKED
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.width32}>
                        <View style={styles.insuranceCard}>
                          <Text style={styles.insurancetitle}>
                            {ticketData?.insuranceData.description_box_1}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.width32}>
                        <View style={styles.insuranceCard}>
                          <Text style={styles.insurancetitle}>
                            {ticketData?.insuranceData.description_box_2}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.width32}>
                        <View style={styles.insuranceCard}>
                          <Text style={styles.insurancetitle}>
                            {ticketData?.insuranceData.description_box_3}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.coverage}>
                      <Image
                        style={{ width: 10, height: 10, marginRight: 5 }}
                        src={ImBaseUrl + "images/bg/shield.png"}
                      />
                      <Text style={styles.coveragetitle}>
                        Insurance Coverage Amount :{" "}
                        {ticketData?.insuranceData.insuranceCoverage}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* fare */}
                {withFare ? (
                  <View>
                    <View style={styles.card} wrap={false}>
                      <View style={styles.mb}>
                        <Text style={styles.title}>Fare Details</Text>
                      </View>

                      <View style={{ ...styles.row, ...styles.mb8 }}>
                        <View style={styles.sw}>
                          <Text style={styles.smallText}>Base Fare</Text>
                        </View>

                        <View style={styles.fourthHalf}>
                          <Text style={styles.smallText}>{curr} {parseFloat((Number(baseAmount) / Number(value)).toFixed(2))}</Text>
                        </View>
                      </View>

                      <View style={{ ...styles.row, ...styles.mb8 }}>
                        <View style={styles.sw}>
                          <Text style={styles.smallText}>Taxes</Text>
                        </View>

                        <View style={styles.fourthHalf}>
                          <Text style={styles.smallText}>{curr} {parseFloat((Number(taxAmount) / Number(value)).toFixed(2))}</Text>
                        </View>
                      </View>
                      {convienenceFee > 0 ?
                        <View style={{ ...styles.row, ...styles.mb8 }}>
                          <View style={styles.sw}>
                            <Text style={styles.smallText}>Convenience Fee</Text>
                          </View>

                          <View style={styles.fourthHalf}>
                            <Text style={styles.smallText}>
                              {curr} {parseFloat((Number(convienenceFee) / Number(value)).toFixed(2))}
                            </Text>
                          </View>
                        </View>
                        : null}
                      {ticketData?.insuranceRequired === 1 &&
                        ticketData.insuranceData ? (
                        <View style={{ ...styles.row, ...styles.mb8 }}>
                          <View style={styles.sw}>
                            <Text style={styles.smallText}>
                              Insurance Amount
                            </Text>
                          </View>

                          <View style={styles.fourthHalf}>
                            <Text style={styles.smallText}>
                              {curr} {parseFloat((Number(insuranceTotal) / Number(value)).toFixed(2))}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                      {discount > 0 ?
                        <View style={{ ...styles.row, ...styles.mb8 }}>
                          <View style={styles.sw}>
                            <Text style={styles.smallText}>Discount</Text>
                          </View>

                          <View style={styles.fourthHalf}>
                            <Text style={styles.smallText}>{curr} {parseFloat((Number(discount) / Number(value)).toFixed(2))}</Text>
                          </View>
                        </View>
                        : null}
                      <View style={{ ...styles.row, ...styles.mb8 }}>
                        <View style={styles.sw}>
                          <Text style={styles.smallText}>Total</Text>
                        </View>

                        <View style={styles.fourthHalf}>
                          <Text style={styles.smallText}>{curr} {parseFloat(((Number(grandTotal)) / Number(value)).toFixed(2))}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : null}
                {/* terms */}
                <View>
                  <View style={styles.card} wrap={false}>
                    <View style={styles.mb}>
                      <Text style={styles.title}>Essential Information :</Text>
                    </View>

                    {cmsFareRules?.cancelPolicyDescription ? (
                      <View style={styles.termCon}>
                        <View style={styles.description}>
                          <Text
                            style={{ ...styles.smallText, marginBottom: 3 }}
                          >
                            Cancel Policy
                          </Text>

                          <Html stylesheet={csssheet}>
                            {parser(cmsFareRules?.cancelPolicyDescription)}
                          </Html>
                        </View>

                        {cmsFareRules?.covidRulesDescription ? (
                          <View style={styles.description}>
                            <Text
                              style={{ ...styles.smallText, marginBottom: 3 }}
                            >
                              Covid Policy
                            </Text>

                            <Html stylesheet={csssheet}>
                              {parser(cmsFareRules?.covidRulesDescription)}
                            </Html>
                          </View>
                        ) : null}

                        {cmsFareRules?.otherRulesDescription ? (
                          <View style={styles.description}>
                            <Text
                              style={{ ...styles.smallText, marginBottom: 3 }}
                            >
                              Other Policy
                            </Text>

                            <Html stylesheet={csssheet}>
                              {parser(cmsFareRules?.otherRulesDescription)}
                            </Html>
                          </View>
                        ) : null}
                      </View>
                    ) :
                      <>
                        {ticketData?.Inclusions[0]?.combineRooms[0]?.refundable ?
                          <View style={styles.description}>
                            <Text style={styles.title}>Cancellation Policy :</Text>
                            <Text
                              style={{ ...styles.smallText, marginBottom: 1 }}
                            >Cancellation charges from {moment(ticketData?.Inclusions[0]?.combineRooms[0]?.cancellationPolicy[0]?.fromDate).format("DD-MM-YYYY")}  to {moment(ticketData?.Inclusions[0]?.combineRooms[0]?.cancellationPolicy[0]?.toDate).format("DD-MM-YYYY , hh:mm A")}  is {curr} {ticketData?.Inclusions[0]?.combineRooms[0]?.cancellationPolicy[0]?.penaltyAmount} {ticketData?.Inclusions[0]?.combineRooms[0]?.cancellationPolicy[0]?.chargeType}, Which is Refundable
                            </Text>
                            <Text
                              style={{ ...styles.smallText, marginBottom: 2 }}
                            >{ticketData?.Inclusions[0]?.combineRooms[0]?.cancellationPolicyDescription}</Text>
                          </View> : null}
                        {ticketData?.Supplier === "AKBAR" ?
                          <View style={styles.termCon}>
                            {ticketData?.Inclusions[0]?.combineRooms[0]?.policies?.map((policy, index) => {
                              return (
                                <View style={styles.description}>
                                  <Text style={styles.title}>{policy.type} {" :"}</Text>
                                  <Text
                                    style={{ ...styles.smallText, marginBottom: 3 }}
                                  >{policy.text}</Text>



                                </View>
                              );
                            })}
                          </View> :
                          <View style={styles.termCon}>
                            <View style={styles.description}>
                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * Early check in and late check out is subject to
                                availability.
                              </Text>

                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * The passenger has to furnish a photo identity
                                and address proof at the time of verification
                                failing to which all passenger on that voucher
                                shall not be entertained with any refunds or
                                restitution.
                              </Text>

                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * Standard Check in time is 1400 hrs / check out
                                time 1200 hrs unless specified.
                              </Text>

                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * The refund for early check out or unutilized
                                night or service is subject to discretion of the
                                hotel & the supplier, we strongly recommend to get
                                a letter from the hotel favoring no charges for
                                early check out.
                              </Text>

                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * All additional charges other than the room
                                charges and inclusions as mentioned in the booking
                                voucher are to be borne and paid separately during
                                check-out. Please make sure that you are aware of
                                all such charges that may comes as extras. Some of
                                them can be WiFi costs, Mini Bar, Laundry
                                Expenses, Telephone calls, Room Service, Snacks
                                etc.
                              </Text>

                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * Voucher covers only those taxes which are
                                included in the booking price (if included), all
                                various other applicable taxes needs to be settled
                                directly by guest .
                              </Text>

                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * We are not liable for any loss or damage caused
                                during your stay in the hotel or while availing
                                any service.
                              </Text>

                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * We have no relevance with the room service or
                                food menu or any other service as these are all as
                                per the hotel standards.
                              </Text>

                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * The hotel reserves the right of admission.
                                Accommodation can be denied to guests posing as a
                                'couple' if suitable proof of identification is
                                not presented at the time of check in. we will not
                                be responsible for any check in denied by the
                                hotel due to aforesaid reason.
                              </Text>

                              <Text
                                style={{ ...styles.smallText, marginBottom: 3 }}
                              >
                                * Important: Cancellation requests on or close to the check-in date fall under the non-refundable window and are subject to hotel/supplier approval. Refunds are not guaranteed upon cancellation and cancellation charges may apply as per the booking policy.
                              </Text>
                            </View>
                          </View>}
                      </>
                    }
                  </View>
                </View>


                {/*  */}
              </View>
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

export default HotelDoc;