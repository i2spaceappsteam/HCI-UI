import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../HotelDetails/HotelDetails.scss";
import { Rate } from "antd";
import * as ReactBootstrap from "react-bootstrap";
import Hotels from "../../../components/Hotels/Hotels";
import ImagesLightbox from "../../../components/ImagesLightbox/ImagesLightbox";
// import hotelNoImg from "../../../assets/images/htImgs/no_photo.png";
import hotelDetailsObj from "../HotelDet/HotelDetails.json";

const ImBaseUrl = import.meta.env.VITE_Image_URL;
const HotelDetails = (props) => {
  // console.log("hotel details props", props);

  const [hotelDetails, setHotelDetails] = useState({ hotelDetailsObj });
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let hotelDetailsRespObj = hotelDetailsObj.response.data[0]; //Resp from the API call

  let history = useNavigate();
  const goTo = (path) => {
    history("/hotels/hotel-checkout");
  };
  return (
    <div id="hotel-details details-main-2">
      <div>
        <section className="hotel-details-header">
          <div className="details-header-container">
            <div className="hotel-full-address">
              <div className="hotel-header-wrapper">
                <div className="redirect-to-hotels-list">
                  <a href="#!">
                    <span>
                      <i className="fa fa-chevron-left" aria-hidden="true"></i>
                    </span>
                    check other hotels
                  </a>
                </div>
                <div className="hotel-name">
                  <div className="hotel-name-wrapper">
                    <h4>
                      {hotelDetailsRespObj.hotelName}
                      <sup>
                        <Rate
                          className="starRating"
                          disabled
                          defaultValue={hotelDetailsRespObj.starRating}
                          allowHalf={true}
                        />
                      </sup>
                    </h4>
                    <p>{hotelDetailsRespObj.hotelAddress}</p>
                    <span>GREAT LOCATION!</span>
                  </div>
                  <div className="show-rooms-btn">
                    <ReactBootstrap.Button>
                      Show rooms
                      <i className="fa fa-chevron-down" aria-hidden="true"></i>
                    </ReactBootstrap.Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky-links">
              <ul>
                <li>
                  <a href="#!">gallery</a>
                </li>
                <li>
                  <a href="#!">rooms</a>
                </li>
                <li>
                  <a href="#!">location</a>
                </li>
                <li>
                  <a href="#!">about hotel and facilities </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className="hotel-detail-images">
          <div className="light-box-wrapper">
            <ReactBootstrap.Container>
              <ReactBootstrap.Row>
                <ReactBootstrap.Col md={9}>
                  {props.hotelContext.individualHotelDetails.images.length >
                    0 ? (
                    <ImagesLightbox
                      hotelImages={
                        props.hotelContext.individualHotelDetails.images
                      }
                    />
                  ) : (
                    <img src={ImBaseUrl + "images/htImgs/no_photo.png"} alt="no-photo" />
                  )}
                </ReactBootstrap.Col>
                <ReactBootstrap.Col md={3}>
                  <div className="feedback-word">
                    <p>Excellent</p>
                  </div>
                  <div className="map-bg-container">
                    <div className="map-bg">
                      <p>Only 3.1 km from the city centre!</p>
                      <ReactBootstrap.Button>
                        <i className="fa fa-map-marker" aria-hidden="true"></i>
                        Map
                      </ReactBootstrap.Button>
                    </div>
                  </div>
                </ReactBootstrap.Col>
              </ReactBootstrap.Row>
            </ReactBootstrap.Container>
          </div>
        </section>
        <section className="hotel-rooms-list">
          <div className="rooms-wrapper">
            <div>
              <h5>Available rooms</h5>
            </div>
            <div className="available-rooms-dates">
              <Hotels hotelSearch={props.hotelContext} />
            </div>
            <div className="rooms-list">
              {hotelDetailsRespObj.rooms.length > 0 ? (
                hotelDetailsRespObj.rooms.map((hotelRoom) => (
                  <div className="room-card" key={hotelRoom.roomId}>
                    <div className="room-card-wrapper">
                      <div className="hotel-image-box">
                        <div className="hotel-image">
                          <img src={ImBaseUrl + "images/htImgs/no_photo.png"} alt="no-photo" />
                        </div>
                        <div className="hotel-room-type">
                          <p>{hotelRoom.roomName} - Non-refundable</p>
                          <div className="pax-icons">
                            <small>max.</small>
                            <span>
                              <i className="fa fa-user" aria-hidden="true"></i>{" "}
                              6
                            </span>
                            <span>
                              <i className="fa fa-child" aria-hidden="true"></i>{" "}
                              6
                            </span>
                          </div>
                          <div className="bed-type"></div>
                        </div>
                      </div>
                      <div className="amenities-box">
                        <ul>
                          <li>
                            <i className="fa fa-check" aria-hidden="true"></i>
                            Pay less:Non-refundable
                          </li>
                          <li>
                            <i
                              className="fa fa-credit-card"
                              aria-hidden="true"
                            ></i>
                            Pay now
                          </li>
                          <li>
                            <i className="fa fa-coffee" aria-hidden="true"></i>
                            Breakfast included
                          </li>
                        </ul>
                      </div>
                      <div className="select-room-btn">
                        <p className="rooms-left">Only 1 left!</p>
                        <p className="rooms-left-mobile">Only 1 left!</p>
                        <p className="hotel-room-price">
                          Rs<span>336</span>
                          <small className="mobile-pax-content">
                            Price for <b> 2 persons </b>for 1 <b>night</b>
                          </small>
                        </p>
                        <ReactBootstrap.Button
                          onClick={() => {
                            goTo();
                          }}
                        >
                          Choose room
                        </ReactBootstrap.Button>
                        <small>
                          Price for <b> 2 persons </b>for 1 <b>night</b>
                        </small>
                      </div>
                    </div>
                    <div className="description-modal">
                      <a onClick={handleShow}>
                        Room description and booking condition
                        <span> &gt;&gt;</span>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p>No are available for your Search</p>
              )}

              <div className="showroom-btn-wrapper">
                <ReactBootstrap.Button>show more rooms</ReactBootstrap.Button>
              </div>
            </div>
          </div>
        </section>
        <section className="hotel-description">
          <div className="hotel-description-wrapper">
            <div className="description-block">
              <div className="description-title">About hotel</div>
              <div className="description-content">
                Grab a bite at The Bar, one of the hotel's 2 restaurants, or
                stay in and take advantage of the 24-hour room service. Snacks
                are also available at the coffee shop/café. Relax with a
                refreshing drink from the poolside bar or one of the 2
                bars/lounges. Buffet breakfasts are available daily for a fee.
                Pamper yourself with a visit to the spa, which offers massages,
                body treatments, and facials. You can take advantage of
                recreational amenities such as a 24-hour health club, an outdoor
                pool, and a spa tub. Additional features at this hotel include
                complimentary wireless Internet access, concierge services, and
                an arcade/game room. Featured amenities include complimentary
                wired Internet access, a business center, and limo/town car
                service. Planning an event in Hyderabad? This hotel has
                facilities measuring 10785 square feet (1002 square meters),
                including a conference center. A roundtrip airport shuttle is
                complimentary (available 24 hours). Make yourself at home in one
                of the 305 air-conditioned rooms featuring refrigerators and LCD
                televisions. Your memory foam bed comes with premium bedding.
                Complimentary wired and wireless Internet access keeps you
                connected, and digital programming provides entertainment.
                Private bathrooms with showers feature rainfall showerheads and
                complimentary toiletries.
              </div>
            </div>

            <div className="description-block">
              <div className="description-title">Location</div>
              <div className="description-content">
                <p>
                  With a stay at Novotel Hyderabad Airport in Hyderabad, you'll
                  be connected to the airport, within a 15-minute drive of
                  Chowmahalla Palace and Wonderla Amusement Park. This 5-star
                  hotel is 10.9 mi (17.6 km) from Charminar and 11.3 mi (18.2
                  km) from Salar Jung Museum.
                </p>
                <p>
                  Distances are displayed to the nearest 0.1 mile and kilometer.
                  Wonderla Amusement Park - 13.5 km / 8.4 mi Chowmahalla Palace
                  - 16.4 km / 10.2 mi Mecca Masjid - 16.7 km / 10.4 mi Laad
                  Baazar - 16.7 km / 10.4 mi Charminar - 17.6 km / 10.9 mi The
                  Nizam's Museum - 17.6 km / 11 mi Purani Haveli - 17.7 km / 11
                  mi Salar Jung Museum - 18.2 km / 11.3 mi
                </p>
              </div>
            </div>
            <div className="description-block facilities-list">
              <div className="description-title">Hotel facilities</div>
              <div className="description-content">
                <div className="facilities-block">
                  <p>Miscellaneous</p>
                  <ul>
                    <li>Elevator</li>
                    <li>Multilingual staff</li>
                    <li>Wedding services</li>
                    <li>Designated smoking areas</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="description-block facilities-list">
              <div className="description-title">Room facilities</div>
              <div className="description-content">
                <div className="facilities-block">
                  <p>Room facilities</p>
                  <ul>
                    <li>Air conditioning</li>
                    <li>Free newspaper</li>
                    <li>Phone</li>
                    <li>Private bathroom</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="description-block checking-timings">
              <div className="description-title">Check-in</div>
              <div className="description-content">
                <ul>
                  <li>
                    <i className="fa fa-calendar" aria-hidden="true"></i>
                    Check-in <span>2:00 PM</span>
                  </li>
                  <li>
                    <i className="fa fa-calendar" aria-hidden="true"></i>
                    Check-out <span>2:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="hotel-details-footer">
          <div className="details-footer-wrapper">
            <div>
              <p>Ready for booking ?</p>
            </div>
            <div>
              <ReactBootstrap.Button>Show rooms</ReactBootstrap.Button>
            </div>
          </div>
          <div className="details-footer-second">
            <div className="second-footer-wrapper">
              <div>
                <p>Looking for something else in Hyderabad ?</p>
              </div>
              <div>
                <ReactBootstrap.Button>
                  See similar hotels
                </ReactBootstrap.Button>
              </div>
              <div>
                <ReactBootstrap.Button>
                  Return to search results
                </ReactBootstrap.Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Hotel Facilities Modal */}
      <div className="facilities-modal">
        <ReactBootstrap.Modal show={show} onHide={handleClose} size="lg">
          <ReactBootstrap.Modal.Header closeButton>
            <ReactBootstrap.Modal.Title>
              <div className="custom-modal-header">
                <div className="header-img">
                  <img
                    src={ImBaseUrl + "images/htImgs/no_photo.png"}
                    alt="blank"
                  />
                </div>
                <div className="header-text">
                  <h4>Apartment - Non-refundable</h4>
                  <p>
                    <i className="fa fa-wifi" aria-hidden="true"></i>Free
                    Wireless Internet
                  </p>
                </div>
              </div>
            </ReactBootstrap.Modal.Title>
          </ReactBootstrap.Modal.Header>
          <ReactBootstrap.Modal.Body scrollable="true">
            <div className="custom-details-modal-body">
              <p>Room facilities</p>
              <ul>
                <li>Tea/Coffee Maker</li>
                <li>Bath</li>
                <li>Iron</li>
                <li>Shower</li>
                <li>Air conditioning</li>
                <li>Air conditioning</li>
                <li>Air conditioning</li>
                <li>Air conditioning</li>
                <li>Air conditioning</li>
                <li>Air conditioning</li>
                <li>Air conditioning</li>
              </ul>
            </div>
          </ReactBootstrap.Modal.Body>
        </ReactBootstrap.Modal>
      </div>
    </div>
  );
};

export default HotelDetails;
