import React, { useState, useCallback, useEffect } from "react";
import { Form, Spin, Select } from "antd";
import Apiclient1 from "../../Helpers/Apiclient1";

import queryString from "query-string";
const { Option } = Select;
const AutoCompleteSelect = (props) => {
  useEffect(() => {
    let value = props?.refName?.current?.props?.value;
    const hotelSearchParams = queryString?.parse(value);

    if (!value || value == "" || value == " ") {
      return;
    }
    fetchData(
      hotelSearchParams?.cityName?.split(",")[0],
      hotelSearchParams?.cityId
    );
  }, props?.refName.current);

  const onSelect = () => {
    if (props?.focusRef) {
      props?.handleOnSubmit(props?.focusRef);
    }
  };

  const [details, setDetails] = useState({
    data: [],
    fetching: false,
  });

  const debounceOnChange = useCallback(debounce(fetchData, 800), []);

  const createOptions = (results, cityId) => {
    let arr = [];

    if (cityId != null) {
      results = results?.filter((item) => item.cityId == cityId);
    }

    results?.forEach((result) => {
      arr.push({
        cityId: `cityName=${result?.cityName}&&cityId=${result.cityId}`,
        cityName: result.cityName,
      });
    });

    return arr;
  };

  function fetchData(value, cityId = null) {
    if (value || cityId) {
      setDetails({ data: [], fetching: true });
      Apiclient1.get(`${props.api}${value}`)
        .then((res) => {
          if (res?.status === 200 && res) {
            setDetails({
              data: createOptions(res?.data, cityId),
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
  return (
    <Form.Item {...props.formItemProps}>
      <Select
        style={{ width: "100%" }}
        showSearch
        ref={props.refName}
        notFoundContent={
          details.fetching ? <Spin size="small" /> : "No Matches found."
        }
        filterOption={false}
        onSearch={debounceOnChange}
        {...props.selectProps}
        onSelect={onSelect}
      >
        {details.data.map((d) => (
          <Option value={d.cityId} key={"hotelKey" + d.cityId}>
            {d.cityName}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default AutoCompleteSelect;
