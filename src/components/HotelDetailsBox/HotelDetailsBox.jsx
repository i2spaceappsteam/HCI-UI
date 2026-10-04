


import React from "react";
import "../HotelDetailsBox/HotelDetailsBox.scss";

import { Card, Col, Rate, Row } from "antd";
import moment from "moment";
import queryString from "query-string";
import { useNavigate } from "react-router";


import { StarTwoTone } from "@ant-design/icons";
const ImBaseUrl = import.meta.env.VITE_Image_URL;
const HotelDetailsBox = ({ Ids, hotelDetailsObj, hotelSearchData }) => {
  let history = useNavigate();


  let noOfNights = () => {
    if (Object.keys(hotelSearchData).length > 0) {
      let checkin = new Date(hotelSearchData.checkInDate);
      let checkout = new Date(hotelSearchData.checkOutDate);
      let diffTime = checkout - checkin;
      let diffDays = Math.ceil(diffTime / (1000 * 24 * 60 * 60));
      return diffDays;
    } else {
      return 0;
    }
  };

  const getAdultChildCount = () => {
    let adults = 0;
    let childs = 0;

    if (Object.keys(hotelSearchData).length > 0) {
      if (hotelSearchData.roomGuests.length > 0) {
        for (
          let index = 0;
          index < hotelSearchData.roomGuests.length;
          index++
        ) {
          adults += Number(hotelSearchData.roomGuests[index].noOfAdults);
          childs += Number(hotelSearchData.roomGuests[index].noOfChilds);
        }
      }
    }
    if (childs > 0) {
      return `${adults} Adult &  ${childs} Children`;
    } else return `${adults} Adult`;
  };


  const gotoHotelDetail = (hotelCode) => {
    let queryObj = {
      hotelId: hotelCode,
      traceId: Ids.traceId,
      supplier: hotelSearchData.supplier,
    };
    const query = queryString.stringify(queryObj);
    history(`/hotels/hotel-details?${query}`);
  };
  const StarRating = ({ rating }) => {
    const numStars = parseFloat(rating);
    const starsArray = Array.from({ length: numStars }, (_, index) => index);

    return (
      <div className="str-top-ht" style={{ fontSize: "14px", marginLeft: -2, marginTop: -8 }}>
        {starsArray?.map((_, index) => (
          <span
            key={index}
            role="img"
            aria-label="star"
            style={{
              textShadow: "3px 2px 6px grey",
              marginRight: "1px"
            }}
          >
            <StarTwoTone />
            {/* ⭐ */}
          </span>
        ))}
      </div>
    );
  };
  return (
    <>

      <Row className="hot-detail">
        <Col md={24}>
          <div className="hotel-detail-header-wrapper">
            <p className="booking-summary-div">Hotel Details</p>

            {hotelDetailsObj?.hotelCode && Ids !== "hotel-review" && (
              <p
                className="pointer_cursor"
                onClick={() => gotoHotelDetail(hotelDetailsObj.hotelCode)}
              >
                Change Room <span><img src={ImBaseUrl + "images/Icons/back.png"} width={"20px"} alt="" /></span>
              </p>
            )}
          </div>
        </Col>

        <Col md={8} sm={24} xs={24}>
          <div style={{ padding: 8 }}>
            <div className="image-details one-img-hotel">

              {hotelDetailsObj?.images?.length > 1 ? (
                <img
                  src={hotelDetailsObj?.images[1]}
                  alt={hotelDetailsObj.hotelName}
                />
              ) : (hotelDetailsObj?.images?.length > 0 ? (
                <img
                  src={hotelDetailsObj?.images[0]}
                  alt={hotelDetailsObj.hotelName}
                />
              ) : (
                <img src={ImBaseUrl + "images/htImgs/no_img.png"} alt="no-photo" />
              ))
              }


            </div>
          </div>
        </Col>

        <Col md={16} sm={24} xs={24}>
          <div className="rm-dt-bx" style={{ padding: 8 }}>
            <div className="disp-table-cell-div">
              <div className="hotel-plan-div">
                <h4 className="hot-name">{hotelDetailsObj.hotelName}</h4>
                {hotelDetailsObj.starRating && (
                  <div className="hotel-star" style={{ alignContent: "center" }}>

                    <StarRating rating={hotelDetailsObj.starRating} />
                  </div>
                )}
              </div>
              <div className="rm-st">
                <div className="rrom-type">
                  <span className="rom">Room</span> {" : "}
                  <span className="room-name">

                    {hotelDetailsObj?.combineRoom?.[0]?.combineRooms?.[0]?.ratePlanName?.split(',')?.[0]}
                  </span>
                </div>
                <div className="rrom-type">
                  <span className="rom">Stay</span> {" : "}
                  <span className="room-name">
                    <i class="fa fa-moon-o" aria-hidden="true"></i>{" "}{noOfNights()} {noOfNights() > 1 ? "Nights" : "Night"}
                  </span>
                </div>
              </div>

              <div className="booking-dates">
                <div className="check-in">
                  <div className="labelC">CHECK IN</div>
                  <div className="date">
                    <span className="day">{moment(hotelSearchData.checkInDate).format("ddd")}</span>
                    <span className="date-number">{moment(hotelSearchData.checkInDate).format("DD")}</span>
                    <span className="month-year">{moment(hotelSearchData.checkInDate).format("MMM YYYY")}</span>
                  </div>
                  <div className="time">12 PM</div>
                </div>
                <div className="nights">
                  <span className="nights-badge"> <i class="fa fa-moon-o" aria-hidden="true"></i>{" "}{noOfNights()} {noOfNights() > 1 ? "Nights" : "Night"}</span>
                </div>
                <div className="check-out">
                  <div className="labelC">CHECK OUT</div>
                  <div className="date">
                    <span className="day"> {moment(hotelSearchData.checkOutDate).format("ddd")}</span>
                    <span className="date-number">{moment(hotelSearchData.checkOutDate).format("DD")}</span>
                    <span className="month-year">{moment(hotelSearchData.checkOutDate).format("MMM YYYY")}</span>
                  </div>
                  <div className="time">10 AM</div>
                </div>
              </div>

              <Col className="room-number-wrapper">
                <div className="second-col-details-div">


                  {Object.keys(hotelSearchData).length > 0 && hotelSearchData.roomGuests.length > 0 && (
                    <div className="room-summ-bx">
                      {(() => {
                        const summary = hotelSearchData.roomGuests.reduce(
                          (acc, room) => {
                            acc.rooms += 1;
                            acc.adults += room.noOfAdults;
                            acc.children += room.noOfChilds;
                            return acc;
                          },
                          { rooms: 0, adults: 0, children: 0 }
                        );

                        return (
                          <div className="rmsury-details">
                            <div className="rm-sum"><span>{summary.rooms} </span> Rooms</div> <div>|</div>
                            <div className="rm-sum"><span>{summary.adults}</span> Adult's {summary.children > 0 ? <>{", "} <span>{summary.children}</span>Child's </> : null}   </div><div>|</div>
                            <div className="rm-sum"><span>{noOfNights()} </span>{noOfNights() > 1 ? "Nights" : "Night"}</div>
                          </div>
                        );
                      })()}
                    </div>
                  )}



                </div>
              </Col>

            </div>
          </div>
        </Col>
        <Col md={24} style={{ padding: 8 }}>

          {hotelDetailsObj?.combineRoom?.[0]?.inclusions?.length > 0 ?
            <Col className="inclusion-cp" style={{ display: 'contents' }}>

              <p className="inc-txt">Inclusions:

                {hotelDetailsObj?.combineRoom?.[0]?.inclusions?.map((i, idx) =>
                  idx >= 0 ? (
                    <>

                      <ul >
                        <li key={"ind" + idx} >
                          <i class="fa fa-check-circle-o" aria-hidden="true"></i> {" "}
                          {i.toUpperCase()}{hotelDetailsObj?.combineRoom?.[0]?.inclusions?.length < idx || idx > 0 ? " , " : ""}
                        </li>

                      </ul>
                    </>
                  ) : (
                    null
                  )
                )} </p>



            </Col> : null}

        </Col>


      </Row>
      <Row>
        <Col md={24} sm={24} xs={24} className="cancel-cp-bottom" style={{ padding: 0, marginTop: -4 }}>
          <>
            {Object?.keys(hotelDetailsObj)?.length > 0 && (
              <>
                {hotelDetailsObj?.combineRoom?.length > 0 ? (
                  <>
                    {hotelDetailsObj?.combineRoom?.[0]?.combineRooms[0]?.cancellationPolicy?.map((cancel, index) => (
                      <>

                        {cancel?.chargeType === "Percentage" ?
                          <div className="cancel-policy-cp">
                            <label>
                              <p className="cancl-txt">
                                <strong>Cancellation Policy: </strong>
                                {cancel?.policies ?? <span>
                                  {"for "}{hotelDetailsObj?.combineRoom?.[0]?.combineRooms[0]?.roomName}{" - Total "} {" : "} {cancel?.penaltyAmount} {" % (percentage) of amount will be Charged, If Cancelled between "}{cancel?.fromDate}{" and "}{cancel?.toDat}{" until "} {" IST "}
                                </span>
                                }
                              </p>
                            </label>
                          </div> :
                          <div className="cancel-policy-cp">
                            <label>
                              <p className="cancl-txt">
                                <strong>Cancellation Policy: </strong>
                                <span>
                                  {"for "}{hotelDetailsObj?.combineRoom?.[0]?.combineRooms[0]?.roomName}{" - of total "}{" : "}{cancel?.penaltyAmount}{"/- amount will be Charged, If Cancelled between "}{cancel?.fromDate}{" and "}{cancel?.toDate}{" until "} {" IST "}
                                </span>
                              </p>
                            </label>
                          </div>}
                      </>))}


                  </>
                ) : (
                  ""
                )}
              </>
            )}


          </>
        </Col>
      </Row>


    </>
  );
};

export default HotelDetailsBox;
