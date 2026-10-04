import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    padding: 20,
  },
  section: {
    padding: "0 8px",
    color: "#555",
    background: "#FFF",
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
    color: "#E32025",
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
    backgroundColor: "#5da0e9",
    color: "#fff",
    padding: "3px 6px",
    border: "1px solid #000",
  },
  table_sub_head: {
    width: "100%",
    backgroundColor: "#5da0e9",
    color: "#fff",
    padding: "3px 6px",
    border: "1px solid #000",
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
    width: "40%",
    //  borderRight: "1px solid black",
    padding: "0 3px",
  },
  table_pnr: {
    width: "20%",
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
  table_amount: {
    width: "30%",

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
    color: "#E32025",
    marginBottom: 1,
  },
  bank_wrapper: {},
  bank_details: { width: "50%" },
  bank_h: {
    width: "10%",
    fontSize: 10,
    color: "#E32025",
    marginBottom: 4,
    borderBottom: "1px solid #E32025",
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

const HotelInvoiceDoc = ({ invoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <View style={styles.header}>
          <View style={styles.company}>
            <Text style={styles.company_h} className="name">
              {invoiceData.adminDetails[0].Address}
            </Text>
            <Text style={styles.company_p}>
              {invoiceData.adminDetails[0].CityName}{" "}
              {invoiceData.adminDetails[0].StateName}
            </Text>
            <Text style={styles.company_p}>
              {invoiceData.adminDetails[0].CountryName}{" "}
              {invoiceData.adminDetails[0].PostalCode}
            </Text>
            {/* <Text style={styles.company_p}>
              Email : pay.outc@gmail.com
            </Text> */}
          </View>
          <View style={styles.invoice}>
            <Text style={styles.invoice_h}>Invoice</Text>
          </View>
          <View style={styles.invoice_origin}>
            <Text style={styles.invoice_origin_h}>Origin Of Invoice</Text>
          </View>
          <View style={{ ...styles.origin_wrapper, ...styles.row }}>
            <View style={{ ...styles.origin, ...styles.row }}>
              <View style={styles.origin_title}>
                <Text style={styles.origin_h}>To M/s </Text>
              </View>
              <View style={styles.origin_deatil}>
                <Text style={styles.origin_p}>
                  : {invoiceData?.agentDetails?.FirstName}
                  {"  "}
                  {invoiceData?.agentDetails?.LastName}
                </Text>
              </View>
              <View style={styles.origin_title}>
                <Text style={styles.origin_h}>GSTIN </Text>
              </View>
              <View style={styles.origin_deatil}>
                <Text style={styles.origin_p}>
                  : {invoiceData?.agentDetails?.gstIn}
                </Text>
              </View>
            </View>
            <View style={{ ...styles.origin, ...styles.row }}>
              <View style={styles.origin_title_right}>
                <Text style={styles.origin_h}>Invoice No.</Text>
              </View>
              <View style={styles.origin_deatil_right}>
                <Text style={styles.origin_p}>: {invoiceData.invoiceNo}</Text>
              </View>
              <View style={styles.origin_title_right}>
                <Text style={styles.origin_h}>Invoice Date.</Text>
              </View>
              <View style={styles.origin_deatil_right}>
                <Text style={styles.origin_p}>
                  : {moment(invoiceData.CreatedOn).format("MMM DD,YYYY")}
                </Text>
              </View>

              <View style={styles.origin_title_right}>
                <Text style={styles.origin_h}>Reference No.</Text>
              </View>
              <View style={styles.origin_deatil_right}>
                <Text style={styles.origin_p}>: {invoiceData?.RefNumber}</Text>
              </View>
            </View>
          </View>
          <View>
            <View style={{ ...styles.table_wrapper, ...styles.row }}>
              <View style={{ ...styles.table_head, ...styles.row }}>
                <View style={styles.table_index}>
                  <Text style={styles.origin_p}>Sr. No.</Text>
                </View>
                <View style={styles.table_des}>
                  <Text style={styles.origin_p}>Narration / Description</Text>
                </View>
                <View style={styles.table_pnr}>
                  <Text style={styles.origin_p}>PNR</Text>
                </View>
                <View style={styles.table_amount}>
                  <Text style={{ ...styles.origin_p, ...styles.text_right }}>
                    Amount
                  </Text>
                </View>
              </View>
              {invoiceData?.Rooms?.length > 0
                ? invoiceData?.Rooms.map((room, index) => (
                    <>
                      <View style={{ ...styles.table_body, ...styles.row }}>
                        <View style={styles.table_index}>
                          <Text style={styles.origin_p}>{index + 1}.</Text>
                        </View>
                        <View style={styles.table_des}>
                          <Text style={styles.origin_p}>
                            {room.Title} {room.FirstName} {room.LastName}
                          </Text>
                          <Text style={styles.origin_p}>Age :{room?.Age}</Text>
                          <Text style={styles.origin_p}>
                            {invoiceData?.HotelName}
                          </Text>
                          <Text style={styles.origin_p}>
                            Room Name-{room.roomName}
                          </Text>
                        </View>
                        <View style={styles.table_pnr}>
                          <Text style={styles.origin_p}>
                            {invoiceData?.ConfirmationNumber}
                          </Text>
                        </View>
                        <View style={styles.table_amount}>
                          <Text
                            style={{ ...styles.origin_p, ...styles.text_right }}
                          >
                            INR: {room.total}
                          </Text>
                        </View>
                      </View>
                      {room?.insuranceAmount ? (
                        <View
                          style={{
                            ...styles.table_body,
                            ...styles.row,
                            paddingTop: 0,
                          }}
                        >
                          <View style={styles.table_index}>
                            <Text style={styles.origin_p}></Text>
                          </View>
                          <View style={{ ...styles.table_des }}>
                            <Text style={styles.origin_p}>
                              Insurance Charge
                            </Text>
                          </View>
                          <View style={{ ...styles.table_pnr }}>
                            <Text style={styles.origin_p}></Text>
                          </View>
                          <View style={{ ...styles.table_amount }}>
                            <Text
                              style={{
                                ...styles.origin_p,
                                ...styles.text_right,
                              }}
                            >
                              INR: {room?.insuranceAmount}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </>
                  ))
                : null}
            </View>
            <View style={{ ...styles.table_sub_wrapper, ...styles.row }}>
              <View style={{ ...styles.table_sub_head, ...styles.row }}>
                <View style={styles.table_sub_index}>
                  <Text style={styles.table_p}></Text>
                </View>
                <View style={styles.table_sub_des}>
                  <Text style={{ ...styles.table_p, ...styles.text_right }}>
                    Sub-Total
                  </Text>
                </View>
                <View style={styles.table_sub_amount}>
                  <Text style={{ ...styles.table_p, ...styles.text_right }}>
                    INR :{invoiceData?.Fares}
                  </Text>
                </View>
              </View>
              {invoiceData?.ServiceTax ? (
                <View style={{ ...styles.table_sub_body, ...styles.row }}>
                  <View style={styles.table_sub_index}>
                    <Text style={styles.table_p}></Text>
                  </View>
                  <View style={styles.table_sub_des}>
                    <Text style={{ ...styles.table_p, ...styles.text_right }}>
                      Add : Service Charges
                    </Text>
                  </View>
                  <View style={styles.table_sub_amount}>
                    <Text style={{ ...styles.table_p, ...styles.text_right }}>
                      INR :{invoiceData?.ServiceTax}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={{ ...styles.table_sub_body, ...styles.row }}>
                <View style={styles.table_sub_index}>
                  <Text style={styles.table_p}></Text>
                </View>
                <View style={styles.table_sub_des}>
                  <Text style={{ ...styles.table_p, ...styles.text_right }}>
                    CGST @ 9.00% (18.00) SGST @ 9.00% (18.00)
                  </Text>
                </View>
                <View style={styles.table_sub_amount}>
                  <Text style={{ ...styles.table_p, ...styles.text_right }}>
                    INR :0
                  </Text>
                </View>
              </View>
              {invoiceData?.ConvienceData?.amount != 0 ? (
                <View style={{ ...styles.table_sub_body, ...styles.row }}>
                  <View style={styles.table_sub_index}>
                    <Text style={styles.table_p}></Text>
                  </View>
                  <View style={styles.table_sub_des}>
                    <Text style={{ ...styles.table_p, ...styles.text_right }}>
                      Convienence Fee
                    </Text>
                  </View>
                  <View style={styles.table_sub_amount}>
                    <Text style={{ ...styles.table_p, ...styles.text_right }}>
                      INR :{invoiceData?.ConvienceData?.amount}
                    </Text>
                  </View>
                </View>
              ) : null}
              {invoiceData?.postMarkup ? (
                <View style={{ ...styles.table_sub_body, ...styles.row }}>
                  <View style={styles.table_sub_index}>
                    <Text style={styles.table_p}></Text>
                  </View>
                  <View style={styles.table_sub_des}>
                    <Text style={{ ...styles.table_p, ...styles.text_right }}>
                      Post MarkUp
                    </Text>
                  </View>
                  <View style={styles.table_sub_amount}>
                    <Text style={{ ...styles.table_p, ...styles.text_right }}>
                      INR :{invoiceData?.postMarkup}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={{ ...styles.table_sub_head, ...styles.row }}>
                <View style={styles.table_sub_index}>
                  <Text style={styles.table_p}></Text>
                </View>
                <View style={styles.table_sub_des}>
                  <Text style={{ ...styles.table_p, ...styles.text_right }}>
                    Total
                  </Text>
                </View>
                <View style={styles.table_sub_amount}>
                  <Text style={{ ...styles.table_p, ...styles.text_right }}>
                    INR :{getTotalPrice(invoiceData)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View>
            <Text style={{ ...styles.for_h, ...styles.text_right }}>
              For SHOP YOUR TRIP PRIVATE LIMITED{" "}
            </Text>
            <View style={styles.bank_wrapper}>
              <Text style={{ ...styles.bank_h }}>Bank Detail</Text>
              <View style={{ ...styles.bank_details, ...styles.row }}>
                <View style={styles.bank_index}>
                  <Text style={styles.bank_p}>Bank Name</Text>
                </View>
                <View style={styles.bank_des}>
                  <Text style={{ ...styles.bank_p }}>
                    : {invoiceData?.bankDetails[0]?.BankName}
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.bank_details, ...styles.row }}>
                <View style={styles.bank_index}>
                  <Text style={styles.bank_p}>Bank Address</Text>
                </View>
                <View style={styles.bank_des}>
                  <Text style={{ ...styles.bank_p }}>
                    : {invoiceData?.bankDetails[0]?.BranchName}
                  </Text>
                </View>
              </View>
              {invoiceData?.bankDetails[0]?.SwiftCode ? (
                <View style={{ ...styles.bank_details, ...styles.row }}>
                  <View style={styles.bank_index}>
                    <Text style={styles.bank_p}>Swift Code</Text>
                  </View>
                  <View style={styles.bank_des}>
                    <Text style={{ ...styles.bank_p }}>
                      : {invoiceData.bankDetails[0].SwiftCode}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={{ ...styles.bank_details, ...styles.row }}>
                <View style={styles.bank_index}>
                  <Text style={styles.bank_p}>IFCS Code</Text>
                </View>
                <View style={styles.bank_des}>
                  <Text style={{ ...styles.bank_p }}>
                    : {invoiceData?.bankDetails[0]?.IFSCNumber}
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.bank_details, ...styles.row }}>
                <View style={styles.bank_index}>
                  <Text style={styles.bank_p}>AC No.</Text>
                </View>
                <View style={styles.bank_des}>
                  <Text style={{ ...styles.bank_p }}>
                    : {invoiceData?.bankDetails[0]?.AccountNumber}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View>
            <View style={styles.terms_wrapper}>
              <Text style={{ ...styles.terms_h }}>Terms And Condition</Text>
              <View style={{ ...styles.terms_details, ...styles.row }}>
                <View style={styles.terms_index}>
                  <Text style={styles.terms_p}>CASH</Text>
                </View>
                <View style={styles.terms_des}>
                  <Text style={{ ...styles.terms_p }}>
                    : Payment to be made to the cashier & printed Official
                    Receipt must be obtained.
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.terms_details, ...styles.row }}>
                <View style={styles.terms_index}>
                  <Text style={styles.terms_p}>CHEQUE</Text>
                </View>
                <View style={styles.terms_des}>
                  <Text style={{ ...styles.terms_p }}>
                    : All cheques / demand drafts in payment of bills must be
                    crossed 'A/c Payee Only'
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.terms_details, ...styles.row }}>
                <View style={styles.terms_index}>
                  <Text style={styles.terms_p}>CHEQUE</Text>
                </View>
                <View style={styles.terms_des}>
                  <Text style={{ ...styles.terms_p }}>
                    : and drawn in favour of 'SHOP YOUR TRIP PRIVATE LIMITED'.
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.terms_details, ...styles.row }}>
                <View style={styles.terms_index}>
                  <Text style={styles.terms_p}>LATE PAYMENT</Text>
                </View>
                <View style={styles.terms_des}>
                  <Text style={{ ...styles.terms_p }}>
                    : Interest @ 24% per annum will be charged on all
                    outstanding bills after due date.
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.terms_details, ...styles.row }}>
                <View style={styles.terms_index}>
                  <Text style={styles.terms_p}>VERY IMP</Text>
                </View>
                <View style={styles.terms_des}>
                  <Text style={{ ...styles.terms_p }}>
                    : Kindly check all details carefully to avoid un-necessary
                    complications.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default HotelInvoiceDoc;
