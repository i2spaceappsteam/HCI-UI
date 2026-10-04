import React, { useState } from "react";
import "../HotelInvoice/HotelInvoice.scss";
// import hotelNoImg from "../../../assets/images/hotels/no_photo.png";
import hotelTicketObj from "./HotelTicket.json";
import { numberFormat } from "../../../helpers/CurrencyNumberFormat";
import dateFormat from "dateformat";
import * as ANTD from "antd";
import { DownOutlined } from "@ant-design/icons";
import HotelTicketDetails from "./HotelTicketDetails";

const HotelInvoice = (props) => {
  /* const [hotelSearchObj, setHotelSearchObj] = useState(
    props.hotelContext.state.hotelSearch
  );

  const [hotelDetailsRespObj, setHotelDetailsRespObj] = useState(
    props.hotelContext.hotelDetailsRespState.hotelDetailsRespState
  );

  const [hotelPaxInfo, setHotelPaxInfo] = useState(
    props.hotelContext.passengersInfo.passengersInfo
  );

  const [hotelRoomDetailsObj, setHotelRoomDetailsObj] = useState(
    props.hotelContext.roomObjFromHotelDet.roomObjFromHotelDet
  );
  const [hotelPreBookingRespObj, setHotelPreBookingRespObj] = useState(
    props.hotelContext.hotelPreBookingResp.hotelPreBookingResp
  );
  const [hotelIndividualObj, setHotelIndividualObj] = useState(
    props.hotelContext.individualHotelDetails.individualHotelDetails
  );

  const [hotelTicketRespObj, setHotelTicketRespObj] = useState(
    hotelTicketObj.response
  ); */

  const { Panel } = ANTD.Collapse;
  const ticketTitle = (
    <div>
      <div className="flight-ticket-titles">
        <h4>Hotel Is Booked Successfully</h4>
        <span>
          A confirmation email has been sent to your provided email address
        </span>
      </div>
      <div className="ticket-full-details">
        <div className="pnr-number">
          <p>
            Onward PNR:
            <span>133254</span>
          </p>
        </div>
        <div className="status">
          <p>
            Status : <span className="booking-status">Booked</span>
          </p>
        </div>
        <div className="ref-no">
          <p>
            Ref-No. : <span>-</span>
          </p>
        </div>
      </div>
    </div>
  );

  const toggleButton = (
    <ANTD.Button
      type="primary"
      key="console"
      style={{ display: "flex", alignItems: "center" }}
      className="view-flight-ticket-btn"
    >
      View Ticket <DownOutlined />
    </ANTD.Button>
  );
  /* const adultTotalCount = () => {
    let adultCount = 0;
    hotelPaxInfo.roomGuestInfo.map((roomCountObj) => {
      adultCount += roomCountObj.paxInfoList.filter(
        (roomPax) => roomPax.type === "AD"
      ).length;
    });
    return adultCount;
  };
  const childTotalCount = () => {
    let childCount = 0;
    hotelPaxInfo.roomGuestInfo.map((roomCountObj) => {
      childCount += roomCountObj.paxInfoList.filter(
        (roomPax) => roomPax.type === "CH"
      ).length;
    });
    return childCount;
  }; */

  const prepareGuestInfo = () => {
    let guestsList = [];
    props.hotelContext.passengersInfo.passengersInfo.roomGuestInfo[0].paxInfoList.map(
      (guestObj, guestIndex) => {
        let guestTempObj = {};
        guestTempObj["key"] = guestIndex + 1;
        guestTempObj["title"] = guestObj.title ? guestObj.title : "";
        guestTempObj["paxname"] = guestObj.firstName
          ? guestObj.firstName + " " + guestObj.lastName
          : "";
        guestTempObj["type"] =
          guestObj.type === "AD"
            ? "Ädult"
            : guestObj.type === "CH"
            ? "Child"
            : "Infant";
        guestTempObj["age"] = "-";
        guestsList.push(guestTempObj);
      }
    );
    return guestsList;
  };
  const prepareHotelDetails = () => {
    let hotelDetails = [];
    let hotelTempObj = {};
    hotelTempObj["checkin"] = props.hotelContext.state.checkin;
    hotelTempObj["checkout"] = props.hotelContext.state.checkout;
    hotelTempObj["hotelname"] =
      props.hotelContext.individualHotelDetails.individualHotelDetails.propertyName;
    hotelTempObj["room"] =
      props.hotelContext.roomObjFromHotelDet.roomObjFromHotelDet.roomName;
    hotelTempObj["roomType"] =
      props.hotelContext.roomObjFromHotelDet.roomObjFromHotelDet.ratePlans[0].ratePlanName;
    hotelTempObj["city"] =
      props.hotelContext.individualHotelDetails.individualHotelDetails.city;

    hotelDetails.push(hotelTempObj);
    return hotelDetails;
  };
  return (
    <div className="flight-ticket-collapse">
      <ANTD.Result
        status="success"
        title={ticketTitle}
        className="result-block"
        extra={[
          <ANTD.Collapse bordered={false} className="collapsed-data">
            <Panel header={toggleButton}>
              <div className="fligh-ticket-container">
                <div className="flight-ticket">
                  <ANTD.Row gutter={[32, 16]} className="ticket-row">
                    <ANTD.Col md={18}>
                      <ANTD.Collapse
                        bordered={true}
                        className="collapsed-data"
                        defaultActiveKey={["1"]}
                        accordion={true}
                      >
                        <Panel header="Onward Ticket" key="1">
                          <div>
                            <HotelTicketDetails
                              prepareGuestInfo={prepareGuestInfo}
                              guestContact={
                                props.hotelContext.passengersInfo.passengersInfo
                                  .guestInfo.phone
                              }
                              guestEmail={
                                props.hotelContext.passengersInfo.passengersInfo
                                  .guestInfo.email
                              }
                              hotelCheckIn={props.hotelContext.state.checkin}
                              hotelCheckOut={props.hotelContext.state.checkout}
                              hotelCity={
                                props.hotelContext.individualHotelDetails
                                  .individualHotelDetails.city
                              }
                              prepareHotelDetails={prepareHotelDetails}
                            />
                          </div>

                          {/* ----------- Terms And Conditions  --------- */}
                          <div className="terms">
                            <div className="terms-conditions-title">
                              <h5>Terms And Conditions</h5>
                            </div>
                            <div className="terms-conditions-body">
                              <p>TNC</p>
                            </div>
                          </div>
                        </Panel>
                      </ANTD.Collapse>
                    </ANTD.Col>

                    <ANTD.Col xs={24} md={6}>
                      <div className="actionable-buttons">
                        <ANTD.Collapse>
                          <Panel header="Print ETicket" key="1">
                            <div className="trip-type-selector">
                              <div className="trip-type-selector">
                                <p>Print Confirmation With Price</p>
                                <p>Print Confirmation Without Price</p>
                              </div>
                            </div>
                          </Panel>
                        </ANTD.Collapse>
                        <div className="ticket-options">
                          <p>Mail</p>
                        </div>
                        <div className="ticket-options">
                          <p>SMS</p>
                        </div>
                        <ANTD.Collapse>
                          <Panel header="Download" key="1">
                            <div className="trip-type-selector">
                              <p>Download Confirmation With Price</p>
                              <p>Download Confirmation Without Price</p>
                            </div>
                          </Panel>
                        </ANTD.Collapse>
                        <div className="ticket-options">
                          <p>Status</p>
                        </div>
                        <div className="ticket-options">
                          <p>Cancel ETicket</p>
                        </div>
                        <div className="ticket-options">
                          <p>
                            {" "}
                            <a href="#/admin/invoice">Partner Invoice</a>
                          </p>
                        </div>
                        <div className="ticket-options">
                          <p>
                            {" "}
                            <a href="#/admin/invoice">User Invoice</a>
                          </p>
                        </div>
                      </div>
                    </ANTD.Col>
                  </ANTD.Row>
                </div>
              </div>
            </Panel>
          </ANTD.Collapse>,
        ]}
      />
    </div>
  );
};

export default HotelInvoice;
