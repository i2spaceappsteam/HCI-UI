

import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import queryString from "query-string";
import { EnvironmentOutlined, CheckOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Row, Rate, Space, Skeleton, Checkbox } from "antd";

const ShortListedHotel = ({
    availableHotel,
    hotelTraceId,
    isFromShortListed,
    isHotelSearchLoad,
    showNetFare,
    searchHotelReq,
    showMoreShortedHotelAminities
}
) => {

    const hotelCardProps = availableHotel;


    const count = showMoreShortedHotelAminities ? hotelCardProps?.hotelFacility?.length ?? 5 : 5


    const goToHotelDetails = (hotelObj) => {
        let queryObj = {
            hotelId: hotelObj.hotelCode,
            traceId: hotelTraceId,
            supplier: hotelObj.supplier,
        };
        const query = queryString.stringify(queryObj);
        return "/hotels/hotel-details?" + query;
    };



    return (<div>
        <div className="grid-item hotel-title">
            <div className="hotel-title-wrapper">
                {isHotelSearchLoad ? (
                    <span className="hotel-name">{hotelCardProps?.hotelName}</span>
                ) : (

                    <Link style={{ width: "100%" }} to={goToHotelDetails(hotelCardProps)}>
                        <span className="hotel-name" >
                            {hotelCardProps?.hotelName}

                            {hotelCardProps.starRating && (
                                <Rate
                                    className="starRating hotel-star"
                                    disabled
                                    value={Number(hotelCardProps.starRating)}
                                    allowHalf={true}
                                />
                            )}
                        </span>
                    </Link>
                )}
            </div>
            {/* {hotelCardProps.starRating && (
              <div className="hotel-star">
                <Rate
                  className="starRating"
                  disabled
                  value={Number(hotelCardProps.starRating)}
                  allowHalf={true}
                />
              </div>
            )} */}
            <div className="hotel-address">
                <EnvironmentOutlined />
                <span className="hotel-address-title">
                    {hotelCardProps?.addresses?.length > 0
                        ? hotelCardProps?.addresses[0]?.address
                        : null}
                </span>
            </div>

            {hotelCardProps.tripAdvisorRating && (
                <div className="tripadvisor-rating">
                    <div className="rating-wrapper">
                        <div className="rating-number">
                            <span>{hotelCardProps.tripAdvisorRating}</span>
                            <span className="sec">/5</span>
                        </div>

                        <div className="traveller-count">
                            <p>TripAdvisor travellers rating</p>
                            <div className="rating-count-value">
                                <span className="tripAd">
                                    <i className="fa fa-tripadvisor" aria-hidden="true"></i>
                                </span>
                                <Rate
                                    className="tripRating"
                                    disabled
                                    character={
                                        <i className="fa fa-circle" aria-hidden="true"></i>
                                    }
                                    value={Number(hotelCardProps.tripAdvisorRating)}
                                    allowHalf={true}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            )}
            <div className="grid-item hotel-price-box">
                <div className="hotel-price-box-wrapper">
                    {isHotelSearchLoad ? (
                        <Space>
                            <Skeleton.Button
                                active={true}
                                size="default"
                                shape="default"
                                block={false}
                            />
                        </Space>
                    ) : (
                        <>
                            <div className="hotel-price">
                                {showNetFare ? (
                                    <>
                                        <span className="text-line">
                                            {" "}
                                            <span>
                                                {(hotelCardProps.hotelPublishPrice)}
                                            </span>
                                        </span>

                                        <p className="netfare">

                                            {(hotelCardProps.hotelNetPrice)}{" "}
                                        </p>
                                        <p className="netfare">
                                            Inc:{" "}
                                            {(hotelCardProps.commission)}{" "}
                                        </p>
                                    </>
                                ) : (
                                    <span>

                                        <span>
                                            {(hotelCardProps.hotelPublishPrice)}
                                        </span>
                                        <span> </span>
                                    </span>
                                )}
                            </div>
                            <div style={{ border: "2px solid transparent", textAlign: "center" }} className="hotel-choose-btn">
                                <Link to={goToHotelDetails(hotelCardProps)}>
                                    <Button className="web-choose-btn">
                                        Select
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}

                </div>

            </div>
            {hotelCardProps.hotelFacility ? (
                <div className="hotel-facilities">

                    <div className="amenity-list">
                        {hotelCardProps.hotelFacility.map((amenity, i) => {
                            if (i <= count) {
                                return (<Col key={"ameni" + i} md={22} sm={12} xs={12} >
                                    <CheckOutlined style={{ marginRight: "5px" }} />{" "}
                                    {amenity}
                                </Col>)
                            }
                        }
                        )}
                    </div>
                </div>
            ) : null}

        </div>
    </div >)

}

export default ShortListedHotel