import React, { useState, useEffect } from "react";
import GlobalStatesContext from "./GlobalStatesContext";
import { message } from "antd";
import moment from "moment";


import EncHelper from "../Helpers/EncHelper";
import  useLocalStorage  from "../Helpers/LocalStorageHelper";

const defBusSearch = {
  type: "oneWay",
  from: null,
  to: null,
  departureDate: new Date(),
  returnDate: null,
};

const defCombinedSearch = {
  tripType: "oneWay",
  classType: "Economy",
  origin: [],
  destination: [],
  fromDate: moment(new Date()).format("YYYY-MM-DD"),
  toDate: "",
  adultCount: 1,
  childCount: 0,
  infantCount: 0,
};

const GlobalStatesProvider = (props) => {
  const [busPersist, setBusPersist] = useLocalStorage("busPersist", {
    busSearchObj: {
      from: null,
      to: null,
      departureDate: new Date(),
    },
    selectedBusData: [],
  });
  const [busPassengerData, setBusPassengerData] = useState([]);
  const [busBookingResp, setBusBookingResp] = useState([]);
  const [busSearchResultObj, setBusSearchResultObj] = useState({});
  const [busTicketData, setBusTicketData] = useState({});
  // const AddPromo = async (text, travelType) => {
  //   //travelType refer to flight or bus
  //   // bus=
  //   //fligght=2

  //   let res = await ApiClient.get("admin/promo");
  //   if (res.status != 200) {
  //     message.error("Invalid Promo Code");
  //     return { validStatus: false };
  //   }
  //   let flag = true;
  //   res.data.forEach((p) => {
  //     if (p.Code == text && p.ServiceType == travelType) {
  //       flag = false;
  //       p.status = true;
  //       p.validStatus = true;
  //       setOtherData({ ...otherData, promoData: p });
  //     }
  //   });
  //   if (flag) {
  //     message.error("Invalid Promo Code");
  //     return { validStatus: false };
  //   }
  // };

  const RemovePromo = () => {
    setOtherData({
      ...otherData,
      promoData: { PromoID: 0, status: false, Discount: 0 },
    });
  };

  const AddConvFee = (type) => {
    // ApiClient.get("admin/convenienceFee").then((res) => {
    //   let convobj = { type: 1, amount: 0 };
    //   res.data.forEach((i) => {
    //     if (i.ServiceType == type) {
    //       convobj.type = i.ConvenienceFeeType;
    //       convobj.amount = i.Value;
    //     }
    //   });
    //   setOtherData({ ...otherData, ConvFee: convobj });
    // });
  };

  //Hydrating Bus Data from localstorage
  // const busPersistJson = JSON.parse(localStorage.getItem("busPersist")) || {};
  // let initBusSearch = busPersistJson.busData || defBusSearch;
  // let initSelectedBusData = busPersistJson.selectedBusData || [];

  //Hydrating Combined Data from localstorage
  const combinedPersistJson =
    JSON.parse(localStorage.getItem("combinedPersist")) || {};
  let initCombinedSearch =
    combinedPersistJson.combineSearchData || defCombinedSearch;

  const loginCheck = JSON.parse(EncHelper.getItem("login")) || {
    flag: false,
    role: false,
  };
  const [isLogin, setLogin] = useState(loginCheck);
  /* const [airlineMatrixReset, setAirlineMatrixReset] = useState(false); */
  // const [busData, setBusData] = useState(initBusSearch);
  // const [selectedBusData, setSelectedBusData] = useState(initSelectedBusData);
  // const [busPassengerData, setBusPassengerData] = useState([]);

  // const [busSearchResultObj, setBusSearchResultObj] = useState({});
  const [otherData, setOtherData] = useState({
    promoData: { PromoID: 0, status: false, Discount: 0 },
    ConvFee: { type: 1, amount: 0 },
  });

  // const [trainInfo, setTrainInfo] = useState({
  //   depatureStation: "",
  //   arrivalStation: "",
  //   departureDate: new Date(),
  //   submitted: false,
  // });

  // const [trainFilters, setTrainFilters] = useState({
  //   depTimes: [],
  //   arrTimes: [],
  //   depStations: [],
  //   arrStations: [],
  // });

  /* const [combineSearchData, setCombineSearchData] =
    useState(initCombinedSearch); */

  // useEffect(() => {
  //   //Bus Data in localstorage
  //   localStorage.setItem(
  //     "busPersist",
  //     JSON.stringify({
  //       busData: busData,
  //       selectedBusData: selectedBusData,
  //     })
  //   );
  // }, [busData, selectedBusData]);

  // useEffect(() => {
  //   //Bus Data in localstorage
  //   localStorage.setItem(
  //     "combinedPersist",
  //     JSON.stringify({
  //       combineSearchData: combineSearchData,
  //     })
  //   );
  // }, [combineSearchData]);

  return (
    <GlobalStatesContext.Provider
      value={{
        state: {
          // busData,
          busPersist,
          // trainInfo,
          // trainFilters,
          busBookingResp,
          // selectedBusData,
          busPassengerData,
          isLogin,
          // combineSearchData, // REMOVED
          busSearchResultObj,
          otherData,
          // airlineMatrixReset, // REMOVED
          busTicketData
        },
        /* ResetAirlineMatrix: (val) => {
          setAirlineMatrixReset(val);
        }, */
        AddPromo: (val, type) => {
          AddPromo(val, type);
        },
        AddConvFee: (v) => {
          AddConvFee(v);
        },
        updateOtherData: (val) => {
          setOtherData(val);
        },
        RemovePromo: () => {
          RemovePromo();
        },
        setBusSearchObj: (searchObj) => {
          setBusPersist((prev) => ({
            ...prev,
            busSearchObj: searchObj,
          }));
        },
        updateBusSearchResultObj: (busSearchResp) => {
          setBusSearchResultObj(busSearchResp);
        },

        updateBusTicketData: (busTicket) => {
          setBusTicketData(busTicket);
        },
        updateSelectedBusData: (selectedbusobj) => {
          setBusPersist((prev) => ({
            ...prev,
            selectedBusData: [selectedbusobj],
          }));
        },
        updateBusPassengerData: (obj) => {
          setBusPassengerData(obj);
        },
        updateBusBookingData: (respObj) => {
          setBusBookingResp(respObj);
        },
        updateIsLogin: (attribute, value) => {
          let temp = {
            ...isLogin,
            [attribute]: value,
          };

          setLogin((prev) => ({ ...prev, [attribute]: value }));
          EncHelper.setItem("login", JSON.stringify(temp));
        },
        /* updataCombineSearchObj: (attribute, value) => {
          setCombineSearchData((prev) => ({ ...prev, [attribute]: value }));
        }, */
      }}
        // updateEmptySelectedBusData: () => {
        //   setSelectedBusData([]);
        // },
        // updateBusSearchResultObj: (busSearchResp) => {
        //   setBusSearchResultObj(busSearchResp);
        // },
        // resetBusSearchObj: (busSearchObj) => {
        //   setBusData(busSearchObj);
        // },
    >
      {props.children}
    </GlobalStatesContext.Provider>
  );
};
export default GlobalStatesProvider;
