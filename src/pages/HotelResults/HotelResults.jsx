
import React, { useState, useEffect, Suspense, useContext } from "react";
import {
  Card,
  Col,
  Row,
  Grid,
  Skeleton,
  Collapse,
  Button,
  Modal,
  Form,
} from "antd";
import Hotels from "../Hotels/Hotels"

import CustomProgressBar from "../../common/CustumProgressBar/CustumProgressBar";
import ScrollToTopButton from "../../common/ScrollToTop";
import Apiclient1 from "../../Helpers/Apiclient1";

import SkeletonLayout from "../../components/Skeleton/Skeleton";
import FilterSkeletonLayout from "../../components/FilterSkeleton/FilterSkeleton";
import queryString from "query-string";

import moment from "moment";
import "../HotelResults/HotelResults.scss";


import { useSelector, useDispatch } from "react-redux";
import {
  setShortedHotelModalVisible as setShortedHotelModalVisibleAction,
  setShortedHotelListCount as setShortedHotelListCountAction
} from "../../store/slices/hotelSlice";
import PageLoader from "../../common/PageLoader";
const Filter = React.lazy(() => import('../Filters/Filter'))
const HotelContainer = React.lazy(() => import('./HotelContainer'))
const HotelSort = React.lazy(() => import('../HotelSort/HotelSort'))
const ImBaseUrl = import.meta.env.VITE_Image_URL;
const CustomNoResultFound = React.lazy(() => import('../../common/ErrorPages/CustomNoResultFound'))
const NoResultFound = React.lazy(() => import('../../common/ErrorPages/NoResultFound'));
const Hotel404 = React.lazy(() => import('../../common/ErrorPages/Hotel404'));

const { useBreakpoint } = Grid;
const { Panel } = Collapse;

const dateFormat = "DD-MM-YYYY";
const oriDateFormat = "YYYY-MM-DD";

