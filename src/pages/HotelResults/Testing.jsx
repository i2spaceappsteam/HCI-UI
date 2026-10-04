import React, { useState, useEffect } from "react";
import ApiClient from "../../helpers/ApiClient";

const Testing = () => {
  const [respData, setRespData] = useState([]);
  const [hotelList, setHotelList] = useState([]);
  useEffect(() => {
    tesingAPI();
  }, []);

  let tesingAPI = () => {
    let searchReqObj = {
      checkIn: "2020-08-30",
      checkOut: "2020-08-31",
      city: "Hyderabad",
      roomsCount: 1,
      roomDetails: [
        {
          adultsCount: 2,
          childCount: 0,
          childrenAges: [],
        },
      ],
      countryCode: "IN",
    };

    ApiClient.post("hotels/search", searchReqObj)
      .then((result) => {
        return result;
      })
      .then((result) => {
        setRespData(result.data);
        second(result.data);
      });
  };

  let second = (respData) => {
    let ids = respData.map((hotelObj) => hotelObj.hotelId);

    let reqObj = {
      hotelIds: ids,
    };

    ApiClient.post("hotels/hotelStaticData", reqObj)
      .then((result) => {
        return result;
      })
      .then((result) => {
        setHotelList(result.data);
        // setHotelList
      });
  };

  return (
    <div>
      {hotelList.map((hotelObj) => (
        <p>{hotelObj.propertyName}</p>
      ))}
    </div>
  );
};

export default Testing;
