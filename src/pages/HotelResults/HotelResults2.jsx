
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
import Hotels from "../Hotels/Hotels";
import ScrollToTopButton from "../../common/ScrollToTop";
import CustomProgressBar from "../../common/CustumProgressBar/CustumProgressBar";


import SkeletonLayout from "../../components/Skeleton/Skeleton";
import FilterSkeletonLayout from "../../components/FilterSkeleton/FilterSkeleton";
import queryString from "query-string";
import PageLoader from "../../common/PageLoader";

import "../HotelResults/HotelResults.scss";


import { useSelector, useDispatch } from "react-redux";
import {
  setShortedHotelModalVisible as setShortedHotelModalVisibleAction,
  setShortedHotelListCount as setShortedHotelListCountAction
} from "../../store/slices/hotelSlice";

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
      let staticObj = {
        traceId: "string",
        cityId: hotelCityCode.cityId,
        userId: user?.UserID ?? 1,
        roleType: user?.Role?.Role ?? 3,
        membership: user?.Membership ?? 1,
      };
      setSearchHotelReq(staticObj)
      shortedHotelFromLocalStorage(staticObj.cityId)
    }
  }, [])
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

    setIsLoading(true);

    setIsHotelSearchLoad(true);


    if (!hotelParam) {

      const hotelSearchParams = queryString.parse(window.location.search);

      if (hotelSearchParams) {
        let hotelCityCode = queryString.parse(hotelSearchParams.hotelCityCode);
        let staticObj = {
          traceId: "string",
          cityId: hotelCityCode.cityId,
          userId: user?.UserID ?? 1,
          roleType: user?.Role?.RoleId ?? 4,
          membership: user?.Membership ?? 1,
        };
        getStaticData(staticObj);
      }
    } else if (Object.keys(hotelParam).length > 0) {
      let staticObj = {
        traceId: "string",
        cityId: hotelParam.hotelCityCode,
      };
      getStaticData(staticObj);
    }
  };

  const getStaticData = (staticObj) => {

    ApiClient.post("hotels-v2/hotelstaticdetails", staticObj)
      .then((result) => {
        return result;
      })
      .then((res) => {
        if (res?.status === 200) {
          if (!res.data.errors) {
            setResultLoading(true)
            const hotelDetails = res?.data.hotelDetails.map((hotel) => {
              return {
                ...hotel,
                hotelCode: hotel.mappingHotelDetails[0].hotelId,
                images: hotel.mappingHotelDetails[0].images,
                starRating: hotel.mappingHotelDetails[0].starRating,
                hotelContent: hotel.mappingHotelDetails[0].hotelContent,
                addresses: hotel.mappingHotelDetails[0].addresses,
                hotelFacility: hotel.mappingHotelDetails[0].hotelFacility,
                attractions: hotel.mappingHotelDetails[0].attractions,
                hotelName: hotel.propertyName,
                isVisible: true,
                isPriceAvailable: false,
              };
            });
            setMainHotelsListResp(hotelDetails);
            const hotelIds = hotelDetails.map(hotel => hotel.hotelCode);
            fetchHotelsInBatches(hotelIds, staticObj.cityId, hotelDetails);



          } else {
            setMainHotelsListResp([]);

          }

        } else {

          fetchHotels()

        }

      })
      .catch((err) => {
        setIsLoading(false);

        console.log(err);
      });
  };

  const fetchHotelsInBatches = (hotelIds, hotelCityCode, hotelDetails) => {
    const BATCH_SIZE = 100;
    const totalHotels = hotelIds.length;
    const batches = Math.ceil(totalHotels / BATCH_SIZE);

    setMainHotelsListResp([])
    const existingHotelCodes = new Set();
    const fetchBatch = (batchIndex) => {
      const start = batchIndex * BATCH_SIZE;
      const end = start + BATCH_SIZE;
      const hotelIdsBatch = hotelIds.slice(start, end);


      let searchReqObj
      if (!hotelParam) {
        const hotelSearchParams = queryString.parse(window.location.search);



        if (hotelSearchParams) {
          let hotelCityCode = queryString.parse(hotelSearchParams.hotelCityCode);
          { console.log(JSON.parse(hotelSearchParams?.roomGuests), hotelSearchParams?.roomGuests, "hotelparams") }
          searchReqObj = {
            checkInDate: hotelSearchParams.checkInDate,
            checkOutDate: hotelSearchParams.checkOutDate,
            hotelIds: hotelIdsBatch,
            hotelCityCode: hotelCityCode?.cityId,
            // roomGuests: JSON.parse(hotelSearchParams?.roomGuests),
            roomGuests: (() => { try { return JSON.parse(hotelSearchParams?.roomGuests || hotelSearchParams?.roomGuests); } catch { console.error("Invalid JSON in roomGuests"); return []; } })(),
            nationality: hotelSearchParams?.nationality ?? "IN",
            countryCode: "IN",

            isHotelDescriptionRequried: false,
            currency: hotelSearchParams.currency,
            traceId: " ",
            userId: user?.UserID ?? 1,
            roleType: user?.Role?.RoleId ?? 4,
            membership: user?.Membership ?? 1,
          };

        }
      } else if (Object.keys(hotelParam).length > 0) {
        searchReqObj = {
          ...hotelParam,
          userId: user?.UserID ?? 1,
          roleType: user?.Role?.RoleId ?? 4,
          membership: user?.Membership ?? 1,
        };


      }


      ApiClient.post("hotels-v2/hotelsearch", searchReqObj)
        .then((res) => {
          if (res.status === 200 && res.data.hotels.length > 0) {
            const hotelsdata = res.data.hotels;




            const combinedHotelDetails = [];
            for (let i = 0; i < hotelsdata.length; i++) {
              const hotel = hotelsdata[i];


              if (!existingHotelCodes.has(hotel.hotelCode)) {
                let matchHotelSearchData = hotelDetails.find(
                  (data) => data.hotelCode === hotel.hotelCode

                );

                combinedHotelDetails.push({
                  ...(matchHotelSearchData || {}),
                  ...hotel,
                  isPriceAvailable: true,
                  isVisible: true,


                });

                existingHotelCodes.add(hotel.hotelCode);
              }
            }

            setListOfHotels(prevList => [...prevList, ...combinedHotelDetails]);
            setMainHotelsListResp(prevList => [...prevList, ...combinedHotelDetails]);
            setIsHotelSearchLoad(false);
            setIsLoading(false);
          } else {

            setIsLoading(false);
            console.error("Error: Non-200 response status", res.status);
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {

          if (batchIndex + 1 < batches) {
            fetchBatch(batchIndex + 1);
          }
          else {

            setResultLoading(false);
          }
        });
    };


    fetchBatch(0);
  };


  const fetchHotels = () => {
    let hot = [];
    if (!hotelParam) {
      const hotelSearchParams = queryString.parse(window.location.search);



      if (hotelSearchParams) {
        let hotelCityCode = queryString.parse(hotelSearchParams.hotelCityCode);

        let searchReqObj = {
          checkInDate: hotelSearchParams.checkInDate,
          checkOutDate: hotelSearchParams.checkOutDate,

          hotelCityCode: hotelCityCode.cityId,
          roomGuests: JSON.parse(hotelSearchParams?.roomGuests),
          nationality: hotelSearchParams?.nationality ?? "IN",
          countryCode: "IN",

          isHotelDescriptionRequried: false,
          currency: hotelSearchParams.currency,
          traceId: " ",
          userId: user?.UserID ?? 1,
          roleType: user?.Role?.RoleId ?? 4,
          membership: user?.Membership ?? 1,
        };
        getHotelDetails(searchReqObj, hot);
        setHotelSearchobj(searchReqObj);
      }
    } else if (Object.keys(hotelParam).length > 0) {
      let searchReqObj = {
        ...hotelParam,
        userId: user?.UserID ?? 1,
        roleType: user?.Role?.RoleId ?? 4,
        membership: user?.Membership ?? 1,
      };

      getHotelDetails(searchReqObj, hot);
    }
  }
  const fetchHotelSearch = (hotelDetails) => {

    if (!hotelParam) {
      const hotelSearchParams = queryString.parse(window.location.search);


      if (hotelSearchParams) {
        let hotelCityCode = queryString.parse(hotelSearchParams.hotelCityCode);


        let searchReqObj = {
          checkInDate: hotelSearchParams.checkInDate,
          checkOutDate: hotelSearchParams.checkOutDate,

          hotelCityCode: hotelCityCode.cityId,
          roomGuests: JSON.parse(hotelSearchParams.roomGuests),
          nationality: hotelSearchParams?.nationality ?? "IN",
          countryCode: hotelDetails[0]?.countryCode,

          isHotelDescriptionRequried: false,
          currency: hotelSearchParams.currency,
          traceId: " ",
          userId: user?.UserID ?? 1,
          roleType: user?.Role?.RoleId ?? 4,
          membership: user?.Membership ?? 1,
        };
        getHotelDetails(searchReqObj, hotelDetails);
        setHotelSearchobj(searchReqObj);
      }
    } else if (Object.keys(hotelParam).length > 0) {
      let searchReqObj = {
        ...hotelParam,
        userId: user?.UserID ?? 1,
        roleType: user?.Role?.RoleId ?? 4,
        membership: user?.Membership ?? 1,
      };
      getHotelDetails(searchReqObj, hotelDetails);
    }
  };


  const processStaticData = (staticData) => {
    const hotelDetails = staticData.hotelDetails.map((hotel) => {
      return {
        ...hotel,
        hotelCode: hotel.hotelId,
        hotelName: hotel.propertyName,
        isVisible: true,
        isPriceAvailable: false,
      };
    });
    setMainHotelsListResp(hotelDetails);

  };


  const getHotelDetails = (searchReqObj, hotelDetails) => {
    ApiClient.post("hotels-v2/hotelsearch", searchReqObj)
      .then((res) => {
        if (res.status === 200 && res.data.hotels.length > 0) {
          setTraceId(res.data.traceId);
          const hotelsdata = res.data.hotels;
          setListOfHotels(hotelsdata);
          let combinedHotelDetails = [];

          if (res?.data?.hotels?.[0]?.supplier === 'AKBAR') {

            for (let i = 0; i < hotelsdata.length; i++) {
              combinedHotelDetails?.push({
                ...hotelsdata[i],
                isPriceAvailable: true,
                isVisible: true
              })
            }

            sethotelalldata(res.data.filters)
            setMainHotelsListResp(combinedHotelDetails);

            setIsHotelSearchLoad(false);



          } else {

            if (hotelsdata.length > 0) {

              for (let i = 0; i < hotelsdata.length; i++) {
                let matchHotelSearchData = hotelDetails.filter(
                  (data) => data.hotelId == hotelsdata[i].hotelCode
                );
                combinedHotelDetails.push({
                  ...matchHotelSearchData[0],
                  ...hotelsdata[i],
                  isPriceAvailable: true,
                });
              }
            }

            setMainHotelsListResp(combinedHotelDetails);

          }


        } else {
          console.log("No hotels found from search.");
        }
        setIsHotelSearchLoad(false);
        setIsLoading(false);

      })
      .catch((err) => {
        console.error(err);
        setIsHotelSearchLoad(false);

        setIsLoading(false);
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
        <div className="hotels-page-wrapper" style={{ marginTop: -38 }}>
          {isFromPackage ? null : (
            <section className="hotels_modify">
              <div className="hotel-modify-container">
                <Collapse
                  activeKey={md ? ["1"] : key}
                  showArrow={false}
                  onChange={(val) => {
                    setKey(val);
                  }}
                >
                  <Panel
                    showArrow={false}
                    header={
                      <span className="hotels-hide-search">Modify Search</span>
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
                    {/* <Col md={24} xs={24} style={{ marginTop: "-10px" }}>
                      <CustomProgressBar
                        showInfo={false}
                        status="active"
                        strokeColor="#da251c"
                      />
                    </Col> */}
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

                          {/* <HotelSort
                            listOfHotels={listOfHotels}
                            setListOfHotels={setListOfHotels}
                            showNetFare={showNetFare}
                            setShowNetFare={setShowNetFare}
                            setShortedHotelModalVisible={setShortedHotelModalVisible}
                            shortedHotelCount={shortedHotelCount}
                          /> */}
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
                Loading={resultLoading}
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


      </div >
    </>
  );
};

export default HotelResults;
