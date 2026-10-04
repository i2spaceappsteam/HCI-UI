import React, { useState, useCallback, useEffect } from "react";
import { Form, Spin, Select } from "antd";
import Apiclient1 from "../../Helpers/Apiclient1";


import queryString from "query-string";
import { useLocalStorage } from "../../helpers/useStorage";
const { Option, OptGroup } = Select;
const defaultimage = import.meta.env.VITE_Image_URL + "images/Icons/defaultflagicon.png";
const HotelAutoCompleteSelectByCategory = (props) => {

  useEffect(() => {
    let value = props?.selectProps?.value?.hotelss;
    const hotelSearchParams = queryString.parse(value);

    if (!value || value.trim() === "") {
      return;
    }

    fetchData(
      hotelSearchParams?.cityName.split(",")[0],
      hotelSearchParams?.cityId
    );
    // Depend on the string value, NOT the object — object is new every render → infinite API calls
  }, [props?.selectProps?.value?.hotelss]);



  const onSelect = () => {
    if (props.focusRef) {
      props.handleOnSubmit(props.focusRef);
    }
  };

  const [details, setDetails] = useState({
    data: [],
    fetching: false,
  });

  const debounceOnChange = useCallback(debounce(fetchData, 800), []);

  const createOptions = (results, cityId) => {
    let arr = [];
    // console.log(results,"results");
    if (cityId != null) {
      results = results?.filter((item) => item.cityId == cityId);
    }

    results?.forEach((result) => {
      arr.push({
        cityId: `cityName=${result.cityName}&&cityId=${result.cityId}`,
        cityName: result.cityName,
        state: result.state,
      });
    });
    // console.log("arr", arr);
    return arr;
  };

  function fetchData(value, cityId = null) {
    if (!value && !cityId) return;

    setDetails({ data: [], fetching: true });
    Apiclient1.get(`${props.api}${value}`)
      .then((res) => {
        // Apiclient1 resolves to the parsed JSON directly (an array), not {status, data}
        if (Array.isArray(res) && res.length >= 0) {
          setDetails({
            data: createOptions(res, cityId),
            fetching: false,
          });
          return;
        }
        // fallback: handle axios-style {status, data} shape just in case
        if (res && res.status === 200 && Array.isArray(res.data)) {
          setDetails({
            data: createOptions(res.data, cityId),
            fetching: false,
          });
          return;
        }
        setDetails({ data: [], fetching: false });
      })
      .catch((error) => {
        console.error(error);
        setDetails({ data: [], fetching: false });
      });
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(context, args);
      }, wait);
    };
  }

  const [HotelRecentSearches, setHotelRecentSearches] = useLocalStorage(
    props.recentKey,
    []
  );

  const recentSearches = (e) => {
    if (e) {
      const optionObj = details.data.find((item) => item.cityId == e);
      if (optionObj) {
        if (HotelRecentSearches.length > 0) {
          let array = [];
          array = [...HotelRecentSearches];
          if (array.length > 4) {
            array.pop();
          }
          if (optionObj) {
            setHotelRecentSearches([
              optionObj,
              ...array.filter((item) => item.cityId !== e),
            ]);
          }
          return;
        }
        setHotelRecentSearches([optionObj]);
      }
    }
  };

  return (
    <Form.Item {...props.formItemProps}>

      <Select
        popupClassName="cstm-Ht-drpdwn"
        showSearch
        optionLabelProp="label"
        ref={props.refName}
        notFoundContent={
          details.fetching ? <Spin size="small" /> : "No Matches found."
        }
        filterOption={false}
        onSearch={debounceOnChange}
        {...props.selectProps}
        onSelect={(e) => {
          onSelect();
          recentSearches(e);
        }}
      >

        {details?.data.length > 0 ? (
          <OptGroup >
            {details?.data.map((d, index) => {
              const HotelsLabel = (
                <div>
                  <p style={{ fontSize: "16px", color: "#111827", fontWeight: "700", margin: "0", fontFamily: "'Inter', 'Nunito', sans-serif" }}>
                    {d.cityName.split(",")[0]}
                    <span style={{ fontSize: "12px", color: "#9B9B9B", display: "inline-block", marginLeft: "8px", fontWeight: "500" }}>
                      {d.cityName.split(",")[1]}
                    </span>
                  </p>
                </div>
              );
              return (
                <Option label={HotelsLabel} value={d.cityId} key={"hotelKey" + d.cityId + index}>
                  <div className="d-flex align-items-center justify-content-between">
                    <i className="fa fa-hotel forplace-wor-dropdownflight" style={{ color: '#f5802c', marginRight: '10px' }}></i>
                    <div className="for-elepsis-work-dropdownhotels" style={{ flex: 1 }}>
                      <p style={{ fontSize: "16px", color: "#111827", fontWeight: "700", margin: "0", fontFamily: "'Inter', 'Nunito', sans-serif" }}>
                        {d.cityName.split(",")[0]}
                        <span style={{ fontSize: "12px", color: "#9CA3AF", display: "block", marginTop: "2px", fontWeight: "500" }}>
                          {d.cityName.split(",")[1]}
                        </span>
                      </p>
                    </div>
                  </div>
                </Option>
              );
            })}
          </OptGroup>
        ) : (
          (props.value || props.selectProps?.value?.hotelss) && (
            <Option value={props.value || props.selectProps?.value?.hotelss} label={
              <div>
                <p style={{ fontSize: "16px", color: "#111827", fontWeight: "700", margin: "0", fontFamily: "'Inter', 'Nunito', sans-serif" }}>
                  {queryString.parse(props.value || props.selectProps?.value?.hotelss)?.cityName?.split(',')[0] || "Hyderabad"}
                </p>
              </div>
            }>
            </Option>
          )
        )}
      </Select>
    </Form.Item>
  );
};

export default HotelAutoCompleteSelectByCategory;
