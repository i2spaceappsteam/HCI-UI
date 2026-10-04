import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import StarImg from "../../../assets/images/star-icon.png";
import moment from "moment";
import hotelimage from "../../../assets/images/hotel/1.jpg";

const ImBaseUrl = import.meta.env.VITE_Image_URL;

// Fixed Font registration
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

// Alternative font registration for better compatibility
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
});

Font.registerHyphenationCallback(word => [word]);

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: "Helvetica",
  },
  section: {
    padding: "0 8px",
    color: "#555",
    background: "#FFF",
    border: "3px solid #D3D3D3",
  },
  header: {
    padding: "7px 0",
    marginBottom: "5px",
  },
  company: { width: "100%", marginBottom: "5px" },
  company_wrapper: {
    width: "100%",
    marginTop: "4px",
    borderTop: "1px solid #dcd9d9",
    borderBottom: "1px solid #dcd9d9",
    borderRight: "1px solid #dcd9d9",
    borderLeft: "1px solid #dcd9d9",
  },
  company_wrapp: {
    width: "100%",
    marginTop: "4px",
    borderTop: "1px solid #dcd9d9",
    borderBottom: ".1px solid #dcd9d9",
    borderRight: ".1px solid #dcd9d9",
    borderLeft: ".1px solid #dcd9d9",
  },
  company_left: {
    width: "20%",
    padding: "3px 6px",
  },
  Company_L: {
    width: "5%",
    borderLeft: "1px solid #dcd9d9",
  },
  Company_LL: {
    width: "1%",
    borderLeft: "1px solid #dcd9d9",
  },
  company_right: {
    width: "65%",
    padding: "3px 6px",
  },
  company_h: {
    fontSize: 6,
    fontWeight: 400, // Changed from "normal" to numeric value
  },
  company_p: {
    fontSize: 8,
    fontWeight: 400, // Changed from "normal" to numeric value
  },
  invoice_h: {
    textAlign: "center",
    fontSize: "11px",
    fontWeight: 700, // Changed from "bold" to numeric value
    margin: 0,
  },
  invoice: {
    width: "100%",
  },
  invoice_origin_h: {
    fontSize: "9px",
    fontWeight: 400, // Changed from "normal" to numeric value
    width: "100%",
    marginBottom: 4,
    color: "#000",
  },
  origin: {
    width: "40%",
  },
  origin1: {
    width: "60%",
  },
  origin_title: { width: "30%", padding: "3px 6px" },
  origin_h: {
    fontSize: "8px",
    fontWeight: 700, // Changed from "bold" to numeric value
  },
  origin_p: {
    fontSize: "7px",
    fontWeight: 400, // Changed from "normal" to numeric value
  },
  origin_title1: { width: "40%", padding: "3px 6px" },
  origin_deatil1: { width: "50%", padding: "3px 6px" },
  table_p: {
    fontSize: "8px",
    fontWeight: 400, // Changed from "normal" to numeric value
    marginBottom: 0,
  },
  origin_deatil: { width: "50%", padding: "3px 6px" },
  origin_deatil_right: { width: "50%" },
  origin_title_right: { width: "50%" },
  origin_deatil2: { width: "30%", padding: "3px 6px" },
  origin_deatil3: { width: "70%" },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    flexWrap: "wrap",
  },
  table_head: {
    width: "100%",
    color: "#000",
  },
  table_des: {
    width: "30%",
    padding: "0 3px",
  },
  table_pnr: {
    width: "25%",
  },
  table_pnr2: {
    width: "35%",
  },
  table_pnr1: {
    width: "20%",
  },
  borderBottom1: { borderBottom: "1px solid grey" },
  borderBottom: { borderBottom: "1px solid #dcd9d9" },
  table_p_text: {
    padding: "2px",
    fontSize: "7px",
    fontWeight: 700, // Changed from "bolder" to numeric value
    color: "#000",
  },
  table_p1_text: {
    padding: "2px",
    fontSize: "7px",
    color: "#525151",
  },
  table_sub_index: {
    width: "10%",
    padding: "0 3px",
  },
  text_right: {
    textAlign: "right",
  },
  table_sub_wrapper: {},
  sub_table1: { marginTop: 10 },
  sub_table: {
    width: "60%",
    marginLeft: "auto",
  },
  m_0: {
    margin: 0,
  },
  p_0: {
    padding: 0,
  },
  sub_table_ph: {
    width: "40%",
    fontSize: "8px",
    fontWeight: 400, // Changed from "normal" to numeric value
    padding: "3px 6px",
  },
  boldText: {
    fontWeight: 700, // Changed from "bold" to numeric value
    color: "#000",
  },
  sub_table_pt: {
    width: "40%",
    fontSize: "8px",
    fontWeight: 400, // Changed from "normal" to numeric value
    padding: "3px 10px",
  },
  imgWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

