import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button, Card, Col, Skeleton, Rate, Row, message, Modal, Radio, Select, Tag, Tooltip } from "antd";
import { useNavigate } from "react-router";
import parse from "html-react-parser";
import moment from "moment";
import { useSelector } from "react-redux";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImagesLightbox from "../../components/ImagesLightbox/ImagesLightbox";
import Apiclient1 from "../../Helpers/Apiclient1";
import ApiClient from "../../Helpers/ApiClient";
import queryString from "query-string";
import HotelCardImage from "./HotelCardImage";
import {
    EnvironmentOutlined,
    StarFilled,
    StarTwoTone,
    ArrowLeftOutlined,
    CheckOutlined,
    CalendarOutlined,
    UserOutlined,
    AppstoreOutlined,
    InfoCircleOutlined,
    CheckCircleFilled,
    SafetyCertificateOutlined,
    CoffeeOutlined,
    CompassOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./NewHotelDet.scss";

const { Option } = Select;
const ImBUrl = import.meta.env.VITE_Image_URL;

const HotelDet = () => {
    const history = useNavigate();
    const user = useSelector((state) => state.auth.user);

    const [filteredRooms, setFilteredRooms] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [hotelDetailsRespObj, setHotelDetailsRespObj] = useState({});
    const [selectedMealPlan, setSelectedMealPlan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roomsDetails, setRoomsDetails] = useState({ roomList: [], type: "" });
    const [showcancellationModal, setShowCancellationModal] = useState(false);
    const [roomsData, setRoomsData] = useState(null);
    const [inclusiondata, setinclusiondata] = useState([]);
    const [cancellationInfo, setCancellationInfo] = useState([]);
    const [isinclusionvisible, setisinclusionvisible] = useState(false);
    const [activeTab, setActiveTab] = useState("rooms");
    const [defaultProps, setDefaultProps] = useState({
        center: {
            address: "",
            lat: 17.42159,
            lng: 78.33752,
        },
        zoom: 13,
        mapVisible: true,
    });

    const roomsSectionRef = useRef(null);

    useEffect(() => {
        fetchHotelDetails();
    }, []);

    const fetchHotelDetails = () => {
        const p = queryString.parse(window.location.search);
        const paramsObj = {
            traceId: p.traceId,
            hotelCode: p.hotelId,
            checkInDate: p.checkInDate || "",
            checkOutDate: p.checkOutDate || "",
            hotelCityCode: p.hotelCityCode || "",
            roomGuests: p.roomGuests || "",
            nationality: p.nationality || "IN",
            supplierParamter: p.supplierParamter || "",
            currency: "INR",
        };
        fetchHotelRooms(paramsObj);
        fetchStaticHotelDetails(paramsObj);
    };

    const fetchStaticHotelDetails = (params) => {
        const staticReqObj = {
            traceId: params.traceId || "string",
            cityId: params.hotelCityCode || "",
            countryCode: params.nationality || "IN",
            hotelId: params.hotelCode || "",
            detailLevel: "high"
        };

        const processStaticHotel = (matchedStatic) => {
            if (!matchedStatic) return;

            const mapping = matchedStatic.mappingHotelDetails?.[0] || {};
            const staticImages =
                (matchedStatic.images?.length > 0 ? matchedStatic.images : null) ||
                (matchedStatic.imageList?.length > 0 ? matchedStatic.imageList : null) ||
                (mapping.images?.length > 0 ? mapping.images : null) ||
                [];

            const staticFacilities =
                (matchedStatic.facilities?.length > 0 ? matchedStatic.facilities : null) ||
                (matchedStatic.hotelFacility?.length > 0 ? matchedStatic.hotelFacility : null) ||
                (matchedStatic.hotelFacilities?.length > 0 ? matchedStatic.hotelFacilities : null) ||
                (mapping.hotelFacility?.length > 0 ? mapping.hotelFacility : null) ||
                [];

            const staticDesc =
                matchedStatic.description ||
                matchedStatic.hotelDescription ||
                (typeof matchedStatic.hotelContent === "string" ? matchedStatic.hotelContent : matchedStatic.hotelContent?.description) ||
                mapping.hotelContent ||
                "";

            const addrArr = matchedStatic.addresses;
            const staticAddress =
                (Array.isArray(addrArr) && addrArr.length > 0)
                    ? (addrArr[0].address || addrArr[0].Address || "")
                    : (addrArr?.address || matchedStatic.address || matchedStatic.hotelAddress || mapping.addresses?.[0]?.address || mapping.addresses?.address || "");

            const staticLat = matchedStatic.latitude || matchedStatic.lat || matchedStatic.Latitude || mapping.latitude;
            const staticLng = matchedStatic.longitude || matchedStatic.lng || matchedStatic.Longitude || mapping.longitude;
            const staticRating = matchedStatic.starRating || matchedStatic.StarRating || matchedStatic.rating || mapping.starRating;
            const staticName = matchedStatic.hotelName || matchedStatic.HotelName || matchedStatic.propertyName || matchedStatic.PropertyName;

            setHotelDetailsRespObj((prev) => {
                const updated = { ...prev };
                if (staticImages.length > 0) updated.images = staticImages;
                if (staticFacilities.length > 0 && (!updated.hotelFacility || updated.hotelFacility.length === 0)) {
                    updated.hotelFacility = staticFacilities;
                }
                if (staticDesc && !updated.description) updated.description = staticDesc;
                if (staticAddress && (!updated.addresses || !updated.addresses.address)) {
                    updated.addresses = { address: staticAddress };
                }
                if (staticName && !updated.hotelName) updated.hotelName = staticName;
                if (staticRating && !updated.starRating) updated.starRating = staticRating;
                if (staticLat) updated.latitude = staticLat;
                if (staticLng) updated.longitude = staticLng;
                return updated;
            });

            if (staticLat && staticLng) {
                setDefaultProps((prev) => ({
                    ...prev,
                    center: {
                        address: staticAddress || prev.center.address,
                        lat: parseFloat(staticLat),
                        lng: parseFloat(staticLng),
                    },
                    mapVisible: true,
                }));
            }
        };

        Apiclient1.post("StaticData/GetHotelDetails", staticReqObj)
            .then((staticRes) => {
                const rawStaticHotels = staticRes?.hotelDetails || staticRes?.data?.hotelDetails || [];
                const matchedStatic = Array.isArray(rawStaticHotels)
                    ? rawStaticHotels.find((h) => String(h.hotelCode || h.hotelId) === String(params.hotelCode)) || rawStaticHotels[0]
                    : rawStaticHotels;
                if (matchedStatic) processStaticHotel(matchedStatic);
            })
            .catch(() => { });
    };

    const fetchHotelRooms = (params) => {
        let parsedGuests = [];
        try {
            if (params.roomGuests) {
                parsedGuests = typeof params.roomGuests === "string" ? JSON.parse(params.roomGuests) : params.roomGuests;
            }
        } catch {
            parsedGuests = [];
        }

        const reqObj = {
            hotelCode: params.hotelCode,
            checkInDate: params.checkInDate,
            checkOutDate: params.checkOutDate,
            hotelCityCode: params.hotelCityCode,
            roomGuests: parsedGuests,
            nationality: params.nationality || "IN",
            supplierParamter: params.supplierParamter,
            currency: "INR",
        };

        Apiclient1.post("Hotel/HotelRooms", reqObj)
            .then((res) => {
                const roomsData = res?.data?.hotelRooms || res?.data || res || {};
                const rawList = roomsData?.rooms || roomsData?.roomList || res?.data?.rooms || res?.rooms || [];

                if (Array.isArray(rawList) && rawList.length > 0) {
                    const normalizedList = rawList.map((room, idx) => {
                        let ratePlans = room.ratePlans || [];
                        if (ratePlans.length === 0 && (room.price || room.totalPrice || room.avgPerRoomPerNightPrice)) {
                            ratePlans = [{
                                ratePlanId: room.ratePlanId || room.rateId || `rp_${idx}`,
                                ratePlanName: room.ratePlanName || room.roomName || room.name,
                                mealPlan: room.mealPlan || room.boardName || "Room Only",
                                price: room.price || { total: room.avgPerRoomPerNightPrice || room.totalPrice || 0 },
                                prefPrice: room.prefPrice || { total: room.avgPerRoomPerNightPrice || room.totalPrice || 0 },
                                refundable: room.refundable ?? false,
                                lastCancellationDate: room.lastCancellationDate || null,
                                cancellationPolicy: room.cancellationPolicy || [],
                                inclusions: room.inclusions || [],
                                amenities: room.amenities || [],
                                supplierParamter: room.supplierParamter || roomsData.supplierParamter || "",
                            }];
                        }
                        return {
                            ...room,
                            roomId: String(room.roomId ?? room.roomCode ?? idx),
                            roomName: room.roomName || room.name || "Standard Room",
                            roomDesc: room.roomDesc || room.description || "",
                            ratePlans: ratePlans.map((rp) => {
                                const rpPrice = Number(rp?.price?.total || rp?.prefPrice?.total || rp?.avgPerRoomPerNightPrice || rp?.roomPublishPrice || rp?.totalPrice || 0);
                                const isRef = rp.refundable ?? (rp.cancellationPolicy?.length > 0 ? (rp.cancellationPolicy[0]?.penaltyAmount === "0" || rp.cancellationPolicy[0]?.penaltyAmount === 0 || Number(rp.cancellationPolicy[0]?.penaltyAmount) === 0) : false);
                                return {
                                    ...rp,
                                    price: rp.price?.total ? rp.price : { total: rpPrice },
                                    prefPrice: rp.prefPrice?.total ? rp.prefPrice : { total: rpPrice },
                                    refundable: isRef,
                                    supplierParamter: rp.supplierParamter || room.supplierParamter || roomsData.supplierParamter || "",
                                    roomsId: roomsData.roomsId || rp.roomsId || "",
                                };
                            }),
                        };
                    });

                    setRoomsDetails({ ...roomsData, roomList: normalizedList });
                    setFilteredRooms(normalizedList);

                    setHotelDetailsRespObj((prev) => {
                        const updated = { ...prev };
                        if (roomsData.hotelName && !updated.hotelName) updated.hotelName = roomsData.hotelName;
                        if (roomsData.starRating && !updated.starRating) updated.starRating = roomsData.starRating;
                        if (roomsData.address && (!updated.addresses || !updated.addresses.address)) {
                            updated.addresses = { address: roomsData.address };
                        }
                        if (roomsData.hotelFacility?.length > 0 && (!updated.hotelFacility || updated.hotelFacility.length === 0)) {
                            updated.hotelFacility = roomsData.hotelFacility;
                        }
                        if (roomsData.roomsId) updated.roomsId = roomsData.roomsId;
                        if (roomsData.traceId) updated.traceId = roomsData.traceId;
                        if (roomsData.supplierParamter) updated.supplierParamter = roomsData.supplierParamter;
                        if (roomsData.reservationPolicy) updated.reservationPolicy = roomsData.reservationPolicy;
                        return updated;
                    });
                } else {
                    setRoomsDetails({ ...roomsData, roomList: [] });
                    setFilteredRooms([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("HotelRooms error:", err);
                setLoading(false);
            });
    };

    const navigateToCheckout = (roomsArray) => {
        const hotelDetSearchParams = queryString.parse(window.location.search);
        let roomsList = [];
        if (Array.isArray(roomsArray)) {
            roomsList = roomsArray;
        } else if (roomsArray?.combineRooms && Array.isArray(roomsArray.combineRooms)) {
            roomsList = roomsArray.combineRooms;
        } else if (roomsArray && typeof roomsArray === "object") {
            roomsList = [roomsArray];
        }

        if (roomsList.length > 0) {
            let ratePlans = roomsList.map((data) => ({
                roomsId: data.roomsId || data.roomsID || hotelDetailsRespObj?.roomsId || "",
                ratePlanId: data.ratePlanId || data.rateID || data.rateId || "",
            }));

            const roomsIdVal =
                roomsList[0]?.roomsId ||
                roomsList[0]?.roomsID ||
                hotelDetailsRespObj?.roomsId ||
                hotelDetailsRespObj?.roomsID ||
                hotelDetSearchParams?.roomsId ||
                hotelDetSearchParams?.roomsID ||
                "";

            const traceIdVal = hotelDetSearchParams?.traceId || hotelDetailsRespObj?.traceId || "";
            const supplierParamterVal =
                roomsList[0]?.supplierParamter ||
                hotelDetSearchParams?.supplierParamter ||
                hotelDetailsRespObj?.supplierParamter ||
                "";

            const hotelCodeVal =
                hotelDetSearchParams?.hotelCode ||
                hotelDetSearchParams?.hotelId ||
                hotelDetailsRespObj?.hotelCode ||
                "";

            let queryObj = {
                traceId: traceIdVal,
                hotelCode: hotelCodeVal,
                roomsId: roomsIdVal,
                supplierParamter: supplierParamterVal,
                ratePlans: JSON.stringify(ratePlans),
                checkInDate: hotelDetSearchParams?.checkInDate || hotelDetSearchParams?.checkIn || "",
                checkOutDate: hotelDetSearchParams?.checkOutDate || hotelDetSearchParams?.checkOut || "",
                roomGuests: hotelDetSearchParams?.roomGuests || "",
                nationality: hotelDetSearchParams?.nationality || "IN",
                currency: "INR",
            };

            const query = queryString.stringify(queryObj);
            history("/hotels/checkout?" + query);
        } else {
            message.error("Please select a valid Room & Rate Plan", 3);
        }
    };

    const handleMealPlanSelection = (values) => {
        setSelectedOptions(values);
        setSelectedMealPlan(values);
    };

    const roomHasMeal = (room, keywords) =>
        room?.ratePlans?.some(rp =>
            keywords.some(kw => (rp.mealPlan || "").toLowerCase().includes(kw.toLowerCase()))
        );
    const roomIsRefundable = (room) =>
        room?.ratePlans?.some(rp => rp.refundable === true);

    const getCancellationDateDisplay = (ratePlan) => {
        if (ratePlan?.lastCancellationDate && !ratePlan.lastCancellationDate.startsWith("0001") && moment(ratePlan.lastCancellationDate).isValid()) {
            return `Before ${moment(ratePlan.lastCancellationDate).format("DD MMM, YYYY")}`;
        }
        const penaltyRule = ratePlan?.cancellationPolicy?.find(p => Number(p.penaltyAmount) > 0);
        if (penaltyRule?.fromDate) {
            return `Before ${penaltyRule.fromDate.split(" ")[0]}`;
        }
        return null;
    };

    useEffect(() => {
        const list = roomsDetails?.roomList || [];
        if (!selectedMealPlan || selectedMealPlan.length === 0) {
            setFilteredRooms(list);
            return;
        }

        const wantsBreakfast = selectedMealPlan.includes("Breakfast");
        const wantsHalfBoard = selectedMealPlan.includes("Half Board");
        const wantsFullBoard = selectedMealPlan.includes("Full Board");
        const wantsRefundable = selectedMealPlan.includes("Refundable");

        const breakfastKeys = ["breakfast", "bed and breakfast", "bb"];
        const halfKeys = ["halfboard", "half board", "half-board"];
        const fullKeys = ["fullboard", "full board", "full-board"];

        setFilteredRooms(list.filter(room => {
            const hasMeal = (
                (wantsBreakfast && roomHasMeal(room, breakfastKeys)) ||
                (wantsHalfBoard && roomHasMeal(room, halfKeys)) ||
                (wantsFullBoard && roomHasMeal(room, fullKeys))
            );
            const mealFilterActive = wantsBreakfast || wantsHalfBoard || wantsFullBoard;
            const refundableOk = !wantsRefundable || roomIsRefundable(room);
            const mealOk = !mealFilterActive || hasMeal;
            return mealOk && refundableOk;
        }));
    }, [selectedMealPlan, roomsDetails.roomList]);

    const MapComponent = ({ center, zoom }) => {
        useEffect(() => {
            const mapContainer = document.getElementById("map");
            if (!mapContainer) return;
            const map = L.map("map").setView([center.lat, center.lng], zoom);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);

            const customIcon = L.icon({
                iconUrl: markerIcon,
                shadowUrl: markerShadow,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });

            L.marker([center.lat, center.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(hotelDetailsRespObj?.hotelName || "Hotel Location")
                .openPopup();

            return () => {
                map.remove();
            };
        }, [center, zoom]);

        return <div id="map" style={{ height: "420px", width: "100%", borderRadius: "12px" }}></div>;
    };

    const handelCancellationPolicy = (roomInfo) => {
        setRoomsData(roomInfo);
        let cancellationdata = roomInfo?.cancellationPolicy ?? null;
        setCancellationInfo(cancellationdata);
        setShowCancellationModal(true);
    };

    const handleinclusiondata = (val) => {
        setinclusiondata(val);
        setisinclusionvisible(true);
    };

    const viewMap = () => {
        const { latitude, longitude } = hotelDetailsRespObj;
        if (latitude && longitude) {
            const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            window.open(googleMapsUrl, "_blank");
        } else {
            setActiveTab("location");
        }
    };

    const handleBackToResults = () => {
        if (window.history.length > 1) {
            history(-1);
        } else {
            const p = queryString.parse(window.location.search);
            const query = queryString.stringify({
                cityId: p.hotelCityCode || "",
                checkIn: p.checkInDate || "",
                checkOut: p.checkOutDate || "",
                roomGuests: p.roomGuests || "",
                nationality: p.nationality || "IN",
            });
            history(`/hotels/results?${query}`);
        }
    };

    const scrollToRooms = () => {
        setActiveTab("rooms");
        if (roomsSectionRef.current) {
            roomsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Date & Guest calculations
    const hotelDetUrlParams = queryString.parse(window.location.search);
    const checkInVal = hotelDetUrlParams?.checkInDate || hotelDetUrlParams?.checkIn;
    const checkOutVal = hotelDetUrlParams?.checkOutDate || hotelDetUrlParams?.checkOut;
    const checkInMoment = checkInVal ? moment(checkInVal) : (hotelDetailsRespObj?.request?.checkInDate ? moment(hotelDetailsRespObj.request.checkInDate) : null);
    const checkOutMoment = checkOutVal ? moment(checkOutVal) : (hotelDetailsRespObj?.request?.checkOutDate ? moment(hotelDetailsRespObj.request.checkOutDate) : null);
    const nightsCount = (checkInMoment && checkOutMoment) ? Math.max(1, checkOutMoment.diff(checkInMoment, "days")) : 1;

    const checkInDateFormatted = checkInMoment ? checkInMoment.format("DD MMM, YYYY") : "Select Date";
    const checkOutDateFormatted = checkOutMoment ? checkOutMoment.format("DD MMM, YYYY") : "Select Date";

    let urlRoomGuests = [];
    try {
        urlRoomGuests = hotelDetUrlParams?.roomGuests ? JSON.parse(hotelDetUrlParams.roomGuests) : [];
    } catch {
        urlRoomGuests = [];
    }

    const totalAdults = urlRoomGuests.reduce((acc, cur) => acc + (cur.noOfAdults || 0), 0) || 1;
    const totalChilds = urlRoomGuests.reduce((acc, cur) => acc + (cur.noOfChilds || cur.noOfChildren || 0), 0);
    const totalRooms = urlRoomGuests.length || 1;

    const firstRoom = filteredRooms?.[0];
    const firstRatePlan = firstRoom?.ratePlans?.[0];
    const hotelNameDisplay = hotelDetailsRespObj?.hotelName || hotelDetailsRespObj?.HotelName || hotelDetUrlParams?.hotelName || "";
    const starRatingDisplay = hotelDetailsRespObj?.starRating || hotelDetailsRespObj?.StarRating || hotelDetailsRespObj?.rating || hotelDetUrlParams?.starRating || "";
    const addressDisplay = hotelDetailsRespObj?.addresses?.address || hotelDetailsRespObj?.address || hotelDetailsRespObj?.hotelAddress || hotelDetUrlParams?.address || "";

    const startingPrice = useMemo(() => {
        let min = Infinity;
        roomsDetails?.roomList?.forEach(r => {
            r?.ratePlans?.forEach(rp => {
                const p = Number(rp?.price?.total || rp?.prefPrice?.total || rp?.avgPerRoomPerNightPrice || rp?.roomPublishPrice || 0);
                if (p > 0 && p < min) min = p;
            });
        });
        const firstP = Number(firstRatePlan?.price?.total || firstRatePlan?.avgPerRoomPerNightPrice || 0);
        return min !== Infinity ? min : firstP;
    }, [roomsDetails.roomList, firstRatePlan]);

    const roomSliderSettings = {
        dots: true,
        infinite: true,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
    };

    return (
        <div className="hotel-details-page-v2">
            {/* Top Navigation & Breadcrumb */}
            <div className="hotel-top-nav-bar">
                <div className="container-custom">
                    <button className="back-btn-pill" onClick={handleBackToResults}>
                        <ArrowLeftOutlined />
                        <span>Back to Search Results</span>
                    </button>
                    <div className="hotel-search-badge-summary">
                        <span><CalendarOutlined /> {checkInDateFormatted} - {checkOutDateFormatted}</span>
                        <span className="divider">•</span>
                        <span><UserOutlined /> {totalRooms} Room{totalRooms > 1 ? "s" : ""}, {totalAdults + totalChilds} Guest{totalAdults + totalChilds > 1 ? "s" : ""}</span>
                    </div>
                </div>
            </div>

            <div className="container-custom hotel-main-content">
                {/* Hero Header Card */}
                <div className="hotel-hero-header-card">
                    {loading ? (
                        <Skeleton active paragraph={{ rows: 2 }} />
                    ) : (
                        <div className="hero-header-flex">
                            <div className="hero-title-area">
                                <div className="stars-and-badge">
                                    {Number(starRatingDisplay) > 0 && (
                                        <div className="luxury-star-badge">
                                            {[...Array(Math.min(5, Math.floor(Number(starRatingDisplay))))].map((_, i) => (
                                                <StarFilled key={i} className="star-gold" />
                                            ))}
                                            <span className="star-text">{starRatingDisplay} Star Hotel</span>
                                        </div>
                                    )}
                                    <span className="verified-badge">
                                        <SafetyCertificateOutlined /> Verified Property
                                    </span>
                                </div>
                                <h1 className="main-hotel-name">{hotelNameDisplay || "Luxury Hotel & Suites"}</h1>
                                <p className="hotel-main-address">
                                    <EnvironmentOutlined className="pin-icon" />
                                    <span>{addressDisplay || "Prime Location City Center"}</span>
                                    <button type="button" className="view-map-link-btn" onClick={viewMap}>
                                        View on Map
                                    </button>
                                </p>
                            </div>

                            <div className="hero-price-cta-box">
                                {startingPrice > 0 && (
                                    <div className="price-tag-block">
                                        <span className="starts-from">Starting from</span>
                                        <div className="price-val">
                                            <span className="currency">₹</span>
                                            <span className="amount">{Math.round(startingPrice).toLocaleString("en-IN")}</span>
                                            <span className="per-night">/ night</span>
                                        </div>
                                        <span className="tax-subtext">+ taxes & fees applicable</span>
                                    </div>
                                )}
                                <Button type="primary" size="large" className="select-rooms-cta-btn" onClick={scrollToRooms}>
                                    Select Room
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hero 2-Column: Left Gallery & Right Quick Booking Card */}
                <div className="hotel-visual-section-grid">
                    {/* Left Gallery */}
                    <div className="hotel-gallery-wrapper">
                        {hotelDetailsRespObj?.images?.length > 0 ? (
                            <ImagesLightbox hotelImages={hotelDetailsRespObj.images} />
                        ) : loading ? (
                            <div className="gallery-skeleton-box">
                                <Skeleton.Image active style={{ width: "100%", height: "420px", borderRadius: "12px" }} />
                            </div>
                        ) : (
                            <ImagesLightbox hotelImages={[ImBUrl + "images/hotels/no_photo.png"]} />
                        )}
                    </div>

                    {/* Right Trip Summary Card & Quick Filters */}
                    <div className="hotel-summary-sidebar-card">
                        <div className="sidebar-card-header">
                            <h3>Reservation Overview</h3>
                            <span className="nights-badge">{nightsCount} Night{nightsCount > 1 ? "s" : ""}</span>
                        </div>

                        <div className="stay-dates-pill-grid">
                            <div className="date-block checkin">
                                <span className="lbl">CHECK-IN</span>
                                <strong>{checkInDateFormatted}</strong>
                                <span className="time-lbl">From 2:00 PM</span>
                            </div>
                            <div className="date-block checkout">
                                <span className="lbl">CHECK-OUT</span>
                                <strong>{checkOutDateFormatted}</strong>
                                <span className="time-lbl">Until 11:00 AM</span>
                            </div>
                        </div>

                        <div className="occupancy-pill">
                            <div className="occ-icon"><UserOutlined /></div>
                            <div className="occ-info">
                                <span className="occ-title">Rooms & Guests</span>
                                <span className="occ-desc">{totalRooms} Room{totalRooms > 1 ? "s" : ""} • {totalAdults} Adult{totalAdults > 1 ? "s" : ""}{totalChilds > 0 ? ` • ${totalChilds} Child` : ""}</span>
                            </div>
                        </div>

                        {/* Quick Live Filters */}
                        <div className="quick-filter-section">
                            <span className="qf-title">Quick Room Filters</span>
                            <div className="filter-chips-wrap">
                                {["Breakfast", "Half Board", "Full Board", "Refundable"].map((opt) => {
                                    const isSelected = selectedMealPlan.includes(opt);
                                    return (
                                        <button
                                            key={opt}
                                            type="button"
                                            className={`filter-chip ${isSelected ? "active" : ""}`}
                                            onClick={() => {
                                                if (isSelected) {
                                                    handleMealPlanSelection(selectedMealPlan.filter((x) => x !== opt));
                                                } else {
                                                    handleMealPlanSelection([...selectedMealPlan, opt]);
                                                }
                                            }}
                                        >
                                            {isSelected && <CheckOutlined className="chk-icon" />}
                                            {opt}
                                        </button>
                                    );
                                })}
                                {selectedMealPlan.length > 0 && (
                                    <button
                                        type="button"
                                        className="filter-chip reset"
                                        onClick={() => handleMealPlanSelection([])}
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Location Preview Button */}
                        <div className="map-preview-card" onClick={viewMap}>
                            <img src={ImBUrl + "images/map-image.svg"} alt="Map Preview" />
                            <div className="map-overlay">
                                <CompassOutlined />
                                <span>Explore Area on Map</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Section Navigation Tabs */}
                <div className="hotel-sticky-nav-tabs">
                    <button
                        className={`tab-item-btn ${activeTab === "rooms" ? "active" : ""}`}
                        onClick={() => setActiveTab("rooms")}
                    >
                        <AppstoreOutlined />
                        <span>Available Rooms ({filteredRooms?.length || 0})</span>
                    </button>
                    <button
                        className={`tab-item-btn ${activeTab === "about" ? "active" : ""}`}
                        onClick={() => setActiveTab("about")}
                    >
                        <InfoCircleOutlined />
                        <span>About Hotel</span>
                    </button>
                    <button
                        className={`tab-item-btn ${activeTab === "facility" ? "active" : ""}`}
                        onClick={() => setActiveTab("facility")}
                    >
                        <CoffeeOutlined />
                        <span>Amenities & Facilities</span>
                    </button>
                    <button
                        className={`tab-item-btn ${activeTab === "location" ? "active" : ""}`}
                        onClick={() => setActiveTab("location")}
                    >
                        <CompassOutlined />
                        <span>Location & Map</span>
                    </button>
                    <button
                        className={`tab-item-btn ${activeTab === "policies" ? "active" : ""}`}
                        onClick={() => setActiveTab("policies")}
                    >
                        <FileTextOutlined />
                        <span>Hotel Policies</span>
                    </button>
                </div>

                {/* Tab Content Panels */}
                <div className="hotel-tab-content-container" ref={roomsSectionRef}>
                    {/* 1. ROOMS TAB */}
                    {activeTab === "rooms" && (
                        <div className="rooms-tab-pane">
                            <div className="rooms-header-row">
                                <div>
                                    <h2 className="section-title">Available Room Options</h2>
                                    <p className="section-subtitle">Select the room type and meal plan that best matches your trip</p>
                                </div>
                                {selectedMealPlan.length > 0 && (
                                    <div className="active-filter-alert">
                                        Showing rooms with: <strong>{selectedMealPlan.join(", ")}</strong>
                                        <button onClick={() => handleMealPlanSelection([])}>Reset</button>
                                    </div>
                                )}
                            </div>

                            {loading ? (
                                <div className="rooms-loading-state">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="room-card-modern-skeleton">
                                            <Skeleton active avatar paragraph={{ rows: 3 }} />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredRooms?.length > 0 ? (
                                <div className="rooms-card-list">
                                    {filteredRooms.map((hotelRoom, index) => (
                                        <div className="room-card-modern" key={hotelRoom?.roomId || index}>
                                            <div className="room-card-header">
                                                <div className="room-title-area">
                                                    <h3 className="room-name">{hotelRoom?.roomName || hotelRoom?.roomDesc}</h3>
                                                    {hotelRoom?.roomDesc && hotelRoom.roomDesc !== hotelRoom.roomName && (
                                                        <p className="room-short-desc">{hotelRoom.roomDesc}</p>
                                                    )}
                                                </div>
                                                <div className="room-occupancy-badges">
                                                    <span className="occ-badge">
                                                        <UserOutlined /> Max Adults: {hotelRoom?.maxAdult || hotelRoom?.adultCount || hotelRoom?.maxOccupancy || totalAdults}
                                                    </span>
                                                    <span className="occ-badge">
                                                        Children: {hotelRoom?.minChildren ?? hotelRoom?.childCount ?? totalChilds}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Room Images slider if available */}
                                            {hotelRoom?.roomImageList?.length > 0 && (
                                                <div className="room-slider-wrapper">
                                                    <Slider {...roomSliderSettings}>
                                                        {hotelRoom.roomImageList.map((img, imgIdx) => (
                                                            <div key={imgIdx} className="room-slide-item">
                                                                <img
                                                                    src={img}
                                                                    alt={hotelRoom.roomName}
                                                                    onError={(e) => { e.target.src = ImBUrl + "images/htImgs/no-htl.jpg"; }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </Slider>
                                                </div>
                                            )}

                                            {/* Rate Plans List */}
                                            <div className="rate-plans-table">
                                                <div className="rate-table-head">
                                                    <div className="col-plan">BENEFITS & MEAL PLAN</div>
                                                    <div className="col-policy">CANCELLATION POLICY</div>
                                                    <div className="col-price">PRICE PER NIGHT</div>
                                                    <div className="col-action"></div>
                                                </div>

                                                {hotelRoom?.ratePlans?.map((ratePlan, rpIdx) => (
                                                    <div key={rpIdx} className="rate-plan-row">
                                                        {/* Inclusions / Meal Plan */}
                                                        <div className="col-plan">
                                                            {ratePlan?.ratePlanName && (
                                                                <div className="rate-plan-tag-name">{ratePlan.ratePlanName}</div>
                                                            )}
                                                            {ratePlan?.mealPlan && (
                                                                <div className="meal-plan-pill">
                                                                    <CoffeeOutlined /> {ratePlan.mealPlan.replace(/_/g, " ")}
                                                                </div>
                                                            )}
                                                            {ratePlan?.inclusions?.length > 0 && (
                                                                <div className="inclusions-chips-list">
                                                                    {ratePlan.inclusions.slice(0, 3).map((inc, iIdx) => (
                                                                        <span key={iIdx} className="inc-chip">
                                                                            <CheckCircleFilled className="chk-green" /> {inc}
                                                                        </span>
                                                                    ))}
                                                                    {ratePlan.inclusions.length > 3 && (
                                                                        <button
                                                                            type="button"
                                                                            className="more-inc-btn"
                                                                            onClick={() => handleinclusiondata(ratePlan.inclusions)}
                                                                        >
                                                                            +{ratePlan.inclusions.length - 3} more
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Cancellation Policy */}
                                                        <div className="col-policy">
                                                            {ratePlan?.refundable ? (
                                                                <div className="policy-refundable-wrap">
                                                                    <span className="refundable-pill">
                                                                        <CheckOutlined /> Free Cancellation
                                                                    </span>
                                                                    {getCancellationDateDisplay(ratePlan) && (
                                                                        <span className="cancellation-date-text">
                                                                            {getCancellationDateDisplay(ratePlan)}
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        className="view-policy-btn"
                                                                        onClick={() => handelCancellationPolicy({ ...ratePlan, roomName: hotelRoom.roomName })}
                                                                    >
                                                                        View Policy Rules
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="policy-nonref-wrap">
                                                                    <span className="non-refundable-pill">Non-Refundable</span>
                                                                    <span className="non-ref-note">This booking cannot be cancelled or modified for a refund.</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Price */}
                                                        <div className="col-price">
                                                            <div className="price-display-box">
                                                                <span className="currency-symbol">₹</span>
                                                                <span className="amount-num">
                                                                    {Number(ratePlan?.price?.total || ratePlan?.prefPrice?.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <span className="per-night-label">per night</span>
                                                        </div>

                                                        {/* CTA */}
                                                        <div className="col-action">
                                                            <Button
                                                                type="primary"
                                                                className="choose-room-primary-btn"
                                                                onClick={() => navigateToCheckout([{
                                                                    roomId: hotelRoom.roomId,
                                                                    ratePlanId: ratePlan.ratePlanId,
                                                                    roomsId: hotelDetailsRespObj.roomsId,
                                                                    roomName: hotelRoom.roomName,
                                                                    price: ratePlan.price,
                                                                    refundable: ratePlan.refundable,
                                                                    cancellationPolicy: ratePlan.cancellationPolicy,
                                                                    lastCancellationDate: ratePlan.lastCancellationDate,
                                                                    supplierParamter: ratePlan.supplierParamter,
                                                                }])}
                                                            >
                                                                Book Room
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-rooms-fallback-card">
                                    <div className="fallback-content">
                                        <img src={ImBUrl + "images/filterno.jpg"} alt="No rooms" />
                                        <h3>No Rooms Match Your Selected Filters</h3>
                                        <p>Try clearing your meal plan or refundability filters to view all available room categories.</p>
                                        <Button type="primary" onClick={() => handleMealPlanSelection([])}>
                                            Clear All Filters
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. ABOUT TAB */}
                    {activeTab === "about" && (
                        <div className="generic-tab-pane">
                            <h2 className="section-title">About {hotelNameDisplay || "the Property"}</h2>
                            <div className="editorial-description-content">
                                {hotelDetailsRespObj?.description ? (
                                    parse(hotelDetailsRespObj.description)
                                ) : hotelDetailsRespObj?.reservationPolicy ? (
                                    <p>{hotelDetailsRespObj.reservationPolicy}</p>
                                ) : (
                                    <p className="no-info-text">No detailed description currently provided for this property.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. FACILITY TAB */}
                    {activeTab === "facility" && (
                        <div className="generic-tab-pane">
                            <h2 className="section-title">Hotel Facilities & Amenities</h2>
                            <p className="section-subtitle">Services and features provided on premise for guests</p>
                            {hotelDetailsRespObj?.hotelFacility?.length > 0 ? (
                                <div className="facilities-pill-grid">
                                    {hotelDetailsRespObj.hotelFacility.map((facility, index) => (
                                        <div key={index} className="facility-grid-item">
                                            <CheckCircleFilled className="fac-icon" />
                                            <span>{facility}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-info-text">No facilities listed for this property.</p>
                            )}
                        </div>
                    )}

                    {/* 4. LOCATION TAB */}
                    {activeTab === "location" && (
                        <div className="generic-tab-pane">
                            <h2 className="section-title">Location & Surroundings</h2>
                            <p className="location-address-text">
                                <EnvironmentOutlined /> {defaultProps?.center?.address || addressDisplay || "City Center"}
                            </p>
                            <div className="map-embed-wrapper">
                                <MapComponent center={{ lat: defaultProps.center.lat, lng: defaultProps.center.lng }} zoom={defaultProps.zoom} />
                            </div>
                        </div>
                    )}

                    {/* 5. POLICIES TAB */}
                    {activeTab === "policies" && (
                        <div className="generic-tab-pane">
                            <h2 className="section-title">Hotel Policies & Instructions</h2>
                            <div className="policies-cards-grid">
                                <div className="policy-info-card">
                                    <h3>Check-In & Check-Out Guidelines</h3>
                                    <ul className="policy-check-list">
                                        <li><CheckOutlined /> Government-issued photo identification and credit card / cash deposit required at check-in.</li>
                                        <li><CheckOutlined /> Primary guest must be at least 18 years of age.</li>
                                        <li><CheckOutlined /> Early check-in / late check-out is subject to room availability upon arrival.</li>
                                        <li><CheckOutlined /> In India, valid photo ID with address proof (Aadhar/Passport/Voter ID) is mandatory for all guests.</li>
                                    </ul>
                                </div>

                                <div className="policy-info-card">
                                    <h3>Special & Important Instructions</h3>
                                    <ul className="policy-check-list">
                                        <li><CheckOutlined /> Please notify the property at least 24 hours prior to arrival for late check-in arrangements.</li>
                                        <li><CheckOutlined /> Special requests cannot be guaranteed and are subject to availability upon check-in.</li>
                                        <li><CheckOutlined /> Optional services (telephone, minibar, room service, laundry) will incur additional on-site fees.</li>
                                    </ul>
                                </div>

                                <div className="policy-info-card full-width">
                                    <h3>Disclaimer & Booking Notification</h3>
                                    <p className="policy-disclaimer-text">
                                        Amenities and property features are provided directly by suppliers and are subject to availability.
                                        We recommend confirming specific property requirements directly with the hotel prior to arrival.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancellation Policy Modal */}
            <Modal
                wrapClassName="modalHeader amenitiesModal"
                title="Cancellation Policy Details"
                open={showcancellationModal}
                onCancel={() => setShowCancellationModal(false)}
                footer={null}
                width={560}
                centered
            >
                <div className="cancellation-modal-content">
                    {roomsData != null && (
                        <>
                            <div className="cancellation-room-header">
                                <h4>{roomsData.roomName?.split(",")[0]}</h4>
                                {roomsData.refundable ? (
                                    <Tag color="success">Refundable Room</Tag>
                                ) : (
                                    <Tag color="error">Non-Refundable Room</Tag>
                                )}
                            </div>

                            {cancellationInfo?.length > 0 ? (
                                <div className="cancellation-rules-list">
                                    {cancellationInfo.map((can, i) => (
                                        <div key={i} className={`cancellation-rule-card ${can?.penaltyAmount > 0 ? "penalty" : "free"}`}>
                                            <div className="rule-date-box">
                                                <CalendarOutlined className="cal-icon" />
                                                <div className="rule-dates">
                                                    <div><strong>From:</strong> {can?.fromDate?.split(" ")[0]}</div>
                                                    <div><strong>To:</strong> {can?.toDate?.split(" ")[0]}</div>
                                                </div>
                                            </div>
                                            <div className="rule-penalty-box">
                                                <span className="penalty-label">Cancellation Charge:</span>
                                                <strong className="penalty-val">
                                                    {can?.chargeType === "Percentage"
                                                        ? `${can.penaltyAmount}%`
                                                        : can?.chargeType === "Nights"
                                                            ? `${can.penaltyAmount} Night(s)`
                                                            : `₹${can?.penaltyAmount || 0}`}
                                                </strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-cancellation-text">No detailed penalty breakdown provided by the supplier.</p>
                            )}
                        </>
                    )}
                </div>
            </Modal>

            {/* Inclusions Modal */}
            <Modal
                wrapClassName="modalHeader amenitiesModal"
                title="Room Inclusions & Amenities"
                open={isinclusionvisible}
                onCancel={() => setisinclusionvisible(false)}
                footer={null}
                width={500}
                centered
            >
                <div className="inclusions-modal-body">
                    {inclusiondata?.length > 0 ? (
                        <div className="inclusions-grid-list">
                            {inclusiondata.map((inc, idx) => (
                                <div key={idx} className="inclusion-popup-item">
                                    <CheckCircleFilled style={{ color: "#10b981", marginRight: 8 }} />
                                    <span>{inc}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No extra inclusions listed.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default HotelDet;
