import React, { useState,useEffect } from "react";
import { Button ,Modal,Row,Col} from "antd";
import HotelsList from "./HotelsList/HotelsList";

import { message } from "antd";

import ShortListedHotel from "../../components/ShortListedHotel/ShortListedHotel";
import InfiniteScroll from "react-infinite-scroll-component";
const HotelContainer = ({
  isFromPackage = false,
  listOfHotels,
  traceId,
  isHotelSearchLoad,
  showNetFare,
  mainHotelsListResp,
  searchHotelReq,
  setShortedHotelListCount,
  setShortedHotelModalVisible,
  shortedHotelModalVisible,
  setListOfHotels,
  Loading,

}) => {
  const hotelResultLength = 15;
  const [pagination, SetPagination] = useState(51);
  const [activeTab, setActiveTab] = useState(null);
  const [shortedHotelList, setShortedHotelList] = useState([])
  const [showCompareButton, setShowCompareButton] = useState(true)
  const [showMoreShortedHotelAminities, setShowMoreShortedHotelAminities] = useState(false)
  const [compareHotelList, setCompareHotelList] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const [hotelInfoList, setHotelInfoList] = useState([])
  const showMore = () => {
    SetPagination((prev) => prev + 51);
  };



  let bannreIndex = -1;
  const HotelResultLength = 10;
  const [displayHotelResult, updateDisplayHotelResult] = useState([])
  const [HotelList, setHotelList] = useState([]);
  const fetchMoreBuses = () => {if (HotelList.length === 0) return;
    setTimeout(() => {
      updateDisplayHotelResult((prev) => [...prev, ...HotelList.slice(prev.length, prev.length + HotelResultLength)])
    }, 100)
  }
  useEffect(() => {
    let visibleData = listOfHotels.filter((item) => item.isVisible);
    
    updateDisplayHotelResult(visibleData.slice(0, HotelResultLength))
 
    setHotelList(visibleData);
  }, [listOfHotels]);

  const handelShortedHotelsList = (hotels, isOnPageLoad = false, hotelCityId = null) => {

    let getShortedHotelList = localStorage.getItem('SHORTEDHOTELLIST');
    getShortedHotelList = getShortedHotelList ? JSON.parse(getShortedHotelList) : []

    

    let shortedHotelArray = []
    if (!isOnPageLoad) {
      const { hotelCode, hotelName, images, supplier, starRating, addresses, city, cityId,
        countryCode, countryName, hotelFacility, hotelNetPrice, hotelPublishPrice, isVisible } = hotels
      const selectedHotelData = {
        hotelCode, hotelName, images, supplier, starRating, addresses, city, cityId,
        countryCode, countryName, hotelFacility, hotelNetPrice, hotelPublishPrice, isVisible
      }

      if (getShortedHotelList.length == 0) {

        let storeHotelObj = {
          traceId: traceId,
          hotelCityCode: searchHotelReq ? searchHotelReq.cityId : null,
          hotelCode: [hotelCode],
          hotelDetails: [selectedHotelData]
        }
        shortedHotelArray.push(storeHotelObj)
        setShortedHotelListCount(storeHotelObj.hotelCode.length)
        setShortedHotelList(storeHotelObj.hotelDetails)

        let data = listOfHotels.map((hotel) => {
          return { ...hotel, isHotelShortListed: hotel.hotelCode == hotelCode ? true : hotel.isHotelShortListed };
        })
        setListOfHotels(data);

        localStorage.setItem('SHORTEDHOTELLIST', JSON.stringify(shortedHotelArray));
      }
      if (getShortedHotelList.length > 0) {
        let isValidCount = true
       
        const prevStoredHotel = getShortedHotelList

        const checkIsHotelCity = prevStoredHotel.find(h => h.hotelCityCode == searchHotelReq?.cityId)
        if (checkIsHotelCity) {
         
          const isHotelCode = checkIsHotelCity.hotelCode.some(hc => hc == hotelCode)
          const isHotelDetails = checkIsHotelCity.hotelDetails.some(hc => hc.hotelCode == hotelCode)

          /**Hotels In LocalStorage For the 1 City Should Not be More than 4 */

          if (!isHotelCode && checkIsHotelCity.hotelCode.length >= 4) {
            message.error("Maximum 4 hotels can be shortlisted", 3)
            isValidCount = false
          }
          if (isValidCount) {

            let data = listOfHotels.map((hotel) => {
              return { ...hotel, isHotelShortListed: (hotel.hotelCode == hotelCode && isHotelCode) ? false : hotel.hotelCode == hotelCode ? true : hotel.isHotelShortListed }; //isHotelCode = true means Hotel is already Selected
            })
           

            setListOfHotels(data);

            let storeHotelObj = {
              traceId: traceId,
              hotelCityCode: searchHotelReq ? searchHotelReq.cityId : null,
              hotelCode: isHotelCode ? checkIsHotelCity.hotelCode.filter(hc => hc != hotelCode) : [...checkIsHotelCity.hotelCode, hotelCode],
              hotelDetails: isHotelDetails ? checkIsHotelCity.hotelDetails.filter(hc => hc.hotelCode != hotelCode) : [...checkIsHotelCity.hotelDetails, selectedHotelData]
            }
            setShortedHotelList(storeHotelObj.hotelDetails)
            setShortedHotelListCount(storeHotelObj.hotelCode.length)

            shortedHotelArray.push(storeHotelObj)
          }
        }
        

        if (!checkIsHotelCity) {
          let storeHotelObj = {
            traceId: traceId,
            hotelCityCode: searchHotelReq ? searchHotelReq.cityId : null,
            hotelCode: [hotelCode],
            hotelDetails: [selectedHotelData]
          }
          shortedHotelArray.push(...prevStoredHotel, storeHotelObj)

          let data = listOfHotels.map((hotel) => {
            return { ...hotel, isHotelShortListed: hotel.hotelCode == hotelCode ? true : hotel.isHotelShortListed };
          })
         
          setListOfHotels(data);

        }
        if (isValidCount) {
          localStorage.setItem('SHORTEDHOTELLIST', JSON.stringify(shortedHotelArray));
        }

      }
      
    }
    if (isOnPageLoad) {
      

      const filterShortedHotel = getShortedHotelList.find(sh => sh.hotelCityCode == hotelCityId)

      if (filterShortedHotel) {

        let storeHotelObj = {
          traceId: traceId,
          hotelCityCode: searchHotelReq ? searchHotelReq.cityId : null,
          hotelCode: [],
          hotelDetails: []
        }

        let data = mainHotelsListResp

        for (let i = 0; i < filterShortedHotel.hotelCode.length; i++) {

          const hoteldata = data.find(hc => hc.hotelCode == filterShortedHotel.hotelCode[i])

          if (hoteldata) {

          

            data = data.map((hotel) => {
              return { ...hotel };
            })

            storeHotelObj.hotelCode.push(hoteldata.hotelCode)
            storeHotelObj.hotelDetails.push({
              hotelCode: hoteldata.hotelCode,
              hotelName: hoteldata.hotelName,
              images: hoteldata.images,
              supplier: hoteldata.supplier,
              starRating: hoteldata.starRating,
              addresses: hoteldata.addresses,
              city: hoteldata.city,
              cityId: hoteldata.cityId,
              countryCode: hoteldata.countryCode,
              countryName: hoteldata.countryName,
              hotelFacility: hoteldata.hotelFacility,
              hotelNetPrice: hoteldata.hotelNetPrice,
              hotelPublishPrice: hoteldata.hotelPublishPrice,
              isVisible: hoteldata.isVisible,
              latitude: hoteldata.latitude,
              longitude: hoteldata.longitude

            })

          }
        }
        setListOfHotels(data);
        setShortedHotelList(storeHotelObj.hotelDetails)
        setShortedHotelListCount(storeHotelObj.hotelDetails.length)
        shortedHotelArray.push(storeHotelObj)
        localStorage.setItem('SHORTEDHOTELLIST', JSON.stringify(shortedHotelArray));
      }
    }

  }
    useEffect(() => {
     
    if (!isHotelSearchLoad && mainHotelsListResp.length > 0) {
      handelShortedHotelsList(null, true, searchHotelReq?.cityId)
     
    }
  }, [isHotelSearchLoad])
  const compareSelectedHotel = () => {
    if (compareHotelList.length < 2) {
      message.error("Please Select Hotels To Compare", 3)
    }
    else {
      setShowCompare(true)
      setShowCompareButton(false)
    }
  }
  const handelCopmareHotel = (hotels, e) => {

    if (compareHotelList.length == 3 && e.target.checked) {
      message.error("Maximum 3 Hotels Can be Compare", 3)
    } else {
      if (e.target.checked) {
        let comparedata = compareHotelList
        comparedata.push(hotels)
        setShowCompareButton(true)
        setCompareHotelList(comparedata)
      } else {
        const filterHotels = compareHotelList.filter(h => h.hotelCode != hotels.hotelCode)
        setCompareHotelList(filterHotels)
      }
    }

  }
  useEffect(() => {
    setHotelInfoList(listOfHotels.slice(0, hotelResultLength))
  }, [listOfHotels])

  const fetchMoreHotels = () => {
    setTimeout(() => {
      setHotelInfoList((prev) => [...prev, ...listOfHotels.slice(prev.length, prev.length + hotelResultLength)])
    }, 100)
  }

  return (
    <div className="list-of-items">
      
     {displayHotelResult.length > 0 ?
    
           <InfiniteScroll
            dataLength={displayHotelResult.length}
            next={fetchMoreBuses}
            hasMore={displayHotelResult.length >= HotelList.length ? false : true}
            endMessage={"End Of Hotel Result"}
        
        loader={<h4>Loading...</h4>}
      >
      {displayHotelResult.map((availableHotel, itemIndex) => {
         return (
          <>
        

            <HotelsList
              keyId={"hotelKey" + itemIndex}
              availableHotel={availableHotel}
              hotelTraceId={traceId}
              isFromShortListed={false}
              isFromPackage={isFromPackage}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isHotelSearchLoad={isHotelSearchLoad}
              showNetFare={showNetFare}
              searchHotelReq={searchHotelReq}
                handelShortedHotelsList={handelShortedHotelsList}
                handelCopmareHotel={handelCopmareHotel}
                Loader={Loading}
            />
          </>
         ) 
      })}
      </InfiniteScroll>
      : ""}
        <Modal
        width={1300}
        title={[
          <div>
            <h6 style={{ marginBottom: "0px" }}>
              <strong>Shortlisted Hotels</strong>
            </h6>
          </div>,
        ]}
        className="promo-modal-header"
        open={shortedHotelModalVisible}
        onOk={(e) => setShortedHotelModalVisible(false)}
        onCancel={(e) => setShortedHotelModalVisible(false)}
        footer={[
          <div>
            <Button type="primary" onClick={() => setShortedHotelModalVisible(false)}>
              Close
            </Button>
           
          </div>,
          <div className="button-compare-map" >
            {
              (showCompareButton) ? (<Button type="primary" onClick={() => compareSelectedHotel()}>
                Compare
              </Button>) : null
            }
          </div>
        ]}
      >
        <div>
          <Row gutter={16}>
            <Col md={10} xs={24}>
              {shortedHotelList.map((availableHotel, itemIndex) => {
                return (<>
                  <HotelsList
                    keyId={"hotelKey" + itemIndex}
                    availableHotel={availableHotel}
                    hotelTraceId={traceId}
                    isFromShortListed={true}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isHotelSearchLoad={isHotelSearchLoad}
                    showNetFare={showNetFare}
                    searchHotelReq={searchHotelReq}
                    handelShortedHotelsList={handelShortedHotelsList}
                    handelCopmareHotel={handelCopmareHotel}
                    id={itemIndex}
                    type={"shortlisted"}
                    ismapview={false}
                  />
                  
                </>)
              })}
            </Col>
            <Col md={14} xs={24}>
              {
                showCompare && compareHotelList.length > 0 && (
                  <>
                    <Row style={{ boxShadow: "0 1px 5px black" }} gutter={16}>
                      {
                        compareHotelList.map((availableHotel, itemIndex) => {
                          return (<>
                            <Col style={{ borderLeft: "1px solid black" }} md={8} xs={24} >
                              <ShortListedHotel
                                availableHotel={availableHotel}
                                hotelTraceId={traceId}
                                isFromShortListed={true}
                                isHotelSearchLoad={isHotelSearchLoad}
                                showNetFare={showNetFare}
                                searchHotelReq={searchHotelReq}
                                showMoreShortedHotelAminities={showMoreShortedHotelAminities}

                              />

                            </Col>

                          </>)

                        })
                      }
                      <div className="main-box-showmore">

                        <Button style={{ backgroundColor: "white", color: "red" }} onClick={() => setShowMoreShortedHotelAminities(!showMoreShortedHotelAminities)}>
                          {showMoreShortedHotelAminities ? "Show Less" : "Show More"}
                        </Button>

                      </div>
                    </Row>  </>) 
              }
            </Col>

          </Row>
        </div>


      </Modal>
    </div>
  );
};

export default HotelContainer;