const HotelResults = ({ hotelParam = false, isFromPackage = false }) => {
  const { md } = useBreakpoint();
  const user = useSelector((state) => state.auth.user);
  const [mainHotelsListResp, setMainHotelsListResp] = useState([]);
  const [listOfHotels, setListOfHotels] = useState([]);
  const [key, setKey] = useState([]);
  const [traceId, setTraceId] = useState(null);
  const [isHotelSearchLoad, setIsHotelSearchLoad] = useState(false);
  const [showNetFare, setShowNetFare] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultLoading, setResultLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisiblenew, setModalVisiblenew] = useState(false);
  const [popUpVisibility, setPopUpVisibility] = useState(false);
  const [searchHotelReq, setSearchHotelReq] = useState(null);
  const [hotelalldata, sethotelalldata] = useState({});
  const [HotelSearchobj, setHotelSearchobj] = useState([]);

  useEffect(() => {
    const hotelSearchParams = queryString.parse(window.location.search);
    if (hotelSearchParams) {
      let hotelCityCode = queryString.parse(hotelSearchParams.hotelCityCode);
      const roomGuests = JSON.parse(hotelSearchParams.roomGuests || "[]");
      let staticObj = {
        traceId: "string",
        cityId: hotelCityCode.cityId,
        hotelCityCode: hotelCityCode.cityId,
        checkInDate: hotelSearchParams.checkInDate || hotelSearchParams.checkIn || "",
        checkOutDate: hotelSearchParams.checkOutDate || hotelSearchParams.checkOut || "",
        roomGuests: roomGuests,
        nationality: hotelSearchParams?.nationality || "IN",
        userId: user?.UserID ?? 1,
        roleType: user?.Role?.Role ?? 3,
        membership: user?.Membership ?? 1,
      };
      setSearchHotelReq(staticObj);
      shortedHotelFromLocalStorage(staticObj.cityId);
    }
  }, []);
  useEffect(() => {
    fetchStaticData();
  }, [window.location.search]);
  const dispatch = useDispatch();
  const searchhotelobj = useSelector(state => state.hotel.searchhotelobj);
  const shortedHotelModalVisible = useSelector(state => state.hotel.shortedHotelModalVisible);
  const shortedHotelCount = useSelector(state => state.hotel.shortedHotelCount);
  const setShortedHotelModalVisible = (visible) => dispatch(setShortedHotelModalVisibleAction(visible));
  const setShortedHotelListCount = (count) => dispatch(setShortedHotelListCountAction(count));
  function onInactive(ms, cb) {
    var wait = setTimeout(cb, ms);

    document.onmousemove =
      document.mousedown =
      document.mouseup =
      document.onkeydown =
      document.onkeyup =
      document.focus =
      document.scroll =
      function () {
        clearTimeout(wait);

        if (
          !localStorage.getItem("popupShown") &&
          JSON.parse(localStorage.getItem("popupShown")) !== true
        ) {
          wait = setTimeout(cb, ms);
        }
      };
  }



  const showModalflight = () => {
    setModalVisible({
      visible: true,
    });
  };
  const showModalsort = () => {
    setModalVisiblenew({
      visible: true,
    });
  };

  const fetchStaticData = () => {
    setMainHotelsListResp([]);
    setListOfHotels([]);
    setIsLoading(true);
    setIsHotelSearchLoad(true);
    setResultLoading(true);

    if (!hotelParam) {
      const hotelSearchParams = queryString.parse(window.location.search);
      if (hotelSearchParams) {
        let hotelCityCode = queryString.parse(hotelSearchParams.hotelCityCode);
        const roomGuests = JSON.parse(hotelSearchParams.roomGuests || "[]");

        let searchReqObj = {
          traceId: "string",
          checkInDate: hotelSearchParams.checkInDate,
          checkOutDate: hotelSearchParams.checkOutDate,
          currency: hotelSearchParams.currency || "INR",
          chainCode: "",
          hotelCityCode: hotelCityCode.cityId,
          hotelCode: "",
          geoLocation: { latitude: "", longitude: "" },
          roomGuests: roomGuests.map((r) => ({
            noOfAdults: r.noOfAdults,
            noOfChilds: r.noOfChilds,
            ChildAge: r.childAge || [],
          })),
          nationality: hotelSearchParams?.nationality ?? "IN",
          countryCode: "IN",
          isHotelDescriptionRequried: false,
          consolidationWaitTime: 0,
        };
        setHotelSearchobj(searchReqObj);
        setSearchHotelReq((prev) => ({ ...prev, ...searchReqObj }));
        getHotelDetails(searchReqObj);
      }
    } else if (Object.keys(hotelParam).length > 0) {
      getHotelDetails({ ...hotelParam });
    }
  };

  const getHotelDetails = (searchReqObj) => {
    // Step 1: Get search results first
    Apiclient1.post("Hotel/HotelSearch", searchReqObj)
      .then((res) => {
        let hotels = res?.hotels || res?.data?.hotels || [];
        console.log("Search response:", res);
        console.log("Search hotels:", hotels.length, "| Sample keys:", Object.keys(hotels[0] || {}));

        if (hotels.length === 0) {
          console.log("No hotels from search.");
          setResultLoading(false);
          setIsHotelSearchLoad(false);
          setIsLoading(false);
          return;
        }

        setTraceId(res.traceId);

        // Step 2: Extract hotel codes from search results to query static API
        const hotelCodesFromSearch = hotels.map(h =>
          String(h.hotelCode || h.HotelCode || h.hotelId || h.HotelId || "")
        ).filter(Boolean);

        const staticReqObj = {
          traceId: "string",
          cityId: searchReqObj.hotelCityCode,
          countryCode: searchReqObj.countryCode || "IN",
          hotelId: "",
          detailLevel: "high"
        };

        // Step 3: Get static data
        return Apiclient1.post("StaticData/GetHotelDetails", staticReqObj)
          .then((staticRes) => {
            console.log("Static response:", staticRes);

            // Extract static hotels — check all possible keys
            const rawStaticHotels =
              staticRes?.hotelDetails ||
              staticRes?.hotels ||
              staticRes?.data?.hotelDetails ||
              staticRes?.data?.hotels ||
              staticRes?.data ||
              (Array.isArray(staticRes) ? staticRes : []);

            console.log("Static hotels count:", rawStaticHotels.length, "| Sample keys:", Object.keys(rawStaticHotels[0] || {}));

            // Build a lookup map from static data for O(1) matching
            const staticMap = {};
            rawStaticHotels.forEach(sh => {
              const id1 = String(sh.hotelId || sh.HotelId || "");
              const id2 = String(sh.hotelCode || sh.HotelCode || "");
              if (id1) staticMap[id1] = sh;
              if (id2 && id2 !== id1) staticMap[id2] = sh;
            });

            console.log("Static map keys sample:", Object.keys(staticMap).slice(0, 5));
            console.log("Search hotelCode sample:", hotelCodesFromSearch.slice(0, 5));

            // Step 4: Merge search + static data
            const combinedHotelDetails = hotels.map((hotel) => {
              const searchId = String(hotel.hotelCode || hotel.HotelCode || hotel.hotelId || hotel.HotelId || "");
              const matchedStatic = staticMap[searchId];

              if (!matchedStatic) {
                console.warn("Unmatched hotel searchId:", searchId);
              }

              return {
                ...hotel,
                ...(matchedStatic || {}),
                // Always preserve search API pricing (don't let static overwrite it)
                hotelCode: hotel.hotelCode || hotel.HotelCode,
                hotelMinPrice: hotel.hotelMinPrice || hotel.HotelMinPrice || hotel.minPrice || 0,
                hotelPublishPrice: hotel.hotelPublishPrice || hotel.HotelPublishPrice || hotel.hotelMinPrice || hotel.minPrice || 0,
                traceId: res.traceId,
                supplier: hotel.supplier,
                // Normalized fields with all fallbacks
                hotelName: (matchedStatic?.hotelName || matchedStatic?.HotelName || hotel.hotelName || hotel.HotelName || hotel.propertyName || hotel.name || ""),
                description: matchedStatic?.description || hotel.description || hotel.Description || "",
                starRating: Number(matchedStatic?.starRating ?? matchedStatic?.StarRating ?? hotel.starRating ?? hotel.StarRating ?? hotel.starRatings ?? hotel.stars ?? 0),
                images: (matchedStatic?.images?.length > 0) ? matchedStatic.images : (hotel.images || hotel.Images || []),
                hotelFacility: (matchedStatic?.facilities?.length > 0) ? matchedStatic.facilities : (matchedStatic?.hotelFacility || hotel.hotelFacility || hotel.facilities || []),
                addresses: (matchedStatic?.addresses?.length > 0)
                  ? matchedStatic.addresses
                  : (hotel.addresses?.length > 0
                    ? hotel.addresses
                    : [{ address: hotel.address || hotel.Address || "", cityName: hotel.city || hotel.cityName || "" }]),
                city: matchedStatic?.city || hotel.city || hotel.City || hotel.cityName || "",
                isPriceAvailable: true,
                isVisible: true,
              };
            });

            console.log("Combined hotels:", combinedHotelDetails.length);
            sethotelalldata(res.filters || {});
            setMainHotelsListResp(combinedHotelDetails);
            setListOfHotels(combinedHotelDetails);
            setResultLoading(false);
            setIsHotelSearchLoad(false);
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.error(err);
        setIsHotelSearchLoad(false);
        setIsLoading(false);
        setResultLoading(false);
      });
  };




  const shortedHotelFromLocalStorage = (cityId) => {
    let getShortedHotelList = localStorage.getItem('SHORTEDHOTELLIST');
    getShortedHotelList = getShortedHotelList ? JSON.parse(getShortedHotelList) : []
    const checkIsHotelCity = getShortedHotelList.find(h => h.hotelCityCode == cityId)

    if (checkIsHotelCity) {
      setShortedHotelListCount(checkIsHotelCity.hotelCode.length)
    }

  }
  const [primaryScale, setPrimaryScale] = useState(0);
  const [secondaryScale, setSecondaryScale] = useState(1);


  const [leftPosition, setLeftPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoading && leftPosition < 49) {
        setLeftPosition(prevPosition => prevPosition + 1);
      } else {
        clearInterval(interval);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [isLoading, leftPosition]);


  return (
    <>

      <div className="hotels_results_page">
        <div className="hotels-page-wrapper">
          {isFromPackage ? null : (
            <section className="hotels_modify">
              <div className="hotel-modify-container">
                <Collapse
                  accordion
                  activeKey={key}
                  onChange={(val) => setKey(val ? [val] : [])}
                  expandIconPosition="end"
                >
                  <Panel
                    header={
                      <span className="hotels-hide-search">
                        🔍 Modify Search
                      </span>
                    }
                    key="1"
                  >
                    <Hotels
                      hotelSearchAPI={fetchStaticData}
                      modifySearch={true}
                      Loading={resultLoading}
                    />
                  </Panel>
                </Collapse>
              </div>
            </section>
          )}

          {isLoading ? (
            <section>
              <div className="hotel-skeleton-layout">



                <div className="hotel-skeleton-layout-container">
                  <Row gutter={16}>
                    <Col md={6} xs={0} className="filter-skeleton">
                      <FilterSkeletonLayout />
                    </Col>
                    <Col md={18} xs={24} className="result-body-skeleton">
                      <Card className="card-skeleton">
                        <Skeleton active={true} paragraph={{ rows: 0 }} />
                      </Card>
                      <PageLoader />
                      {[...Array(6)].map((i) => (
                        <SkeletonLayout key={i} />
                      ))}
                    </Col>
                  </Row>
                </div>
              </div>
            </section>
          ) : mainHotelsListResp.length > 0 ? (
            <section className="hotels_list">
              <div className="hotels-list-wrapper">
                <div className="list-container">
                  <div className="filters-box">
                    <Suspense fallback={

                      <FilterSkeletonLayout />
                    }>
                      <Filter
                        count={mainHotelsListResp.length}
                        data={mainHotelsListResp}
                        setListOfHotels={setListOfHotels}
                        isHotelSearchLoad={isHotelSearchLoad}
                        filtersObj={hotelalldata}
                        Loading={resultLoading}
                      />
                    </Suspense>
                  </div>
                  <div className="hotels-box">
                    <div  >
                      {isHotelSearchLoad ? (
                        <Card className="card-skeleton">
                          <Skeleton active={true} paragraph={{ rows: 0 }} />
                        </Card>
                      ) : (
                        <><Suspense fallback={
                          <Card className="card-skeleton">
                            <Skeleton active={true} paragraph={{ rows: 0 }} />

                          </Card>
                        }>


                          {resultLoading ? <><Card className="card-skeleton">
                            <Skeleton active={true} paragraph={{ rows: 0 }} />

                          </Card>
                            <CustomProgressBar
                              showInfo={false}
                              status="active"
                              strokeColor="#da251c"
                            />
                          </> : <HotelSort
                            listOfHotels={listOfHotels}
                            setListOfHotels={setListOfHotels}
                            showNetFare={showNetFare}
                            setShowNetFare={setShowNetFare}
                            setShortedHotelModalVisible={setShortedHotelModalVisible}
                            shortedHotelCount={shortedHotelCount}
                          />
                          }
                        </Suspense>
                        </>
                      )}
                    </div>
                    <div>
                      {listOfHotels.length > 0 ? (
                        <Suspense fallback={<div>Loading...</div>}>
                          <HotelContainer
                            isFromPackage={isFromPackage}
                            listOfHotels={listOfHotels}
                            traceId={traceId}
                            isHotelSearchLoad={isHotelSearchLoad}
                            showNetFare={showNetFare}
                            searchObj={HotelSearchobj}
                            searchHotelReq={searchHotelReq}
                            shortedHotelModalVisible={shortedHotelModalVisible}
                            setShortedHotelModalVisible={setShortedHotelModalVisible}
                            setShortedHotelListCount={setShortedHotelListCount}
                            setListOfHotels={setListOfHotels}
                            mainHotelsListResp={mainHotelsListResp}
                            Loading={resultLoading}
                          /></Suspense>
                      ) : (
                        <Suspense fallback={<div>Loading...</div>}>
                          <CustomNoResultFound title={"No Hotels Available"} />
                        </Suspense>
                      )}
                    </div>

                  </div>
                </div>
                <ScrollToTopButton />
              </div>
            </section>
          ) : (

            <Suspense fallback={<div>Loading...</div>}>

              {/* <NoResultFound /> */}
              <Hotel404 />
            </Suspense>
          )}
        </div>

        <Row className="fiters-value-hotel">
          <Col md={12} xs={12} className="hotel-center-cls">
            <h5 className="hotel-sort-by-1" onClick={showModalflight}>
              {" "}
              <i className="fa fa-filter" aria-hidden="true"></i>&nbsp;Filters
            </h5>
          </Col>
          <Col md={12} xs={12} className="hotel-center-cls">
            <h5 className="hotel-sort-by-1" onClick={showModalsort}>
              <i className="fa fa-sort-amount-asc" aria-hidden="true"></i>
              &nbsp;Sort by
            </h5>
          </Col>
        </Row>

        <Modal
          title={[
            <div>
              <h6 style={{ marginBottom: "0px" }}>
                <strong>Filters</strong>
              </h6>
            </div>,
          ]}
          className="promo-modal-header"
          open={modalVisible}
          onOk={(e) => setModalVisible(false)}
          onCancel={(e) => setModalVisible(false)}
          footer={[
            <div>
              <Button type="primary" onClick={() => setModalVisible(false)}>
                Close
              </Button>

            </div>,
          ]}
        >
          <Row>
            <Col md={24} xs={24}>
              <Filter
                count={mainHotelsListResp.length}
                data={mainHotelsListResp}
                setListOfHotels={setListOfHotels}
                isHotelSearchLoad={isHotelSearchLoad}
                filtersObj={hotelalldata}
              />
            </Col>
          </Row>
        </Modal>

        <Modal
          title={[
            <div>
              <h6 style={{ marginBottom: "0px" }}>
                <strong>Sort by</strong>
              </h6>
            </div>,
          ]}
          className="promo-modal-header modal-hotel-show12"
          open={modalVisiblenew}
          onOk={(e) => setModalVisiblenew(false)}
          onCancel={(e) => setModalVisiblenew(false)}
          footer={[
            <div>
              <Button type="primary" onClick={() => setModalVisiblenew(false)}>
                Close
              </Button>
            </div>,
          ]}
        >
          <Form>
            <Row>
              <Col md={24} xs={24}>
                <HotelSort
                  listOfHotels={mainHotelsListResp}
                  setListOfHotels={setListOfHotels}
                  showNetFare={showNetFare}
                  setShowNetFare={setShowNetFare}
                />
              </Col>
            </Row>
          </Form>
        </Modal>


      </div>
    </>
  );
};

export default HotelResults;
