//**** After Changing structure for room resp? ****//

import React, { useState, useRef, useEffect, useMemo } from "react";

import { Button, Card, Col, Skeleton, Rate, Row, message, Modal, Radio, Select, } from "antd";
import { useNavigate } from "react-router";
import "./HotelDet.scss";

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import parse from 'html-react-parser';
import moment from "moment";
import { Tooltip } from 'antd';
import { useSelector } from "react-redux";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ImagesLightbox from "../../components/ImagesLightbox/ImagesLightbox";
import Apiclient1 from "../../Helpers/Apiclient1";
import ApiClient from "../../Helpers/ApiClient";

import queryString from "query-string";
import HotelCardImage from "./HotelCardImage";
import { EnvironmentOutlined, StarTwoTone } from "@ant-design/icons";

import "./NewHotelDet.scss";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ScrollToTopButton from "../../common/ScrollToTop";

import { Checkbox } from "antd";


const { Group } = Checkbox;
const { Option } = Select;
const ImBUrl = import.meta.env.VITE_Image_URL;
const HotelDet = () => {
    let history = useNavigate();

    const user = useSelector((state) => state.auth.user);

    const [filteredRooms, setFilteredRooms] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [hotelDetailsRespObj, setHotelDetailsRespObj] = useState({});
    const [selectedMealPlan, setSelectedMealPlan] = useState([]);
    const [isRoomModal, setIsRoomModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roomsDetails, setRoomsDetails] = useState({ roomList: [], type: "" });
    const [isShowModal, setIsShowModal] = useState(false);
    const [roomImagesModal, setRoomImagesModal] = useState({});
    const [selectedRooms, setSelectedRooms] = useState({});
    const [showcancellationModal, setShowCancellationModal] = useState(false);
    const [roomsData, setRoomsData] = useState(null);
    const [inclusiondata, setinclusiondata] = useState([]);
    const [cancellationInfo, setCancellationInfo] = useState([]);
    const [isinclusionvisible, setisinclusionvisible] = useState(false);
    const [activeTab, setActiveTab] = useState('rooms');
    const [defaultProps, setDefaultProps] = useState({
        center: {
            address: "",
            lat: 17.42159,
            lng: 78.33752,
        },
        zoom: 12,
        mapVisible: true,
    });
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
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
            roomGuests: p.roomGuests || "",       // still JSON string; parsed inside fetchHotelRooms
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

            // GetHotelDetails returns addresses as an ARRAY e.g. [{address:"", cityName:""}]
            // and facilities under the key 'facilities' (not 'hotelFacility')
            const mapping = matchedStatic.mappingHotelDetails?.[0] || {};

            // Images: direct array on static response
            const staticImages =
                (matchedStatic.images?.length > 0 ? matchedStatic.images : null) ||
                (matchedStatic.imageList?.length > 0 ? matchedStatic.imageList : null) ||
                (mapping.images?.length > 0 ? mapping.images : null) ||
                [];

            // Facilities: key is 'facilities' in GetHotelDetails (not 'hotelFacility')
            const staticFacilities =
                (matchedStatic.facilities?.length > 0 ? matchedStatic.facilities : null) ||
                (matchedStatic.hotelFacility?.length > 0 ? matchedStatic.hotelFacility : null) ||
                (matchedStatic.hotelFacilities?.length > 0 ? matchedStatic.hotelFacilities : null) ||
                (mapping.hotelFacility?.length > 0 ? mapping.hotelFacility : null) ||
                [];

            // Description
            const staticDesc =
                matchedStatic.description ||
                matchedStatic.hotelDescription ||
                (typeof matchedStatic.hotelContent === "string" ? matchedStatic.hotelContent : matchedStatic.hotelContent?.description) ||
                mapping.hotelContent ||
                "";

            // Address: GetHotelDetails returns addresses as ARRAY [{address, cityName}]
            const addrArr = matchedStatic.addresses;
            const staticAddress =
                (Array.isArray(addrArr) && addrArr.length > 0)
                    ? (addrArr[0].address || addrArr[0].Address || "")
                    : (addrArr?.address || matchedStatic.address || matchedStatic.hotelAddress || mapping.addresses?.[0]?.address || mapping.addresses?.address || "");

            // Lat/Lng
            const staticLat = matchedStatic.latitude || matchedStatic.lat || matchedStatic.Latitude || mapping.latitude;
            const staticLng = matchedStatic.longitude || matchedStatic.lng || matchedStatic.Longitude || mapping.longitude;

            const staticRating = matchedStatic.starRating || matchedStatic.StarRating || matchedStatic.rating || mapping.starRating;
            const staticName = matchedStatic.hotelName || matchedStatic.HotelName || matchedStatic.propertyName || matchedStatic.PropertyName;

            console.log("[processStaticHotel] images:", staticImages.length, "| address:", staticAddress, "| lat:", staticLat, "| lng:", staticLng);

            setHotelDetailsRespObj((prev) => {
                const updated = { ...prev };

                // Always prefer static images — HotelRooms does NOT return images
                if (staticImages.length > 0) {
                    updated.images = staticImages;
                }
                // Facilities
                if (staticFacilities.length > 0 && (!updated.hotelFacility || updated.hotelFacility.length === 0)) {
                    updated.hotelFacility = staticFacilities;
                }
                // Description
                if (staticDesc && !updated.description) {
                    updated.description = staticDesc;
                }
                // Address: normalize to {address: string} for consistent rendering
                if (staticAddress && (!updated.addresses || !updated.addresses.address)) {
                    updated.addresses = { address: staticAddress };
                }
                // Hotel name
                if (staticName && !updated.hotelName) {
                    updated.hotelName = staticName;
                }
                // Star rating
                if (staticRating && !updated.starRating) {
                    updated.starRating = staticRating;
                }
                // Lat/Lng: always prefer static — HotelRooms does NOT return these
                if (staticLat) updated.latitude = staticLat;
                if (staticLng) updated.longitude = staticLng;

                return updated;
            });

            // Update map if we have valid coordinates
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
                console.log("StaticData/GetHotelDetails response:", staticRes);
                const rawStaticHotels =
                    staticRes?.hotelDetails ||
                    staticRes?.hotels ||
                    staticRes?.data?.hotelDetails ||
                    staticRes?.data?.hotels ||
                    staticRes?.data ||
                    (Array.isArray(staticRes) ? staticRes : []);

                let matchedStatic = null;
                if (Array.isArray(rawStaticHotels) && rawStaticHotels.length > 0) {
                    matchedStatic = rawStaticHotels.find(h =>
                        String(h.hotelId || h.HotelId || h.hotelCode || h.HotelCode || "") === String(params.hotelCode)
                    ) || rawStaticHotels[0];
                } else if (rawStaticHotels && typeof rawStaticHotels === "object" && !Array.isArray(rawStaticHotels)) {
                    matchedStatic = rawStaticHotels;
                }

                if (matchedStatic) {
                    processStaticHotel(matchedStatic);
                } else {
                    fetchV2StaticDetails(params, processStaticHotel);
                }
            })
            .catch((err) => {
                console.warn("StaticData/GetHotelDetails error, trying fallback:", err);
                fetchV2StaticDetails(params, processStaticHotel);
            });
    };

    const fetchV2StaticDetails = (params, processStaticHotel) => {
        ApiClient.post("hotels-v2/hotelstaticdetails", {
            traceId: params.traceId || "string",
            cityId: params.hotelCityCode || "",
            hotelId: params.hotelCode || "",
        })
            .then((res) => {
                if (res?.data?.hotelDetails?.length > 0) {
                    const matchedStatic = res.data.hotelDetails.find(h =>
                        String(h.hotelId || h.mappingHotelDetails?.[0]?.hotelId) === String(params.hotelCode)
                    ) || res.data.hotelDetails[0];
                    processStaticHotel(matchedStatic);
                }
            })
            .catch((err) => {
                console.error("V2 static details error:", err);
            });
    };

    const fetchHotelRooms = (params) => {
        setLoading(true);

        // Parse roomGuests from URL (JSON stringified by HotelsList)
        let roomGuests = [];
        try {
            roomGuests = params.roomGuests ? JSON.parse(params.roomGuests) : [];
        } catch { roomGuests = []; }

        const requestBody = {
            traceId: params.traceId || "",
            checkInDate: params.checkInDate || "",
            checkOutDate: params.checkOutDate || "",
            currency: params.currency || "INR",
            hotelCode: params.hotelCode || "",
            hotelCityCode: params.hotelCityCode || "",
            roomGuests: roomGuests,
            nationality: params.nationality || "IN",
            supplierParamter: params.supplierParamter || "",
        };

        console.log("HotelRooms request body:", requestBody);

        Apiclient1.post("Hotel/HotelRooms", requestBody)
            .then((res) => {
                console.log("HotelRooms response:", res);
                const data = res;

                const hasErrors = data?.errors?.length > 0 && data.errors.some(e => e.errorCode);
                if (!hasErrors) {
                    setHotelDetailsRespObj((prev) => {
                        // ⚠️ DO NOT spread `...data` here — HotelRooms returns images:[] / undefined
                        // which would overwrite the 24 images already loaded from GetHotelDetails.
                        // Only pick specific fields that HotelRooms actually provides.
                        return {
                            ...prev,
                            // Basic hotel info — prefer static (prev) if already set
                            hotelName: prev?.hotelName || data?.hotelName || data?.HotelName || "",
                            starRating: prev?.starRating || data?.starRating || data?.StarRating || data?.rating || "",
                            description: data?.description || prev?.description || "",
                            // Rooms-specific fields from HotelRooms response
                            traceId: data?.traceId || prev?.traceId || "",
                            hotelCode: data?.hotelCode || prev?.hotelCode || "",
                            roomsId: data?.roomsId || data?.roomsID || prev?.roomsId || "",
                            fixedFormat: data?.fixedFormat || prev?.fixedFormat || "",
                            supplier: data?.supplier || prev?.supplier || "",
                            // STATIC DATA — NEVER overwrite with rooms response (rooms returns empty/undefined)
                            images: prev?.images?.length > 0 ? prev.images : (data?.images?.length > 0 ? data.images : []),
                            hotelFacility: prev?.hotelFacility?.length > 0 ? prev.hotelFacility : (data?.hotelFacility || []),
                            addresses: prev?.addresses?.address
                                ? prev.addresses
                                : (data?.addresses?.address
                                    ? data.addresses
                                    : (Array.isArray(data?.addresses) && data.addresses[0]?.address
                                        ? { address: data.addresses[0].address }
                                        : (data?.hotelAddress ? { address: data.hotelAddress } : { address: "" }))),
                            latitude: prev?.latitude || data?.latitude || "",
                            longitude: prev?.longitude || data?.longitude || "",
                        };
                    });

                    // Only update map if static hasn't already set it and rooms has coords
                    if (data?.latitude && data?.longitude) {
                        setDefaultProps((prev) => ({
                            ...prev,
                            center: {
                                address: prev.center.address || data?.addresses?.address || "",
                                lat: prev.center.lat !== 17.42159 ? prev.center.lat : parseFloat(data.latitude),
                                lng: prev.center.lng !== 78.33752 ? prev.center.lng : parseFloat(data.longitude),
                            },
                            mapVisible: true,
                        }));
                    }

                    const rooms = data?.rooms || [];
                    setRoomsDetails({
                        roomList: rooms,
                        type: data?.fixedFormat || "",
                    });
                } else {
                    console.warn("HotelRooms API errors:", data?.errors);
                    setRoomsDetails({ roomList: [], type: "" });
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("HotelRooms error:", err);
                setLoading(false);
            });
    };

    const handleSelectedRooms = (hotelRoom, key) => {
        let copyData = { ...selectedRooms };
        copyData[key] = hotelRoom;
        setSelectedRooms(copyData);
    };

    const handleCheckout = () => {
        let array = Object.keys(selectedRooms).map((key) => selectedRooms[key]);
        if (roomsDetails.roomList.length === array.length) {
            navigateToCheckout(array);
        } else {
            message.error("Please select Rooms", 3);
        }
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
            // Build ratePlans array matching new HotelPrice API contract
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

            const traceIdVal =
                hotelDetSearchParams?.traceId ||
                hotelDetailsRespObj?.traceId ||
                "";

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
            console.log("Navigating to checkout with query:", query);
            history(`/hotels/checkout?${query}`);
        } else {
            message.error("Please select Rooms", 3);
        }
    };

    const backToList = () => {
        history("/hotels/listing");
    };

    let myRef1 = useRef(null);
    let myRef2 = useRef(null);
    let myRef3 = useRef(null);
    let myRef4 = useRef(null);
    let myRef5 = useRef(null);

    const scrollToRef = (ref) => {

        try {
            ref.current.scrollIntoView({
                behavior: "smooth",
            });
        } catch (error) { }
    };



    const onHandleModal = (roomObj) => {
        setRoomImagesModal(roomObj);
        setIsShowModal(true);
    };

    const getRoomDec = (roomDesc, ratePlans) => {
        return (
            <div className="tooltipWrapper">
                <p>
                    <b> {roomDesc} </b>
                </p>
                <p>Policies:</p>
                {ratePlans.cancellationPolicy[0]?.policies.map((pol, i) => (
                    <div key={pol + i}>
                        {/* {ReactHtmlParser(pol)} */}
                        {pol}
                    </div>
                ))}
            </div>
        );
    };
    const Marker = ({ text }) => (
        <div className="markerWrapper">
            <EnvironmentOutlined />
        </div>
    );
    const guestCount = (roomGuests) => {
        return roomGuests?.reduce(
            (acc, cur) => acc + (cur.noOfChilds + cur.noOfAdults),
            0
        );
    };

    const breakfastOptions = [
        "Breakfast",
        "Full Breakfast",
        "Breakfast for 2",
        "Breakfast buffet",
        "Free breakfast",
        "Room with Breakfast",
        "BREAKFAST",
        "BBBreakfast",
        "BREAKFAST",
        "Breakfast included",
        "Bed and Breakfast",
        "BED AND BREAKFAST",
        "Bed and Breakfast: The price includes accommodation and breakfast",
        "Breakfast Tourism fee Service charge VAT Municipality fee is included in the rates",
    ];

    const breakfastDescriptions = [
        "Breakfast",
        "breakfast",
        "bed and breakfast",
        "Hot Buffet Breakfast",
        "BUFFET BREAKFAST",
        "Full Breakfast",
        "breakfast,complimentary wifi",
        "Bed & Breakfast",
        "BUFFET BREAKFAST",
        "BUFFET BREAKFAST",
        "Bed and Breakfast",
        "full breakfast,free self parking,free wifi",
        "Food/beverage credit, Breakfast buffet",
        "Bed and breakfast",
        "full breakfast",
        "Free Breakfast",
        "Free breakfast",
        "Breakfast buffet",
        "free breakfast,free valet",
        "BED AND BREAKFAST",
        "Hot Buffet Breakfast"
    ];



    const halfDescriptions = ['HalfBoard', 'Half Board', "HALF BOARD", "Half board", "half board", "Half-board", "Half Board (Dinner)"]
    const FullDescriptions = ['FullBoard', "Full Board", "Full board", "Full-board", "FULL BOARD", "full board",]
    const handleMealPlanSelection = (values) => {
        setSelectedOptions(values)
        setSelectedMealPlan(values);
    };

    // Helper: does any ratePlan in this room match the mealPlan keyword?
    const roomHasMeal = (room, keywords) =>
        room?.ratePlans?.some(rp =>
            keywords.some(kw => (rp.mealPlan || "").toLowerCase().includes(kw.toLowerCase()))
        );
    const roomIsRefundable = (room) =>
        room?.ratePlans?.some(rp => rp.refundable === true);

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

            const map = L.map('map').setView([center.lat, center.lng], zoom);


            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);


            const customIcon = L.icon({
                iconUrl: markerIcon,
                shadowUrl: markerShadow,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });

            L.marker([center.lat, center.lng], { icon: customIcon }).addTo(map)
                .bindPopup('Your Hotel')
                .openPopup();


            return () => {
                map.remove();
            };
        }, [center, zoom]);

        return <div id="map" style={{ height: '500px', width: '100%' }}></div>;
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
    const RoomsInclusion = (i, idx) => {
        return (
            <>

                <p style={{ margin: '0px 0px 0px' }}>
                    <span className="fa fa-check" style={{ color: 'green' }}></span> {i}
                </p>


            </>
        );
    };
    const StarRating = ({ rating }) => {
        const numStars = parseFloat(rating);
        const starsArray = Array.from({ length: numStars }, (_, index) => index);

        return (
            <div className="str-top-ht" style={{ fontSize: "16px", marginLeft: 5 }}>
                {starsArray?.map((_, index) => (
                    <span
                        key={index}
                        role="img"
                        aria-label="star"
                        style={{
                            textShadow: "3px 2px 6px grey",

                        }}
                    >
                        <StarTwoTone />

                    </span>
                ))}
            </div>
        );
    };
    const handleCancel = () => {
        setShowCancellationModal(false);
    };
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };
    const viewMap = () => {
        const { latitude, longitude } = hotelDetailsRespObj;
        // console.log(latitude,longitude,"maappfinder");
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(googleMapsUrl, "_blank");
    };
    // New response has no 'request' object - read dates/guests from URL params (set at search time)
    const hotelDetUrlParams = queryString.parse(window.location.search);
    const checkInVal = hotelDetUrlParams?.checkInDate || hotelDetUrlParams?.checkIn;
    const checkOutVal = hotelDetUrlParams?.checkOutDate || hotelDetUrlParams?.checkOut;
    const checkInDateFormatted = checkInVal
        ? moment(checkInVal).format("DD MMM, YYYY")
        : (hotelDetailsRespObj?.request?.checkInDate
            ? moment(hotelDetailsRespObj.request.checkInDate).format("DD MMM, YYYY")
            : "");
    const checkOutDateFormatted = checkOutVal
        ? moment(checkOutVal).format("DD MMM, YYYY")
        : (hotelDetailsRespObj?.request?.checkOutDate
            ? moment(hotelDetailsRespObj.request.checkOutDate).format("DD MMM, YYYY")
            : "");
    const RoomsFormatted = guestCount(hotelDetailsRespObj?.request?.roomGuests)
        ? guestCount(hotelDetailsRespObj?.request?.roomGuests)
        : (hotelDetUrlParams?.guests || "");
    const RoomsCount = hotelDetailsRespObj?.request?.roomGuests?.length
        ? hotelDetailsRespObj?.request?.roomGuests?.length
        : (hotelDetUrlParams?.rooms ? Number(hotelDetUrlParams.rooms) : 0);
    // First room first ratePlan for summary display
    const firstRoom = filteredRooms?.[0];
    const firstRatePlan = firstRoom?.ratePlans?.[0];
    const hotelNameDisplay = hotelDetailsRespObj?.hotelName || hotelDetailsRespObj?.HotelName || hotelDetUrlParams?.hotelName || "";
    const starRatingDisplay = hotelDetailsRespObj?.starRating || hotelDetailsRespObj?.StarRating || hotelDetailsRespObj?.rating || hotelDetUrlParams?.starRating || "";
    const addressDisplay = hotelDetailsRespObj?.addresses?.address || hotelDetailsRespObj?.address || hotelDetailsRespObj?.hotelAddress || hotelDetUrlParams?.address || "";

    return (
        <div style={{ background: "#f5f5f5" }}>

            <div className="hotel-det-new" style={{ paddingTop: "100px", margin: "0 2%" }}>
                <div className="hotel-detail-container">
                    {loading ? (
                        <div className="hotel-header">
                            <Skeleton active={true} paragraph={{ rows: 1 }} />
                            <Col md={6} xs={0} className="show-moreskeleton-btn">
                                <Skeleton.Button active={true} size={"large"} />
                            </Col>

                        </div>
                    ) : (
                        (Object.keys(hotelDetailsRespObj).length > 0 || hotelNameDisplay) && (
                            <div className="hotel-header">
                                <div>
                                    <h1 className="hotel-name">{hotelNameDisplay}
                                        {starRatingDisplay && (
                                            <span className="rating-share-save">
                                                <StarRating rating={starRatingDisplay} />
                                            </span>
                                        )}
                                    </h1>
                                    <p className="hotel-location">{addressDisplay}</p>

                                </div>
                                <div className="show-rooms-btn">
                                    <Button onClick={() => scrollToRef(myRef1)}>
                                        Show rooms
                                        <i
                                            className="fa fa-chevron-down"
                                            aria-hidden="true"
                                        ></i>
                                    </Button>
                                </div>
                            </div>
                        ))}
                </div>
                <div className="hotel-Det-v-top">

                    <div className="hotel-carousel1">
                        {hotelDetailsRespObj?.images?.length > 0 ?

                            <ImagesLightbox
                                hotelImages={hotelDetailsRespObj.images}
                            />
                            : loading ?

                                <Skeleton.Image
                                    active
                                    style={{
                                        width: '865px',
                                        height: '376px',
                                        borderRadius: '8px'
                                    }}
                                />
                                :
                                <ImagesLightbox
                                    hotelImages={[ImBUrl + "images/hotels/no_photo.png"]}
                                />
                        }
                    </div>

                    <div className="booking-section">

                        <div className="map" onClick={viewMap}>
                            <img src={ImBUrl + "images/map-image.svg"} alt="Map" />
                            <span className="view-map-Cli" style={{ cursor: "pointer", color: "#007bff" }}>
                                View On Map
                            </span>
                        </div>
                        <div className="rate-details">

                            <div className="room-rate-Det-box">
                                <h3>{firstRoom?.roomName || firstRoom?.roomDesc}
                                    <div>
                                        {firstRatePlan?.refundable
                                            ? <span style={{ color: "green", fontSize: "12px" }}>Refundable</span>
                                            : <span style={{ color: "red", fontSize: "12px" }}>Non-Refundable</span>}
                                    </div>
                                </h3>
                                <p className="show-pr">
                                    <strong>{""}{Number(firstRatePlan?.price?.total || firstRatePlan?.prefPrice?.total || 0).toFixed(0)}</strong>
                                </p>
                            </div>
                        </div>
                        <div className="booking-for">

                            <div className="form-gro">
                                <label>Check-In Date:</label>
                                <input
                                    type="text"
                                    value={checkInDateFormatted}
                                    readOnly
                                    style={{ cursor: "default", backgroundColor: "#1c3d70", color: "#fff", width: "125px", marginTop: "12px" }}
                                />
                            </div>

                            <div className="form-gro">
                                <label>Check-Out Date:</label>
                                <input
                                    type="text"
                                    value={checkOutDateFormatted}
                                    readOnly
                                    style={{ cursor: "default", backgroundColor: "#1c3d70", color: "#fff", width: "125px", marginTop: "12px" }}
                                />
                            </div>
                        </div>
                        <div className="booking-form">
                            <div className="form-gro">
                                <label>Room & guests</label>
                                <input
                                    type="text"
                                    value={RoomsCount + " Room , " + RoomsFormatted + " Guests "}
                                    readOnly
                                    style={{ cursor: "default", backgroundColor: "#075080", color: "#fff", width: "100%", marginTop: "18px" }}
                                />
                            </div>
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="Room filters"
                                value={selectedOptions}
                                onChange={handleMealPlanSelection}
                                size="large"

                            >
                                <Option value="Breakfast" style={{ fontSize: 15 }}>Breakfast</Option>
                                <Option value="Half Board" style={{ fontSize: 15 }}>Half Board</Option>
                                <Option value="Full Board" style={{ fontSize: 15 }}>Full Board</Option>
                                <Option value="Refundable" style={{ fontSize: 15 }}>Refundable</Option>
                            </Select>
                        </div>
                    </div>
                </div>
            </div >
            <section className="hotel-details-header-New">
                <div className="details-header-container">

                    <div className="Activ-btn-Det" style={{ marginTop: 10 }}>
                        <button onClick={() => handleTabClick('rooms')} className={activeTab === 'rooms' ? 'activeDet' : 'no-btn'}>ROOMS</button>
                        <button onClick={() => handleTabClick('about')} className={activeTab === 'about' ? 'activeDet' : 'no-btn'}>ABOUT</button>
                        <button onClick={() => handleTabClick('facility')} className={activeTab === 'facility' ? 'activeDet' : 'no-btn'}>FACILITY</button>
                        <button onClick={() => handleTabClick('location')} className={activeTab === 'location' ? 'activeDet' : 'no-btn'}>LOCATION</button>

                    </div>

                </div>

                <div className="hotel-Newdet-block">
                    {loading ? (
                        <Skeleton active />
                    ) : (
                        <div className="hotel-rooms-listN">
                            {activeTab === 'about' && (
                                <div ref={myRef2}>
                                    <h3>About Hotel</h3>
                                    {hotelDetailsRespObj?.description
                                        ? parse(hotelDetailsRespObj.description)
                                        : (hotelDetailsRespObj?.reservationPolicy
                                            ? <p>{hotelDetailsRespObj.reservationPolicy}</p>
                                            : <p style={{ color: "#888" }}>No description available.</p>)
                                    }
                                </div>
                            )}
                            {activeTab === 'rooms' && (
                                <section className="hotel-rooms-list" ref={myRef1}>
                                    <div className="rooms-wrapper">

                                        <div>
                                            <h5 className="rooms-available-sta">Available Rooms</h5>
                                        </div>

                                        <div className="rooms-list">
                                            {loading ? (
                                                <div className="hotel-details-block">
                                                    <div className="hotel-details-room-card-container">
                                                        {/* ----Room Skeleton Card---- */}
                                                        {[...Array(2)].map((_, i) => (
                                                            <div key={"skeleton" + i} className="room-card">
                                                                <Row gutter={16}>
                                                                    <Col md={4}>
                                                                        <div className="room-image-skel">
                                                                            <Skeleton.Image />
                                                                        </div>
                                                                    </Col>
                                                                    <Col md={16}>
                                                                        <Skeleton active />
                                                                    </Col>
                                                                    <Col md={4}>
                                                                        <div className="choose-btn-s">
                                                                            <Skeleton paragraph={{ rows: 0 }} />
                                                                            <Skeleton.Button active={true} size={"large"} />
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        ))}

                                                        {/* ----End Of Room Skeleton Card---- */}
                                                    </div>
                                                </div>
                                            ) :


                                                filteredRooms?.length > 0 ? (
                                                    filteredRooms?.map((hotelRoom, index) => (
                                                        <Card style={{ padding: "6px 16px" }} className="room-card-wrapper mb-2" key={hotelRoom?.roomId || index}>
                                                            {/* <ScrollToTopButton /> */}
                                                            <h5 className="rm-nam-tp" style={{ margin: "0 0 8px 0" }}>
                                                                {hotelRoom?.roomName || hotelRoom?.roomDesc}
                                                            </h5>
                                                            {hotelRoom?.roomDesc && hotelRoom.roomDesc !== hotelRoom.roomName && (
                                                                <p style={{ fontSize: 13, color: "#666", margin: "0 0 8px 0" }}>{hotelRoom.roomDesc}</p>
                                                            )}
                                                            <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px 0" }}>
                                                                Max Adults: {hotelRoom?.maxAdult || hotelRoom?.adultCount} &nbsp;|&nbsp; Children: {hotelRoom?.minChildren || hotelRoom?.childCount}
                                                            </p>
                                                            {hotelRoom?.roomImageList?.length > 0 && (
                                                                <div style={{ marginBottom: 12 }}>
                                                                    <Slider {...settings}>
                                                                        {hotelRoom.roomImageList.map((img, imgIdx) => (
                                                                            <div key={imgIdx}>
                                                                                <img src={img} alt={hotelRoom.roomName}
                                                                                    style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }}
                                                                                    onError={(e) => { e.target.src = ImBUrl + "images/htImgs/no-htl.jpg"; }} />
                                                                            </div>
                                                                        ))}
                                                                    </Slider>
                                                                </div>
                                                            )}
                                                            {hotelRoom?.ratePlans?.map((ratePlan, rpIdx) => (
                                                                <div key={rpIdx} className="hotel-room-details-main-card"
                                                                    style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8, marginTop: 8 }}>
                                                                    <div className="hotel-room-details-main-content-card">
                                                                        <div className="hotel-room-details-main-inclusions-card">
                                                                            <div className="hotel-room-details-main-inclusions-card1">
                                                                                <div className="hotel-room-details-main-inclusions-card2">
                                                                                    {ratePlan?.ratePlanName && (
                                                                                        <p style={{ fontWeight: 600, margin: "0 0 4px 0" }}>{ratePlan.ratePlanName}</p>
                                                                                    )}
                                                                                    {ratePlan?.mealPlan && (
                                                                                        <p className="board-b">Meal Plan: {ratePlan.mealPlan}</p>
                                                                                    )}
                                                                                    {ratePlan?.inclusions?.length > 0 && (
                                                                                        <div className="inc-r">
                                                                                            {ratePlan.inclusions.slice(0, 3).map((i, idx) => RoomsInclusion(i, idx))}
                                                                                            {ratePlan.inclusions.length > 3 && (
                                                                                                <button style={{ color: "blue", border: "1px solid white", backgroundColor: "white" }}
                                                                                                    onClick={() => handleinclusiondata(ratePlan.inclusions)}>More</button>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                    {ratePlan?.amenities?.length > 0 && (
                                                                                        <div className="inc-r">
                                                                                            {ratePlan.amenities.slice(0, 2).map((a, idx) => RoomsInclusion(a, idx))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="hotel-room-details-main-inclusions-card-2">
                                                                                    {ratePlan?.refundable ? (
                                                                                        <>
                                                                                            {ratePlan?.lastCancellationDate && (
                                                                                                <h1 style={{ fontSize: "small" }}>
                                                                                                    Free Cancellation Till {moment(ratePlan.lastCancellationDate).format("DD MMM YYYY")}
                                                                                                </h1>
                                                                                            )}
                                                                                            <span style={{ color: "green", fontSize: "12px", padding: "4px 8px", borderRadius: "7px" }}>Refundable</span>
                                                                                            <div className="cncl-chrgs-ht" style={{ color: "red", cursor: "pointer" }}
                                                                                                onClick={() => handelCancellationPolicy({ ...ratePlan, roomName: hotelRoom.roomName })}>
                                                                                                Cancellation Policy
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <span style={{ color: "#bd0c21", fontSize: "12px" }}>Non-Refundable</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="hotel-room-details-main-price-card-1">
                                                                                <span className="span-currency">
                                                                                    <span style={{ fontSize: "18px", color: "green" }}>
                                                                                        {"₹"}
                                                                                    </span>
                                                                                    <span style={{ fontSize: "22px" }}>
                                                                                        {Number(ratePlan?.price?.total || ratePlan?.prefPrice?.total || 0).toFixed(2)}
                                                                                    </span>
                                                                                    <span style={{ fontSize: "12px", color: "grey" }}> / night</span>
                                                                                </span>
                                                                                <div style={{ minWidth: "126px" }}>
                                                                                    <Button
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
                                                                                        className="btn-choose-room-hotel-det chooseroom-details-hotel"
                                                                                    >
                                                                                        Choose Room
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </Card>
                                                    ))
                                                ) :
                                                    <Card className="no-rroms-cr" style={{ background: "#eaebee" }}>
                                                        <div className="rm-norooms">

                                                            <img className="no-rm-im" src={ImBUrl + "images/filterno.jpg"} alt="No Filter" />

                                                            <div style={{ textAlign: "center", paddingTop: "4%" }}>
                                                                <h4 style={{ color: "#bd0c21" }}>SORRY..!!</h4>
                                                                <p>We couldn't find any properties matching the criteria for hotel Rooms.</p>
                                                                <p>Please remove the filters applied and try again.</p>
                                                            </div>
                                                            <img className="no-rm" src={ImBUrl + "images/skyline.png"} alt="No Filter" />
                                                        </div>
                                                    </Card>

                                            }
                                        </div>
                                    </div >
                                </section >
                            )}
                            {activeTab === 'facility' && (
                                <div className="description-block facilities-list">

                                    <div className="description-content miscell-data">

                                        <div className="facilities-block">
                                            <p className="rooms-available-sta">Miscellaneous</p>
                                            {loading ? (
                                                <Skeleton active />
                                            ) : (
                                                <ul>
                                                    <Row>
                                                        {hotelDetailsRespObj?.hotelFacility?.length > 0 ? (
                                                            hotelDetailsRespObj.hotelFacility.map(
                                                                (facility, index) => (
                                                                    <Col key={"facili" + index} md={8} sm={8} xs={12}>
                                                                        <li>
                                                                            <i
                                                                                className="fa fa-check "
                                                                                style={{ color: "#008cff" }}
                                                                            ></i>{" "}
                                                                            {facility}
                                                                        </li>{" "}
                                                                    </Col>
                                                                )
                                                            )
                                                        ) : (
                                                            <p>No data available</p>
                                                        )}
                                                    </Row>
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'location' && (
                                <>
                                    {defaultProps.mapVisible ? (
                                        <section className="locationWrapper">

                                            <h3 className="rooms-available-sta">Location</h3>
                                            {loading ? (
                                                <Skeleton active paragraph={{ rows: 0 }} />
                                            ) : (
                                                <p className="loc">
                                                    <EnvironmentOutlined /> {defaultProps?.center?.address}
                                                </p>
                                            )}

                                            <div className="mapWrapper">
                                                <MapComponent
                                                    center={{ lat: defaultProps.center.lat, lng: defaultProps.center.lng }}
                                                    zoom={defaultProps.zoom}
                                                />

                                            </div>
                                        </section>
                                    ) : null
                                    }
                                </>
                            )}

                        </div>
                    )}

                </div>

            </section>
            <section className="hotel-Det-v-bottom">
                <div className="description-block facilities-list" ref={myRef4}>

                    <div className="description-content miscell-data">
                        <h3>Check-In Instructions</h3>
                        <div className="facilities-block">
                            <Row>
                                <Col md={24} sm={24} xs={24}>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        Extra-person charges may apply and vary depending on
                                        property policy.
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        Government-issued photo identification and a credit card,
                                        debit card, or cash deposit may be required at check-in
                                        for incidental charges.
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        Special requests are subject to availability upon check-in
                                        and may incur additional charges; special requests cannot
                                        be guaranteed .
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        The primary guest must be at least 18 years of age to
                                        check into this hotel(s) .
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        In some countries including India, as per Government
                                        regulations, it is mandatory for all guests above 18 years
                                        of age to carry a valid photo identity card & address
                                        proof at the time of check-in. In case, check-in is denied
                                        by the hotel due to lack of required documents, you cannot
                                        claim for the refund & the booking will be considered as
                                        NO SHOW. Please check with the hotel(s) directly .
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        Unless mentioned, the tariff does not include charges for
                                        optional room services (such as telephone calls, room
                                        service, mini bar, snacks, laundry extra bed etc.). In
                                        case, such additional charges are levied by the hotel(s),
                                        we shall not be held responsible for it .
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        Extra bed can be accommodated with a folding cot or a
                                        mattress, subject to room size & availability .
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        The hotel(s) reserves the right to decline accommodation
                                        to localities/same city residents.eTravos.com will not be
                                        responsible for any check-in declined by the hotel(s) or
                                        any refunds due to the above-mentioned reason .
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        eTravos.com will not be responsible for any service issues
                                        at the hotel(s) .
                                    </p>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
                <div className="description-block facilities-list" ref={myRef5}>

                    <div className="description-content miscell-data">
                        <h3>Special Instructions</h3>
                        <div className="facilities-block">
                            <Row>
                                <Col md={24} sm={24} xs={24}>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        Early check -in/ Late checkout (Subject to availability,
                                        Amount varies) to be Charges by the Property at time of
                                        Service. .
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        To make arrangements for check-in please contact the
                                        property at least 24 hours before arrival using the
                                        information on the booking confirmation.
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        Guests must contact the property in advance for check-in
                                        instructions. Front desk staff will greet guests on
                                        arrival.
                                    </p>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
                <div className="description-block facilities-list" style={{ marginBottom: "15px" }}>

                    <div className="description-content miscell-data">
                        <h3>Disclaimer Notification</h3>
                        <div className="facilities-block">
                            <Row>
                                <Col md={24} sm={24} xs={24}>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        Amenities are subject to availability and may be
                                        chargeable as per the hotel policy.
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        We attempts to ensure that the information on this page is
                                        complete and accurate; however this information along with
                                        its links may contain typographical errors, and other
                                        errors or inaccuracies. We assume no responsibility for
                                        such errors or omissions, and reserve the right to correct
                                        any errors, inaccuracies or omissions.
                                    </p>
                                    <p className="font-wht-nrml">
                                        <i
                                            className="fa fa-check"
                                            style={{ color: "#008cff" }}
                                        ></i>{" "}
                                        All information provided on this page is meant to serve as
                                        a general information source only and does not constitute
                                        professional advice. This page may not cover all
                                        information available on a particular issue. Before
                                        relying on this page, we urge you to independently
                                        validate or obtain professional advice relevant to your
                                        particular circumstances .
                                    </p>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </section>
            <Modal
                title="Cancellation Policy"
                open={showcancellationModal}
                onCancel={handleCancel}
                footer={null}
                width={500}
            >
                <div className="modal-body">
                    {roomsData != null && (
                        <>
                            <p className="heading-part-modal-cancellation">
                                {roomsData.roomName?.split(",")[0]}
                            </p>
                            {cancellationInfo.length > 0
                                ? cancellationInfo?.map((can, i) => {

                                    return (

                                        <div className={can?.penaltyAmount > 0 ? "modal-popup-cancellation" : "modal-popup-cancellation-1"}>
                                            <div className="modal-popup-cancellation2">
                                                {can?.penaltyAmount > 0 ?
                                                    <i
                                                        class="fa fa-calendar"
                                                        style={{ color: "red", fontSize: "20px" }}
                                                    ></i> : <i
                                                        class="fa fa-calendar"
                                                        style={{ color: "rgb(0, 191, 0)", fontSize: "20px" }}
                                                    ></i>}
                                            </div>
                                            <div className="modal-popup-cancellation1">
                                                <p style={{ margin: "0px 0px 0px" }}>
                                                    <strong>From-</strong>{" "}
                                                    {can?.fromDate?.split(" ")[0]}
                                                </p>
                                                <p style={{ margin: "0px 0px 0px" }}>
                                                    <strong>To-</strong>{" "}
                                                    {can?.toDate?.split(" ")[0]}
                                                </p>


                                            </div>
                                            <div className="modal-popup-cancellation1">
                                                <p style={{ margin: "0px 0px 0px" }}><strong>Cancellation Charges</strong></p>
                                                {can.chargeType === "Amount" ?
                                                    <p style={{ margin: "0px 0px 0px" }}><strong> {"â‚¹"}  {can?.penaltyAmount} </strong></p> : null}
                                                {can.chargeType === "Fixed" ?
                                                    <p style={{ margin: "0px 0px 0px" }}><strong> {"â‚¹"}  {can?.penaltyAmount} </strong></p> : null}
                                                {can?.chargeType === "Nights" ?
                                                    <p style={{ margin: "0px 0px 0px" }}><strong>{can?.penaltyAmount} {" Nights"}</strong></p> : null}
                                                {can?.chargeType == "Percentage" ?
                                                    <p style={{ margin: "0px 0px 0px" }}><strong>  {can.penaltyAmount} {can.chargeType == "Percentage" ? "%" : ""}</strong></p> : null}




                                            </div>
                                        </div>
                                    );
                                })
                                : (
                                    <p>No cancellation information available at the moment. </p>
                                )}
                        </>
                    )}
                </div>
            </Modal>
            <Modal
                className="modal-css-direction-popup"
                open={isinclusionvisible}
                onCancel={() => setisinclusionvisible(false)}
                onOk={() => setisinclusionvisible(false)}
            >
                {" "}
                {inclusiondata?.length
                    ? inclusiondata?.map((i, idx) =>
                        idx > 0 ? (
                            <>
                                {idx === 1 ? (
                                    <p className="mb-0 mr-1">
                                        <strong>Inclusions :</strong>
                                    </p>
                                ) : null}

                                <p className="mb-0 mr-1">
                                    <i
                                        className="fa fa-check color-blue"
                                        aria-hidden="true"
                                    ></i>{" "}
                                    {i}
                                </p>
                            </>
                        ) : (
                            ""
                        )
                    )
                    : ""}
            </Modal>
        </div>
    );
};

export default HotelDet;
