

import React, { useState, useEffect } from "react";
import { Tabs, Card, Carousel, Spin } from "antd";
import { EnvironmentOutlined, StarTwoTone } from "@ant-design/icons";
import ApiClient from "../../helpers/ApiClient";
import Slider from "react-slick";
import "./TripPlanner.scss";
import queryString from "query-string";
import { Link } from "react-router-dom";
import moment from "moment";

const TripPlanner = () => {
    const [cityHotels, setCityHotels] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [tabs, setTabs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const MobileSlidersettings = {
        arrows: false,
        dots: false,
        slidesToShow: 4,
        speed: 500,
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1200, // Large screens
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1024, // Laptops
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768, // Tablets
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    centerMode: true,
                },
            },
            {
                breakpoint: 600, // Small tablets
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: true,
                },
            },
            {
                breakpoint: 480, // Mobile devices
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: true,
                },
            },
        ],
    };
    

    const tomorrowDate = moment().add(5, "days").format("YYYY-MM-DD");
    const dayafter = moment().add(6, "days").format("YYYY-MM-DD");

    const getHotelSer = (hotel) => {
        const cityName = `${hotel.city},${hotel.country}`;
        const formData = {
            checkInDate: tomorrowDate,
            checkOutDate: dayafter,
            hotelCityCode: `cityName=${cityName}&&cityId=${hotel.cityId}`,
            roomGuests: JSON.stringify([{ noOfAdults: 1, noOfChilds: 0, childAge: [] }]),
            nationality: "IN",
            currency: "INR",
            countryCode: "IN",
            traceId: "string",
        };
        const query = queryString.stringify(formData);
        return "/hotels/listing?" + query;
    };

    const StarRating = ({ rating }) => {
        const numStars = parseFloat(rating);
        const starsArray = Array.from({ length: numStars }, (_, index) => index);
        return (
            <div className="str-top-ht" style={{ fontsize: "10px", marginRight: 50 }}>
                {starsArray?.map((_, index) => (
                    <span key={index} role="img" aria-label="star" style={{ textShadow: "3px 2px 6px grey", marginRight: "1px" }}>
                        <StarTwoTone />
                    </span>
                ))}
            </div>
        );
    };

    const getCityHotel = () => {
        ApiClient.get("admin/dynamic/hotel")
            .then((res) => {
                if (res.status === 200) {
                    const citiesWithHotels = res.data.map((cityHotel) => {
                        return {
                            cityName: cityHotel.cityName,
                            hotels: cityHotel.result.map((hotel) => ({
                                name: hotel.propertyName,
                                city: hotel.city,
                                country: hotel.countryName,
                                cityId: hotel.cityId,
                                image: hotel.Images[0],
                                address: hotel.addresses[0]?.address,
                                starRating: hotel.starRating,
                            })),
                        };
                    });

                    const allHotels = citiesWithHotels.flatMap((city) => city.hotels);
                    const dynamicTabs = citiesWithHotels.map((city) => ({
                        key: city.cityName,
                        label: (
                            <>
                                <EnvironmentOutlined /> {city.cityName}
                            </>
                        ),
                        children: (
                            <Slider {...MobileSlidersettings}>
                                {allHotels
                                    .filter((hotel) => hotel.city === city.cityName)
                                    .map((hotel, index) => (
                                        <Link to={getHotelSer(hotel)} key={index}>
                                            <Card
                                                style={{ width: 200, height: 210 }}
                                                hoverable
                                                cover={<img alt={hotel.name} src={hotel.image} />}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <div
                                                        style={{
                                                            maxWidth: "120px",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            fontSize: 20,
                                                            fontWeight: 700,
                                                            fontFamily: "Nunito",
                                                            marginTop: "10px",
                                                            marginLeft: "10px",
                                                        }}
                                                    >
                                                        {hotel.name}
                                                    </div>
                                                    <StarRating rating={hotel.starRating} />
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                            </Slider>
                        ),
                    }));

                    setCityHotels(allHotels);
                    setTabs(dynamicTabs);

                    if (dynamicTabs.length > 0) {
                        setActiveTab(dynamicTabs[0].key);
                    }

                    setIsLoading(false);
                }
            })
            .catch((e) => {
                console.error("API error:", e);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        getCityHotel();
    }, []);

    return (
        <div className="trip-planner">
            <h2>Quick and easy trip planner</h2>
            <p>Pick a vibe and explore the top destinations in India</p>
            {isLoading ? (
                <Spin size="large" />
            ) : (
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />
            )}
        </div>
    );
};

export default TripPlanner;





