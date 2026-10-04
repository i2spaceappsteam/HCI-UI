import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Collapse,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router";
import HotelPassengers from "./HotelPassengers/HotelPassengers";
import CountryList from "../../common/CountryList";
import moment from "moment";
import dayjs from "dayjs";
import queryString from "query-string";
import { SearchOutlined } from "@ant-design/icons";
import "../Hotels/Hotels.scss";

import HotelAutoCompleteSelectByCategory from "../../common/AirportAutoComplete/HotelAutoCompleteSelectByCategory";
import { useSessionStorage } from "../../helpers/useStorage";
import { useDispatch } from "react-redux";
import { getsessiontimeout } from "../../store/slices/hotelSlice";

const { Option } = Select;
const Hotels = (props) => {
  let history = useNavigate();
  const [form] = Form.useForm();
  const dateFormat = "DD-MM-YYYY";
  const oriDateFormat = "YYYY-MM-DD";
  const { Panel } = Collapse;
  const returnDateBox = useRef();
  const [showDate, setShowDate] = useState(false);
  const [HotelsHide, setHotelsHide] = useState(true);
  const [showReturnDate, setShowReturnDate] = useState(false);
  const [checkInDate, setCheckInDate] = useState(dayjs().add(1, "days"));
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(2, "days"));
  const dispatch = useDispatch();
  const getsessiontimeoutHandler = () => dispatch(getsessiontimeout());
  const city = useRef(null);
  const dateBox = useRef(null);
  const ccode = useRef(null);
  const roomLimit = 6;
  const defHotelPaxInfo = [
    {
      noOfAdults: 2,
      noOfChilds: 0,
      childAge: [],
    },
  ];
  const modalRef = useRef(null);
  const [hotelPaxInfo, setHotelPaxInfo] = useState(defHotelPaxInfo);
  const paxInfo = [...hotelPaxInfo];
  const validateMessages = {
    required: "",
  };
  const [hotelss, setHotelss] = useState("cityName=Hyderabad,India&&cityId=22034");

  const [rooms, setRooms] = useState(false);
  const searchBtn = useRef();
  const [roomlength, setroomlength] = useState(1);
  const toggleCount = () => {


    setRooms((prev) => {
      const newState = !rooms;

      return newState;
    });

  };

  const addRoom = () => {
    paxInfo.push({
      noOfAdults: 1,
      noOfChilds: 0,
      childAge: [],
    });
    setroomlength(paxInfo?.length);
    setHotelPaxInfo(paxInfo);
  };

  let updatePaxInfoFromChild = (paxInfo) => {
    setHotelPaxInfo(paxInfo);
  };

  let getPaxCount = () => {
    return paxInfo.reduce(
      (total, pax) => total + pax.noOfAdults + pax.noOfChilds,
      0
    );
  };
  const departureDate = dayjs();
  const submitForm = (values) => {
    let formData = {
      checkInDate: dayjs(values.checkInDate).format("YYYY-MM-DD"),
      checkOutDate: dayjs(values.checkOutDate).format("YYYY-MM-DD"),
      hotelCityCode: values.hotelCityCode,
      roomGuests: JSON.stringify(hotelPaxInfo),
      nationality: values.nationality,

      countryCode: "AE",
      isHotelDescriptionRequried: false,
      currency: "INR",
      traceId: "string",
      userId: 1,
      roleType: 4,
      membership: 1,
    };
    localStorage.setItem("HotelSearchBar", JSON.stringify(formData));
    const query = queryString.stringify(formData);

    recentSearches(query);

    history("/hotels/listing?" + query);

    if (props.modifySearch) {
      props.hotelSearchAPI();
      setHotelsHide(false);
    }
  };

  const [HotelRecentSearchesResults, setHotelRecentSearchesResults] =
    useSessionStorage("hotelRecentSearchesResults", []);

  const recentSearches = (searchObj) => {
    if (searchObj) {
      searchObj = queryString.parse(searchObj);

      if (HotelRecentSearchesResults.length > 0) {
        let array = [];
        array = [...HotelRecentSearchesResults];
        if (array.length > 4) {
          array.pop();
        }

        if (searchObj) {
          setHotelRecentSearchesResults([
            searchObj,
            ...array.filter(
              (item) => item.hotelCityCode !== searchObj.hotelCityCode
            ),
          ]);
        }

        return;
      }
    }

    setHotelRecentSearchesResults([searchObj]);
  };
  useEffect(() => {
    getsessiontimeoutHandler();
  }, []);
  useEffect(() => {
    if (props.modifySearch) {
      setHotelsHide(false);
      const hotelSearchParams = queryString.parse(window.location.search);

      if (hotelSearchParams?.roomGuests) {
        var roomDetails = JSON.parse(hotelSearchParams?.roomGuests);
      } else {
        return;
      }

      // Sync the hotelss state so the autocomplete shows the correct searched city
      if (hotelSearchParams?.hotelCityCode) {
        setHotelss(hotelSearchParams.hotelCityCode);
      }

      form.setFieldsValue({
        hotelCityCode: hotelSearchParams.hotelCityCode,
        checkInDate: dayjs(hotelSearchParams.checkInDate, "YYYY-MM-DD"),
        checkOutDate: dayjs(hotelSearchParams.checkOutDate, "YYYY-MM-DD"),
        nationality: hotelSearchParams.nationality,
      });
      setHotelPaxInfo(roomDetails);
    }

  }, [window.location.search]);


  const disabledOriginDate = (currentDate) => {
    return currentDate < dayjs().startOf("day");
  };

  const disabledDestDate = (currentDate) => {
    return (
      currentDate < dayjs(checkInDate).add(1, "days") ||
      currentDate.valueOf() > dayjs(checkInDate).add(30, "days")
    );
  };

  const onChangeOriginDate = (momentdate, _) => {
    let originDate = "";

    if (momentdate) {
      originDate = momentdate ? dayjs(momentdate).startOf("day") : "";
      setCheckInDate(momentdate);
    }
    setCheckOutDate(momentdate);
    const toDate = form.getFieldValue("checkOutDate");
    if (toDate) {
      let a = dayjs(toDate).startOf("day");
      let diffDays = a.diff(originDate, "days");
      if (diffDays <= 0) {
        let newTodate = dayjs(momentdate).add(1, "days");
        form.setFieldsValue({
          checkOutDate: newTodate,
        });
      }
    }
  };

  const handleOnSubmit = (ref) => {
    ref.current.focus();
    if (ref === dateBox) {
      setShowDate(true);
    }
  };

  // const { topCities } = useSytContext();
  // const [HotelTopCities, setHotelTopCities] = useState([]);
  // useEffect(() => {
  //   if (topCities.length) {
  //     let data = topCities.filter((item) => item.ServiceType === 2);
  //     if (data.length) {
  //       setHotelTopCities(data);
  //     } else {
  //       setHotelTopCities([]);
  //     }
  //   }
  // }, [topCities]);
  let ondelete = (i) => {
    paxInfo.splice(i, 1);
    setHotelPaxInfo(paxInfo);
    setroomlength(i);
  };
  const onupdate = (i) => {
    setroomlength(i);
  };

  return (
    <div className="hotels_search_box">
      <div className="hotels-wrapper">
        <div className="outer-div-hotel-searchfields">
          <Form
            form={form}
            initialValues={{
              nationality: "IN",
              checkInDate: checkInDate,
              checkOutDate: checkOutDate,
              hotelCityCode: "cityName=Hyderabad,India&&cityId=22034",
            }}
            className="hotel-search-form hotel-bg-panel-all"
            validateMessages={validateMessages}
            onFinish={submitForm}
          >
            <Row className="search-row" gutter={0} style={{ display: 'flex' }}>
              <Col
                md={5}
                xs={24}
                className="from-to-inputs hotel-select-jun my-hts"
              >
                <span className="input-names">Search by City</span>
                <HotelAutoCompleteSelectByCategory
                  formItemProps={{
                    name: "hotelCityCode",
                    rules: [
                      { required: true, message: "Please Specify The City" },
                    ],
                  }}
                  selectProps={{
                    value: { hotelss },
                    size: "large",
                    placeholder: "Enter City Name",
                  }}
                  api={"StaticData/GetMatchingCities/"}
                  refName={city}
                  focusRef={dateBox}
                  handleOnSubmit={handleOnSubmit}
                  modifySearch={props.modifySearch ? props.modifySearch : false}
                  // topCities={HotelTopCities}
                  recentKey="HotelRecentSearches"
                />
              </Col>
              <Col md={4} xs={24} className="my-hts1">
                <span className="input-names">Check-In</span>
                <Form.Item
                  name="checkInDate"
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Date",
                    },
                  ]}
                >
                  <DatePicker
                    allowClear={false}
                    style={{ width: "100%" }}
                    className="train-search-btn"
                    size="large"
                    format={"DD MMM'YY"}
                    disabledDate={disabledOriginDate}
                    onChange={(date, dateString) => {
                      setShowDate((prev) => !prev);
                      if (date) {
                        onChangeOriginDate(date, dateString);
                        setShowReturnDate(true);
                        returnDateBox.current.focus();
                      }
                    }}
                    ref={dateBox}
                    open={showDate}
                    onOpenChange={() => {
                      setShowDate((prev) => !prev);
                    }}
                    placeholder="Check In"
                    popupClassName="custom-mob-calendar"
                    inputReadOnly={true}
                    panelRender={(originalPanel) => {
                      return (
                        <div className="original-panel">
                          <p className="mb-0 text-center mt-1 py-2 font-weight-bold h6 custom-mob-calendar-title">
                            Check In Date
                          </p>
                          {originalPanel}
                        </div>
                      );
                    }}
                  />
                </Form.Item>
              </Col>

              <Col md={4} xs={24} className="my-hts1">
                <span className="input-names">CheckOut</span>
                <Form.Item
                  className="returnDate"
                  name="checkOutDate"
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Date",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    allowClear={false}
                    className="train-search-btn"
                    size="large"
                    format={"DD MMM'YY"}
                    disabledDate={disabledDestDate}
                    ref={returnDateBox}
                    open={showReturnDate}
                    onOpenChange={() => {
                      setShowReturnDate((prev) => !prev);
                    }}
                    defaultPickerValue={checkOutDate}
                    placeholder="Check Out"
                    popupClassName="custom-mob-calendar"
                    inputReadOnly={true}
                    panelRender={(originalPanel) => {
                      return (
                        <div className="original-panel">
                          <p className="mb-0 text-center mt-1 py-2 font-weight-bold h6 custom-mob-calendar-title">
                            Check Out Date
                          </p>
                          {originalPanel}
                        </div>
                      );
                    }}
                  />
                </Form.Item>
              </Col>

              <Col
                md={4}
                xs={24}
                className="from-to-inputs hotel-select-jun my-hts"
              >
                <span className="input-names">Nationality</span>
                <Form.Item
                  name="nationality"
                  rules={[
                    {
                      required: true,
                      message: "Please Select Nationality",
                    },
                  ]}
                >
                  <Select
                    ref={ccode}
                    showSearch
                    size="large"
                    placeholder="Nationality"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {CountryList.map((item) => (
                      <Option key={item.code} value={item.code}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col
                md={4}
                xs={24}
                className="from-to-inputs hotel-select-jun"
              >
                <span className="input-names">Rooms & Guests</span>
                <Form.Item>
                  <Input
                    value={
                      "Room: " + paxInfo.length + ", Guest: " + getPaxCount()
                    }
                    size="large"
                    onClick={toggleCount}
                  />
                  <div className="add-room-block">

                    <div
                      className="pax-modal"
                      id="pax-modal"
                      ref={modalRef}
                      style={{
                        display: rooms ? "block" : "none",
                      }}
                    >
                      {/* {console.log(rooms, "test")} */}
                      <div className="pax-modal-wrapper">
                        <div className="pax-modal-arrow"></div>
                        <ul className="first-item">
                          <Collapse
                            bordered={false}
                            activeKey={roomlength}
                            destroyInactivePanel={true}
                          >
                            {paxInfo.map((pax, index) => (
                              <Panel
                                showArrow={false}
                                collapsible={"header"}
                                header={
                                  <div>
                                    <span
                                      style={{
                                        fontSize: "15px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Room {index + 1}
                                    </span>{" "}
                                    <br />
                                    <span>{pax.noOfAdults} Adults </span>
                                    <span> {pax.noOfChilds} Children </span>
                                  </div>
                                }
                                key={index + 1}
                                extra={
                                  index + 1 != 1 ? (
                                    <div className="icons-hotel-addes">
                                      {" "}
                                      <EditOutlined
                                        onClick={() => onupdate(index + 1)}
                                        style={{
                                          marginLeft: "-10px",
                                          color: "blue",
                                        }}
                                      />
                                      <DeleteOutlined
                                        style={{ color: "red" }}
                                        onClick={() => ondelete(index)}
                                      />
                                    </div>
                                  ) : (
                                    <div className="icons-hotel-addes">
                                      <EditOutlined
                                        style={{ color: "blue" }}
                                        onClick={() => onupdate(index + 1)}
                                      />
                                    </div>
                                  )
                                }
                              >
                                <HotelPassengers
                                  pax={pax}
                                  index={index}
                                  updatePaxInfoFromChild={
                                    updatePaxInfoFromChild
                                  }
                                  paxInfo={paxInfo}
                                />
                              </Panel>
                            ))}
                          </Collapse>
                        </ul>

                        <div>
                          {roomlength < roomLimit ? (
                            <a
                              style={{
                                color: "red",
                                fontWeight: "700",
                                fontSize: "15px",
                              }}
                              onClick={addRoom}
                            >
                              + Add Room
                            </a>
                          ) : null}
                          <Button
                            block
                            className="pax-ready-btn"
                            onClick={() => {

                              let isValid = true;

                              paxInfo.forEach((pax, index) => {

                                if (pax.noOfChilds > 0) {
                                  if (pax.childAge.length < pax.noOfChilds) {
                                    isValid = false;
                                    alert(
                                      `Please provide age for all children in Room ${index + 1
                                      }.`
                                    );
                                  } else {

                                    pax.childAge.forEach((age, ageIndex) => {
                                      if (Number(age) <= 0) {
                                        isValid = false;
                                        alert(
                                          `Invalid age for child ${ageIndex + 1
                                          } in Room ${index + 1
                                          }. Please enter a valid age.`
                                        );
                                      }
                                    });
                                  }
                                }
                              });


                              if (isValid) {
                                toggleCount();
                                if (rooms) searchBtn.current.focus();
                              }
                            }}
                          >
                            Confirm
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Form.Item>
              </Col>

              {/* <Col md={4} xs={24}>
                {HotelsHide ? <ActiveTabs /> : null}
              </Col> */}
              <Col md={3} xs={24}>
                {props?.Loading ? <Button
                  size="large"
                  className="searchhhij"
                  // ref={searchBtn}
                  htmlType="submit"
                  disabled
                >
                  <SearchOutlined /> Loading..
                </Button> :
                  <Button
                    size="large"
                    className="searchhhij"
                    ref={searchBtn}
                    htmlType="submit"
                  >
                    <SearchOutlined /> Search
                  </Button>
                }
                {/* // <Button
                //   size="large"
                //   className="searchhhij"
                //   ref={searchBtn}
                //   htmlType="submit"
                // >
                //   <SearchOutlined /> Search
                // </Button> */}
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
