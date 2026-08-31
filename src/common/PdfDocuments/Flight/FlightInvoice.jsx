import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import { getFlightPrices } from "../../AllTickets/Flight/flightHelper";
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    padding: 20,
  },
  section: {
    padding: "0 8px",
    color: "#555",
    background: "#FFF",
    border: "3px solid #D3D3D3",
    marginTop: "30px",
  },
  header: {
    padding: "7px 0",
    marginBottom: "10px",
  },
  company: { width: "100%", marginBottom: "20px" },
  company_h: {
    textAlign: "right",
    fontSize: "10px",
    fontWeight: "normal",
    margin: 0,
    color: "#E32025",
  },
  company_p: {
    textAlign: "right",
    fontSize: "8px",
    fontWeight: "normal",
    margin: 0,
    color: "#E32025",
  },
  company_wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "100%",
  },
  company_left: {
    width: "50%",
   
  },
  company_right: {
    width: "50%",
    textAlign: "right",
    alignItems: "flex-end",
    
  },
  
 
 
  company_p1: {
    fontSize: 6,
    fontWeight: "bold",
  },
  invoice_h: {
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "bold",
    margin: 0,
  },
  invoice: {
    width: "100%",
  },
  invoice_origin_h: {
    fontSize: "9px",
    fontWeight: "normal",
    width: "100%",
    marginBottom: 10,
    color: "#000",
  },
  origin: {
    width: "40%",
  },
  origin_title: { width: "20%", padding: "3px 6px" },
  origin_h: {
    fontSize: "8px",
    fontWeight: "bold",
  },
  origin_p: {
    fontSize: "8px",
    fontWeight: "normal",
  },
  table_p: {
    fontSize: "8px",
    fontWeight: "normal",
    marginBottom: 0,
  },
  origin_deatil: { width: "80%", padding: "3px 6px" },
  origin_deatil_right: { width: "50%" },
  origin_title_right: { width: "50%" },
  origin_wrapper: {},
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  table_wrapper: {
    // height: 270
  },
  table_head: {
    width: "100%",
    //backgroundColor: "#5da0e9",
    color: "#000",
    padding: "3px 6px",
    //border: "1px solid #000",
  },
  table_sub_head: {
    width: "100%",
    //backgroundColor: "#5da0e9",
    color: "#000",
    padding: "3px 6px",
    //border: "1px solid #000",
  },
  table_body: {
    width: "100%",

    padding: "3px 6px",
  },
  table_sub_body: {
    width: "100%",

    padding: "3px 6px",
  },
  table_index: {
    width: "10%",
    // borderRight: "1px solid black",
    padding: "0 3px",
  },
  table_des: {
    width: "30%",
    //  borderRight: "1px solid black",
    padding: "0 3px",
  },
  table_pnr: {
    width: "10%",
    //  borderRight: "1px solid black",
    padding: "0 3px",
  },
  table_sub_index: {
    width: "10%",

    padding: "0 3px",
  },
  table_sub_des: {
    width: "60%",
    // borderRight: "1px solid black",
    padding: "0 3px",
  },
  table_sub_des1: {
    width: "40%",
    // borderRight: "1px solid black",
    padding: "0 3px",
  },
  table_amount: {
    width: "20%",

    padding: "0 3px",
  },
  table_sub_amount: {
    width: "30%",

    padding: "0 3px",
  },
  text_right: {
    textAlign: "right",
  },
  table_sub_wrapper: {},
  for_h: {
    width: "100%",
    fontSize: 10,
    // color: "#E32025",
    marginBottom: 1,
  },
  borderBottom: { borderBottom: "1px solid grey" },
  bank_wrapper: {},
  bank_details: { width: "50%" },
  bank_h: {
    width: "10%",
    fontSize: 10,
    // color: "#E32025",
    marginBottom: 4,
    borderBottom: "1px solid #E32025",
  },
  boldBlueText: {
    fontWeight: "bold",
    color: "#0056b3",
  },
  boldText: {
    fontWeight: "bold",
    color: "#000",
  },
  bank_index: {
    width: "40%",
    marginBottom: 0,
  },
  bank_des: {
    width: "60%",
  },
  bank_p: {
    fontSize: 8,
  },
  terms_wrapper: {},
  terms_details: { width: "100%" },
  terms_h: {
    width: "100%",
    fontSize: 8,
    color: "#E32025",
    marginBottom: 4,
  },
  terms_index: {
    width: "20%",
    marginBottom: 0,
  },
  terms_des: {
    width: "80%",
  },
  terms_p: {
    fontSize: 6,
    marginBottom: 0,
  },
});

