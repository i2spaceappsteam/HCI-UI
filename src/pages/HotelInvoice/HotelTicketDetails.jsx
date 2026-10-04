import * as ANTD from "antd";
import dateFormat from "dateformat";
import React from "react";

const HotelTicketDetails = (props) => {
  const hotelDetailsColumns = [
    {
      title: "Check-In",
      dataIndex: "checkin",
      key: "checkin",
    },
    {
      title: "Check Out",
      dataIndex: "checkout",
      key: "checkout",
    },
    {
      title: "Hotel Name",
      dataIndex: "hotelname",
      key: "hotelname",
    },
    {
      title: "Room",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Room Type",
      dataIndex: "roomType",
      key: "roomType",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
  ];
  const hotelDetailsDataSource = props.prepareHotelDetails(); /* [
    {
      key: "1",
      airlinename: "ATR",
      flightnumber: "ATR",
      departuretime: "ATR",
      departures: "ATR",
      arrivalstime: "ATR",
      arrivals: "ATR",
      duration: "ATR",
      classtype: "ATR",
      baggage: "ATR",
      airlinepnr: "ATR",
    },
  ];
 */
  const travelcolumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Passenger Name",
      dataIndex: "paxname",
      key: "paxname",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },

    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
  ];
  const traveldataSource = props.prepareGuestInfo(); /* [
    {
      key: "1",
      title: "Mr",
      paxname: "Mr",
      type: "Mr",
      age: "Mr",
    },
  ]; */

  return (
    <div>
      <div className="fligh-ticket-container">
        <div className="passenger-details">
          <p>
            Passenger Contact: <span>{props.guestContact}</span>
          </p>
          <p>
            Passenger Email: <span>{props.guestEmail}</span>
          </p>
        </div>

        <div className="booking-flight-details">
          <div className="flight-ref-details">
            <ul>
              <li>
                Ref number: <span>-</span>
              </li>
              <li>
                Booking Date:
                <span>{dateFormat(new Date(), "dd-mmm-yyyy")}</span>
              </li>
            </ul>
          </div>
          <div className="flight-fare-details">
            <ul>
              <li>
                PNR:
                <span className="bold-text">-</span>
              </li>
              <li>
                Status:
                <span className="confirmed">Booked</span>
              </li>
              <li>
                Booking Id:
                <span>-</span>
              </li>
            </ul>
          </div>
          <div className="trip-details">
            <ul>
              <li>
                Check-In: <span>{props.hotelCheckIn}</span>
              </li>
              <li>
                Location:
                <div className="flight-from-to">
                  <p>{props.hotelCity}</p>
                </div>
              </li>
              <li>
                Checkout Date:
                <span>{props.hotelCheckOut}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="booking-flight-details-info">
          <div className="flight-deatils-text">
            <h5>Hotel Details</h5>
          </div>
          <div className="flight-details-table">
            <ANTD.Table
              dataSource={hotelDetailsDataSource}
              columns={hotelDetailsColumns}
              className="table-scroll-none"
              bordered
            />
          </div>
        </div>

        <div className="booking-flight-details-info">
          <div className="flight-deatils-text">
            <h5>Travel Details</h5>
          </div>
          <div className="flight-details-table">
            <ANTD.Table
              dataSource={traveldataSource}
              columns={travelcolumns}
              className="table-scroll-none"
              bordered
            />
          </div>
        </div>

        <div className="fare-details">
          <ul>
            <li>
              <p>Fare Details:</p>
              <p className="colored-text">INR</p>
            </li>
            <li>
              <p>Base Fare</p>
              <p className="colored-text">1316</p>
            </li>
            <li>
              <p>Surge and Taxes:YQ: </p>
              <p className="colored-text">639</p>
            </li>
            <li>
              <p>conveneience Fee</p>
              <p className="colored-text">0.00</p>
            </li>
            <li>
              <p className="colored-text">Net Total</p>
              <p className="colored-text">1955</p>
            </li>
            <li>
              <p className="colored-text">Grand Total</p>
              <p className="colored-text">1955</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HotelTicketDetails;