const starIconStyle = {
  width: 10,
  height: 10,
  marginRight: 2,
};

const renderStarRating = (rating) => {
  const stars = [];
  // Ensure rating is a valid number
  const validRating = parseInt(rating) || 0;
  for (let i = 0; i < validRating; i++) {
    stars.push(<Image key={i} src={StarImg} style={starIconStyle} />);
  }
  return stars;
};

const getNumberOfNights = (checkInDate, checkOutDate) => {
  const checkIn = moment(checkInDate);
  const checkOut = moment(checkOutDate);
  return checkOut.diff(checkIn, "days");
};

// Safe number parsing function
const safeParseFloat = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === "") return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const HotelNewInvoiceDoc = ({ invoiceData, type }) => {
  // Add safety checks for invoiceData
  if (!invoiceData) {
    return (
      <Document>
        <Page size="LETTER" style={styles.page}>
          <Text>No invoice data available</Text>
        </Page>
      </Document>
    );
  }

  let {
    baseAmount,
    taxAmount,
    convienenceFee,
    discount,
    grandTotal,
    insuranceTotal,
    noOfNights,
  } = getHotelPricce(invoiceData);

  // Add safety checks for calculated values using safe parsing
  baseAmount = safeParseFloat(baseAmount);
  taxAmount = safeParseFloat(taxAmount);
  convienenceFee = safeParseFloat(convienenceFee);
  discount = safeParseFloat(discount);
  grandTotal = safeParseFloat(grandTotal);
  insuranceTotal = safeParseFloat(insuranceTotal);
  
  const currencyRatio = safeParseFloat(invoiceData?.CurrencyRatio, 1);
  const currency = invoiceData?.Currency || "USD";

  // Safe value calculations
  const baseAmountConverted = safeParseFloat(baseAmount / currencyRatio);
  const taxAndFeeConverted = safeParseFloat((taxAmount + convienenceFee) / currencyRatio);
  const discountConverted = safeParseFloat(discount / currencyRatio);
  const grandTotalConverted = safeParseFloat(grandTotal / currencyRatio);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.invoice_origin_h}>
          <Text style={styles.invoice_origin_h}>
            {moment(invoiceData?.CreatedOn).format("DD/MM/YYYY HH:mm")}
          </Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.header}>
            {/* Company Header */}
            <View style={{ ...styles.company_wrapper, ...styles.row }}>
              <View style={{ ...styles.company_left, ...styles.row }}>
                <View style={styles.origin_deatil2}>
                  {/* Logo can go here */}
                </View>
              </View>
              <View style={styles.Company_L}></View>
              <View>
                <View style={{...styles.origin_deatil3, paddingTop: 5, paddingRight: 15}}>
                  <Text style={{ ...styles.company_h, color: "#000", fontSize: 7 }}>
                    <Text style={{...styles.boldText, fontSize: 9, textAlign: "left"}}>
                      {invoiceData.adminDetails && invoiceData.adminDetails.length > 0
                        ? invoiceData.adminDetails[0].CompanyName
                        : invoiceData.agentDetails?.AgencyName || "N/A"}
                    </Text>
                  </Text>
                  <View>
                    <Text style={{ ...styles.company_h, color: "#000", fontSize: 7, textAlign: "left" }}>
                      {invoiceData.adminDetails && invoiceData.adminDetails.length > 0
                        ? invoiceData.adminDetails[0].Address
                        : invoiceData.agentDetails?.Address2 || "N/A"} | {" "}
                      {invoiceData.adminDetails && invoiceData.adminDetails.length > 0
                        ? invoiceData.adminDetails[0].CityName
                        : invoiceData.agentDetails?.City || "N/A"} | {" "}
                      {invoiceData.adminDetails && invoiceData.adminDetails.length > 0
                        ? invoiceData.adminDetails[0].CountryName
                        : invoiceData.agentDetails?.Country || "N/A"} | Phone: {" "}
                      {invoiceData.adminDetails && invoiceData.adminDetails.length > 0
                        ? invoiceData.adminDetails[0].PhoneNumber
                        : invoiceData.agentDetails?.Phone || "N/A"} | Email: {" "}
                      {invoiceData.adminDetails && invoiceData.adminDetails.length > 0
                        ? invoiceData.adminDetails[0].Email
                        : invoiceData.agentDetails?.Email || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Invoice Title */}
            <View style={{ ...styles.invoice, marginTop: 10, marginBottom: 10, ...styles.boldText }}>
              <Text style={styles.invoice_h}>Invoice</Text>
            </View>

            {/* Customer Details */}
            <View style={{ ...styles.company_wrapper, ...styles.row }}>
              <View style={{ marginLeft: 5, flexDirection: "row", marginTop: 5, marginBottom: 5 }}>
                <View style={styles.origin_title_right}>
                  <Text style={{ ...styles.origin_h, fontWeight: 700, color: "#000", fontSize: 11 }}>
                    {invoiceData.guests?.[0]?.FirstName || "N/A"}
                  </Text>
                </View>
              </View>
             
              <View style={{ ...styles.origin_wrapper, ...styles.row }}>
                <View style={{ ...styles.origin, ...styles.row, marginLeft: 5 }}>
                  <View style={styles.origin_title_right}>
                    <Text style={{ ...styles.origin_h, marginBottom: 2, marginTop: 5 }}>Phone </Text>
                  </View>
                  <View style={styles.origin_title_right}>
                    <Text style={{...styles.origin_p, marginBottom: 2, marginTop: 5}}>: {invoiceData?.phoneNo || "N/A"}</Text>
                  </View>
                  <View style={styles.origin_title_right}>
                    <Text style={{ ...styles.origin_h, marginBottom: 2 }}>Email </Text>
                  </View>
                  <View style={styles.origin_title_right}>
                    <Text style={{...styles.origin_p, marginBottom: 2}}>: {invoiceData?.email || "N/A"}</Text>
                  </View>
                  <View style={styles.origin_title_right}>
                    <Text style={{ ...styles.origin_h, marginBottom: 2 }}>Customer GSTIN </Text>
                  </View>
                  <View style={styles.origin_title_right}>
                    <Text style={{...styles.origin_p, marginBottom: 2}}>: N/A</Text>
                  </View>
                  <View style={styles.origin_title_right}>
                    <Text style={{ ...styles.origin_h, marginBottom: 2 }}>Customer PAN </Text>
                  </View>
                  <View style={styles.origin_title_right}>
                    <Text style={{...styles.origin_p, marginBottom: 2}}>
                      : {invoiceData?.guests?.[0]?.Pan || "N/A"}
                    </Text>
                  </View>
                </View>
                
                <View style={{ ...styles.origin, ...styles.row }}>
                  <View style={styles.origin_title_right}>
                    <Text style={{ ...styles.origin_h, marginBottom: 2, marginTop: 5 }}>Invoice Date</Text>
                  </View>
                  <View style={styles.origin_deatil_right}>
                    <Text style={{...styles.origin_p, marginBottom: 2, marginTop: 5}}>
                      : {moment(invoiceData?.BookingDate).format("DD-MM-YYYY")}
                    </Text>
                  </View>
                  
                  {invoiceData?.invoiceNo && (
                    <>
                      <View style={styles.origin_title_right}>
                        <Text style={{ ...styles.origin_h, marginBottom: 2 }}>Invoice No</Text>
                      </View>
                      <View style={styles.origin_deatil_right}>
                        <Text style={{ ...styles.origin_p, marginBottom: 2 }}>: {invoiceData?.invoiceNo}</Text>
                      </View>
                    </>
                  )}
                  
                  <View style={styles.origin_title_right}>
                    <Text style={{ ...styles.origin_h, marginBottom: 2 }}>Booking Id</Text>
                  </View>
                  <View style={styles.origin_deatil_right}>
                    <Text style={{...styles.origin_p, marginBottom: 2}}>
                      : {invoiceData?.RefNumber || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.origin_title_right}>
                    <Text style={{ ...styles.origin_h, marginBottom: 2 }}>Reference No</Text>
                  </View>
                  <View style={styles.origin_deatil_right}>
                    <Text style={{...styles.origin_p, marginBottom: 2}}>
                      : {invoiceData?.ConfirmationNumber || "N/A"}
                    </Text>
                  </View>
                  
                  <View style={styles.origin_title_right}>
                    <Text style={{ ...styles.origin_h, marginBottom: 2 }}>Hotel Booking No</Text>
                  </View>
                  <View style={styles.origin_deatil_right}>
                    <Text style={{...styles.origin_p, marginBottom: 2}}>
                      : {invoiceData?.supplierBookingNo || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Hotel Details */}
            <View style={{ ...styles.company_wrapper }}>
              <View style={{ flexDirection: "row" }}>
                <View>
                  <Image src={hotelimage} style={{ height: 100, width: 100, marginBottom: 3 }}/>
                </View>
                
                <View style={{ marginLeft: 10, flex: 1, marginTop: 10 }}>
                  <Text style={{ fontSize: 10, fontWeight: 700, ...styles.boldText }}>
                    {invoiceData.HotelName || "N/A"} {" "}
                    {renderStarRating(parseInt(invoiceData.StarRating || 0, 10))}
                  </Text>
                  
                  <Text style={{ fontSize: 8, fontWeight: 700, color: "#000", margin: 2 }}>
                    Address: {invoiceData.HotelAddress?.address || "N/A"}
                  </Text>
                  
                  <Text style={{ fontSize: 8, fontWeight: 700, color: "#000", margin: 2 }}>
                    Phone: {invoiceData.HotelContact?.phone || "Not Available"}
                  </Text>
                  
                  <View style={{ marginTop: 10, flexDirection: "row", ...styles.company_wrapp }}>
                    <Text style={{ fontSize: 8, color: "#000", margin: 10 }}>
                      Check-In: {moment(invoiceData.CheckInDate).format("MMM DD, YYYY")}
                    </Text>
                    <View style={styles.Company_L}></View>
                    <Text style={{ fontSize: 8, color: "#000", margin: 10, marginRight: 40 }}>
                      Check-Out: {moment(invoiceData.CheckOutDate).format("MMM DD, YYYY")}
                    </Text>
                    <View style={styles.Company_L}></View>
                    <Text style={{ fontSize: 8, margin: 10, color: "#000" }}>
                      {getNumberOfNights(invoiceData.CheckInDate, invoiceData.CheckOutDate)} Nights | No. of Rooms: {invoiceData.NoOfRooms || 1}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Room Details */}
            <View style={{ marginBottom: 5, marginTop: 3 }}>
              <View style={styles.origin_title_right}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>Room Details</Text>
              </View>
            </View>
            
            {invoiceData.Rooms?.map((room, index) => (
              <View key={index}>
                <Text style={{ fontSize: 10, fontWeight: 700, marginTop: 3, color: "#000" }}>
                  Room {index + 1}:
                </Text>
                
                <View style={{ ...styles.company_wrapper }}>
                  <Text style={{ fontSize: 11, ...styles.boldText, color: "#000", margin: 5 }}>
                    Guest Details:
                  </Text>
                  
                  {invoiceData.guests
                    ?.filter((guest) => Number(guest.RoomSerialNo) === Number(room.roomSerialNo))
                    .slice(0, 1)
                    .map((guest, guestIndex) => (
                      <Text key={guestIndex} style={{ fontSize: 10, margin: 5, color: "#000" }}>
                        {guest.FirstName} {guest.LastName}
                      </Text>
                    ))}
                  
                  <View style={{ ...styles.borderBottom }}></View>
                  
                  {room && (
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ fontSize: 9, ...styles.boldText, margin: 10, width: "30%" }}>
                        {room.roomName?.split(",").slice(0, 1).join(",") || "N/A"}
                      </Text>
                      
                      <View style={styles.Company_L}></View>
                      
                      <View style={{ width: "30%", paddingTop: 4 }}>
                        <Text style={{ fontSize: 9, ...styles.boldText }}>
                          Adults Count: {room.adultCount || 0}
                        </Text>
                        <Text style={{ fontSize: 9, ...styles.boldText }}>
                          Child Count: {room.childCount || 0}
                        </Text>
                      </View>
                      
                      <View style={styles.Company_L}></View>
                      
                      <View style={{ width: "30%" }}>
                        <Text style={{ fontSize: 9, ...styles.boldText }}>Inclusions:</Text>
                        {invoiceData.Inclusions ? (
                          <Text style={{ fontSize: 10, margin: 5, color: "#000" }}>
                            {invoiceData.Inclusions[0]?.inclusions === null 
                              ? invoiceData.Inclusions[0]?.boardBasis?.description 
                              : invoiceData.Inclusions[0]?.inclusions?.join(", ") || "No inclusions"}
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 10, margin: 5, color: "#000" }}>
                            No inclusions available
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* Payment Details */}
            <View style={{ marginBottom: 3, marginTop: 3 }}>
              <View style={styles.origin_title_right}>
                <Text style={{ ...styles.origin_h, fontSize: 10 }}>Payment Details</Text>
              </View>
            </View>
           
            <View style={styles.table_head}>
              <View style={{ ...styles.row, ...styles.m_0 }}>
                <View style={styles.table_pnr}>
                  <Text style={{...styles.table_p_text, color: "#2b3f99", fontSize: 9}}>ROOM TARIFF</Text>
                </View>

                <View style={styles.table_pnr2}>
                  <Text style={{...styles.table_p_text, color: "#2b3f99", fontSize: 9, textAlign: "right"}}>
                    TAX RECOVERY CHARGES AND SERVICE FEES
                  </Text>
                </View>
                
                <View style={styles.table_pnr1}>
                  <Text style={{...styles.table_p_text, color: "#2b3f99", fontSize: 9, textAlign: "right"}}>DISCOUNTS</Text>
                </View>
                
                <View style={styles.table_pnr1}>
                  <Text style={{...styles.table_p_text, color: "#2b3f99", fontSize: 9, textAlign: "right"}}>TOTAL</Text>
                </View>
              </View>
              
              <View style={{ ...styles.row, ...styles.m_0, ...styles.borderBottom1 }}>
                <View style={styles.table_pnr}>
                  <Text style={{...styles.table_p1_text, ...styles.boldText, fontSize: 8}}>
                    {invoiceData.Rooms?.[0]?.roomName?.split(",").slice(0, 1).join(",") || "N/A"} ({invoiceData.NoOfRooms || 1}* {currency} {baseAmountConverted.toFixed(2)})
                  </Text>
                </View>

                <View style={styles.table_pnr2}>
                  <Text style={{...styles.table_p1_text, ...styles.boldText, fontSize: 8, textAlign: "right"}}>
                    {currency} {taxAndFeeConverted.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.table_pnr1}>
                  <Text style={{...styles.table_p1_text, ...styles.boldText, fontSize: 8, textAlign: "right"}}>
                    {currency} {discountConverted.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.table_pnr1}>
                  <Text style={{...styles.table_p1_text, ...styles.boldText, fontSize: 8, textAlign: "right"}}>
                    {currency} {grandTotalConverted.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sub_table1}>
              <Text style={{ alignSelf: 'flex-end', ...styles.boldText, fontSize: 13, marginRight: 0, textAlign: "right" }}>
                Total Net Fare: <Text style={{textAlign: "right"}}>{currency} {grandTotalConverted.toFixed(2)}</Text>
              </Text>
            </View>
            
            <View style={{ marginTop: "20px", width: "100%" }}>
              <Text style={{ fontSize: "9px", color: "#000" }}>
                <Text style={{...styles.boldText}}>Note:</Text> This is an electronically generated invoice and does not require a physical signature
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default HotelNewInvoiceDoc;