const getTotalPrice = (data) => {
  var total = data.totalPrice;
  if (data.postMarkup) {
    total = total + data.postMarkup;
  }
  return total;
};

const FlightInvoiceDoc = ({ invoiceData }) => {
  let {
    baseAmount,
    taxAmount,
    convienenceFee,
    discount,
    RefundAmount,
    grandTotal,
    totalmeal,
    totalbagg,
    insuranceTotal,
    totalwithtax,
    ssrAmount,
    agentTax
  } = getFlightPrices(invoiceData);

  if (invoiceData?.fareBreakups && Array.isArray(invoiceData.fareBreakups) && invoiceData.fareBreakups.length > 0) {
    baseAmount = invoiceData.fareBreakups.reduce((sum, item) => sum + (Number(item.baseFare) || 0), 0);
    
    const totalBreakupsSum = invoiceData.fareBreakups.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const bookingTotal = Number(invoiceData.totalAmount || invoiceData.totalPrice || 0);
    let calculatedConvenienceFee = 0;
    
    if (bookingTotal > totalBreakupsSum) {
      calculatedConvenienceFee = bookingTotal - totalBreakupsSum;
    }
    
    convienenceFee = 0;
    taxAmount = invoiceData.fareBreakups.reduce((sum, item) => sum + (Number(item.total) || 0) - (Number(item.baseFare) || 0), 0) + calculatedConvenienceFee;
    grandTotal = baseAmount + taxAmount + convienenceFee;
    totalwithtax = Number(baseAmount) + Number(taxAmount) - Number(discount || 0) + Number(agentTax || 0);
  }

  if (invoiceData?.ssrs && Array.isArray(invoiceData.ssrs)) {
    let newMeal = 0, newBagg = 0, newSeat = 0;
    invoiceData.ssrs.forEach(ssr => {
      const amount = Number(ssr.amount) || 0;
      if (ssr.type === "MEAL") newMeal += amount;
      else if (ssr.type === "BAGGAGE") newBagg += amount;
      else if (ssr.type === "SEAT") newSeat += amount;
    });
    if (newMeal > 0 || totalmeal === undefined) totalmeal = newMeal;
    if (newBagg > 0 || totalbagg === undefined) totalbagg = newBagg;
    ssrAmount = Number(totalbagg || 0) + Number(totalmeal || 0);
  }
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={{ ...styles.invoice_origin_h }}>
            {dayjs(invoiceData?.CreatedOn).format("DD/MM/YYYY HH:MM")}
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.header}>
            <View style={{ ...styles.company_wrapper }}>
              <View style={{ ...styles.company_left}}>
                <View style={styles.origin_deatil}>
                  <Text
                    style={{
                      ...styles.company_p,
                      marginTop: 35,
                      ...styles.boldText,
                    }}
                  >
                    {invoiceData.adminDetails &&
                    invoiceData.adminDetails.length > 0
                      ? invoiceData?.adminDetails[0]?.CompanyName
                      : invoiceData?.agentDetails?.AgencyName}
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.company_right}}>
                <View style={styles.origin_deatil}>
                  <Text style={{ ...styles.company_h, ...styles.boldBlueText }}>
                    {invoiceData.adminDetails &&
                    invoiceData.adminDetails.length > 0
                      ? invoiceData?.adminDetails[0]?.CompanyName
                      : invoiceData?.agentDetails?.AgencyName}
                  </Text>
                </View>
                <View style={styles.origin_deatil}>
                  <Text style={{ ...styles.company_p, color: "#000" }}>
                    {invoiceData.adminDetails &&
                    invoiceData.adminDetails.length > 0
                      ? invoiceData?.adminDetails[0]?.Address
                      : invoiceData?.agentDetails?.Address2}{" "}
                  </Text>
                </View>
                <View style={styles.origin_deatil}>
                  <Text style={{ ...styles.company_p, color: "#000" }}>
                    {invoiceData?.adminDetails &&
                    invoiceData.adminDetails.length > 0
                      ? invoiceData?.adminDetails[0]?.CityName
                      : invoiceData?.agentDetails?.City}
                  </Text>
                </View>
                {/* <View style={styles.origin_deatil}>
                <Text style={styles.company_h}>
                  {invoiceData.adminDetails &&
                  invoiceData.adminDetails.length > 0
                    ? invoiceData.adminDetails[0].StateName
                    : invoiceData.agentDetails.State}
                </Text>
              </View> */}
                <View style={styles.origin_deatil}>
                  <Text style={{ ...styles.company_p, color: "#000" }}>
                    {invoiceData.adminDetails &&
                    invoiceData?.adminDetails.length > 0
                      ? invoiceData?.adminDetails[0]?.CountryName
                      : invoiceData?.agentDetails?.Country}
                  </Text>
                </View>
                <View style={styles.origin_deatil}>
                  <Text style={{ ...styles.company_p, color: "#000" }}>
                    phone:
                    {invoiceData.adminDetails &&
                    invoiceData.adminDetails.length > 0
                      ? invoiceData?.adminDetails[0]?.PhoneNumber
                      : invoiceData?.agentDetails?.Phone}
                    , Email:
                    {invoiceData.adminDetails &&
                    invoiceData.adminDetails.length > 0
                      ? invoiceData?.adminDetails[0]?.Email
                      : invoiceData?.agentDetails?.Email}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                ...styles.invoice,
                marginTop: 10,
                marginBottom: 10,
                ...styles.boldText,
              }}
            >
              <Text style={styles.invoice_h}>Invoice</Text>
            </View>
            <View style={{ ...styles.origin_wrapper, ...styles.row }}>
              <View style={{ ...styles.origin, ...styles.row }}>
                <View style={styles.origin_title_right}>
                  <Text style={{ ...styles.origin_h, ...styles.boldText }}>
                    {" "}
                    Invoice To{" "}
                  </Text>
                </View>
                <View style={styles.origin_title_right}>
                  <Text style={styles.origin_p}>
                    : {invoiceData?.passengers[0]?.firstName}
                    {"  "}
                    {invoiceData?.passengers[0]?.lastName}
                  </Text>
                </View>
                <View style={styles.origin_title_right}>
                  <Text style={{ ...styles.origin_h, ...styles.boldText }}>
                    {" "}
                    Address{" "}
                  </Text>
                </View>
                <View style={styles.origin_title_right}>
                  <Text style={styles.origin_p}>
                    : {invoiceData?.passengers[0]?.address}
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.origin, ...styles.row }}>
                <View style={styles.origin_title_right}>
                  <Text style={{ ...styles.origin_h, ...styles.boldText }}>
                    Invoice No.
                  </Text>
                </View>
                <View style={styles.origin_deatil_right}>
                  <Text style={styles.origin_p}>
                    : {invoiceData?.invoiceNo}
                  </Text>
                </View>
                <View style={styles.origin_title_right}>
                  <Text style={{ ...styles.origin_h, ...styles.boldText }}>
                    Date.
                  </Text>
                </View>
                <View style={styles.origin_deatil_right}>
                  <Text style={styles.origin_p}>
                    : {dayjs(invoiceData?.bookingDate).format("DD-MM-YYYY")}
                  </Text>
                </View>

                <View style={styles.origin_title_right}>
                  <Text style={{ ...styles.origin_h, ...styles.boldText }}>
                    Reference No.
                  </Text>
                </View>
                <View style={styles.origin_deatil_right}>
                  <Text style={styles.origin_p}>
                    : {invoiceData?.referenceNumber}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{ marginBottom: 10, marginTop: 10, ...styles.boldText }}
            >
              {invoiceData.tripType === "oneWay" ||
              invoiceData.tripType === "roundTrip"
                ? invoiceData.oneWaySegment.map((segment, index) => (
                    <View key={index} style={styles.origin_title_right}>
                      <Text style={{ ...styles.origin_h, fontWeight: "bold" }}>
                        {segment.originCity} to {segment.destinationCity} (
                        {invoiceData.tripType})
                      </Text>
                    </View>
                  ))
                : null}
              {invoiceData.tripType === "roundTrip"
                ? invoiceData.returnSegment.map((segment, index) => (
                    <View key={index} style={styles.origin_title_right}>
                      <Text style={{ ...styles.origin_h, fontWeight: "bold" }}>
                        {segment.originCity} to {segment.destinationCity} (
                        {invoiceData.tripType})
                      </Text>
                    </View>
                  ))
                : null}
              {invoiceData.tripType === "multidestination"
                ? invoiceData.multiDestinationSegment.map((segment, index) => (
                    <View key={index} style={styles.origin_title_right}>
                      <Text style={{ ...styles.origin_h, fontWeight: "bold" }}>
                        {segment[0]?.originCity} to{" "}
                        {segment[segment.length - 1]?.destinationCity}
                      </Text>
                    </View>
                  ))
                : null}
            </View>

            <View style={{ ...styles.company_wrapper, ...styles.row }}>
              <View style={{ ...styles.company_left, ...styles.row }}>
                <View style={styles.origin_deatil}>
                  <Text style={{ ...styles.company_h, ...styles.boldText }}>
                    Flight Details
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.company_right, ...styles.row }}>
                <View style={styles.origin_deatil}>
                  <Text style={{ ...styles.company_h, ...styles.boldText }}>
                    PNR Number
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ ...styles.company_wrapper, ...styles.row }}>
              <View style={{ ...styles.company_left, ...styles.row }}>
                {invoiceData.tripType === "oneWay" ? (
                  <View style={styles.origin_deatil}>
                    <Text style={{ ...styles.origin_p, ...styles.boldText }}>
                      {invoiceData.oneWaySegment[0]?.airlineName} -{" "}
                      {dayjs(invoiceData.journeyDate).format(
                        "DD-MM-YYYY HH:MM"
                      )}{" "}
                      (onward)
                    </Text>
                  </View>
                ) : null}
                {invoiceData.tripType === "roundTrip" ? (
                  <>
                    <View style={styles.origin_deatil}>
                      <Text style={{ ...styles.origin_p, ...styles.boldText }}>
                        {invoiceData.oneWaySegment[0]?.airlineName} -{" "}
                        {dayjs(invoiceData.journeyDate).format("DD-MM-YYYY")}{" "}
                        (onward)
                      </Text>
                    </View>
                    <View style={styles.origin_deatil}>
                      <Text style={{ ...styles.origin_p, ...styles.boldText }}>
                        {invoiceData.returnSegment[0]?.airlineName} -{" "}
                        {dayjs(invoiceData.journeyDate).format("DD-MM-YYYY")}{" "}
                        (return)
                      </Text>
                    </View>
                  </>
                ) : null}
                 {invoiceData.tripType === "multidestination" ? (
                  <View style={styles.origin_deatil}>
                    <Text style={{ ...styles.origin_p, ...styles.boldText }}>
                      {invoiceData.oneWaySegment[0]?.airlineName} -{" "}
                      {dayjs(invoiceData.journeyDate).format(
                        "DD-MM-YYYY HH:MM"
                      )}{" "}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={{ ...styles.company_right, ...styles.row }}>
                {invoiceData.mappingType === "COMBINED" ? (
                  <View style={styles.origin_deatil}>
                    <Text style={styles.origin_h}>
                      <Text style={{ ...styles.boldText }}>Pnr :</Text>
                      {invoiceData.pnr}
                    </Text>
                  </View>
                ) : null}
                {invoiceData.mappingType === "SEPARATE" ? (
                  <View style={styles.origin_deatil}>
                    <Text style={styles.origin_h}>
                      <Text style={{ ...styles.boldText }}>Onward PNR:</Text>{" "}
                      {invoiceData.pnr.split("~")[0]}
                    </Text>
                  </View>
                ) : null}

                {invoiceData.mappingType === "SEPARATE" ? (
                  <View style={styles.origin_deatil}>
                    <Text style={styles.origin_h}>
                      <Text style={{ ...styles.boldText }}>Return PNR:</Text>{" "}
                      {invoiceData.pnr.split("~")[1]}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View>
              <View style={{ ...styles.table_wrapper, ...styles.row }}>
                <View style={{ ...styles.table_head, ...styles.row }}>
                  <View style={styles.table_index}>
                    <Text style={{ ...styles.origin_p, ...styles.boldText }}>
                      TicketNo.
                    </Text>
                  </View>
                  <View style={styles.table_des}>
                    <Text style={{ ...styles.origin_p, ...styles.boldText }}>
                      Pax Name
                    </Text>
                  </View>
                  <View style={styles.table_pnr}>
                    <Text style={{ ...styles.origin_p, ...styles.boldText }}>
                      Base Fare
                    </Text>
                  </View>
                  <View style={styles.table_pnr}>
                    <Text style={{ ...styles.origin_p, ...styles.boldText }}>
                      Taxes
                    </Text>
                  </View>
                  <View style={styles.table_pnr}>
                    <Text style={{ ...styles.origin_p, ...styles.boldText }}>
                      Discount
                    </Text>
                  </View>
                  <View style={styles.table_amount}>
                    <Text
                      style={{
                        ...styles.origin_p,
                        ...styles.text_right,
                        ...styles.boldText,
                      }}
                    >
                      Amount
                    </Text>
                  </View>
                </View>

                <>
                  <View style={{ ...styles.table_body, ...styles.row }}>
                    <View style={styles.table_index}>
                      <Text style={styles.origin_p}>{invoiceData?.referenceNumber}</Text>
                    </View>
                    <View style={styles.table_des}>
                      <Text style={styles.origin_p}>
                        {invoiceData?.passengers[0]?.firstName}{" "}
                        {invoiceData?.passengers[0]?.lastName}
                      </Text>
                    </View>
                    <View style={styles.table_pnr}>
                      
                     
                        <Text style={styles.origin_p}>
                        {invoiceData?.currency} {parseFloat((Number(baseAmount) * Number(invoiceData?.currencyRatio)).toFixed(2))}
                        </Text>
                     
                       
                    </View>
                    <View style={styles.table_pnr}>
                      <Text style={styles.origin_p}>{invoiceData?.currency} {parseFloat(((Number(taxAmount)+ Number(agentTax)) * Number(invoiceData?.currencyRatio)).toFixed(2))}</Text>
                    </View>
                    <View style={styles.table_pnr}>
                      <Text style={styles.origin_p}> {invoiceData?.currency} {parseFloat((Number(discount) * Number(invoiceData?.currencyRatio)).toFixed(2))}</Text>
                    </View>
                    <View style={styles.table_amount}>
                      <Text
                        style={{ ...styles.origin_p, ...styles.text_right }}
                      >
                       {invoiceData?.currency} {parseFloat((Number(totalwithtax) * Number(invoiceData?.currencyRatio)).toFixed(2))}
                      </Text>
                    </View>
                  </View>
                </>
              </View>
              <View style={{ ...styles.borderBottom }}></View>
              <View style={{ ...styles.table_sub_wrapper, ...styles.row }}>
                <View style={{ ...styles.table_sub_head, ...styles.row }}>
                  <View style={styles.table_sub_index}>
                    <Text style={styles.table_p}></Text>
                  </View>
                  {/* <View style={styles.table_sub_des}>
                  <Text style={{ ...styles.table_p, ...styles.text_right }}>
                    Sub-Total
                  </Text>
                </View>
                <View style={styles.table_sub_amount}>
                  <Text style={{ ...styles.table_p, ...styles.text_right }}>
                    AED :{invoiceData?.subTotal}
                  </Text>
                </View> */}
                </View>
                {/* <View style={{ ...styles.table_sub_body, ...styles.row }}>
                  <View style={styles.table_sub_index}>
                    <Text style={styles.table_p}></Text>
                  </View>
                  <View style={styles.table_sub_des1}>
                    <Text
                      style={{
                        ...styles.table_p,
                        ...styles.text_right,
                        ...styles.boldText,
                      }}
                    >
                      Total Vat : 0
                    </Text>
                  </View>
                </View> */}
                {ssrAmount > 0 ? (
                  
               
                <View style={{ ...styles.table_sub_body, ...styles.row }}>
                  <View style={styles.table_sub_index}>
                    <Text style={styles.table_p}></Text>
                  </View>
                  <View style={styles.table_sub_des1}>
                    <Text
                      style={{
                        ...styles.table_p,
                        ...styles.text_right,
                        ...styles.boldText,
                      }}
                    >
                      SSR (Add-on) : {invoiceData?.currency} {parseFloat((Number(ssrAmount) * Number(invoiceData?.currencyRatio)).toFixed(2))}
                    </Text>
                  </View>
                </View>
                 ) : null}
                 {convienenceFee > 0 ? (
                  
               
                  <View style={{ ...styles.table_sub_body, ...styles.row }}>
                    <View style={styles.table_sub_index}>
                      <Text style={styles.table_p}></Text>
                    </View>
                    <View style={styles.table_sub_des1}>
                      <Text
                        style={{
                          ...styles.table_p,
                          ...styles.text_right,
                          ...styles.boldText,
                        }}
                      >
                        ConvienenceFee : {invoiceData?.currency} {parseFloat((Number(convienenceFee) * Number(invoiceData?.currencyRatio)).toFixed(2))}
                      </Text>
                    </View>
                  </View>
                   ) : null}
                <View style={{ ...styles.table_sub_body, ...styles.row }}>
                  <View style={styles.table_sub_index}>
                    <Text style={styles.table_p}></Text>
                  </View>
                  <View style={styles.table_sub_des1}>
                    <Text
                      style={{
                        ...styles.table_p,
                        ...styles.text_right,
                        ...styles.boldText,
                      }}
                    >
                      GrandTotal: {invoiceData?.currency} {parseFloat((Number(grandTotal) * Number(invoiceData?.currencyRatio)).toFixed(2))}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ ...styles.borderBottom }}></View>
              <View>
                <View
                  style={{
                    ...styles.sub_table1,
                    marginBottom: 5,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ alignSelf: "flex-end", fontSize: 10 }}>
                    Net Fare :  {invoiceData?.currency} {parseFloat((Number(grandTotal) * Number(invoiceData?.currencyRatio)).toFixed(2))}
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.borderBottom }}></View>
              <View>
                <View style={{ marginTop: "20px", width: "100%" }}>
                  <Text style={{ fontSize: "8px", color: "#000" }}>
                    <Text style={{ ...styles.boldText, fontSize: 9 }}>
                      Note :
                    </Text>{" "}
                    This is an electronically generated invoice and does not
                    require a physical signature
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FlightInvoiceDoc;
