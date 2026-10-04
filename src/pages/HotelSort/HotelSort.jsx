import React, { useState, useEffect } from "react";
import { Button, Card, Radio, Input, Select } from "antd";
import { useSelector } from "react-redux";
import { selectIsAgent } from "../../store/slices/authSlice";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import "./hotelSort.scss";

const { Option } = Select;
const HotelSort = ({
  listOfHotels,
  setListOfHotels,
  showNetFare,
  setShowNetFare,
  setShortedHotelModalVisible,
  shortedHotelCount
}) => {

  const user = useSelector((state) => state.auth.user);
  const agent = useSelector(selectIsAgent);

 
  
  const [sorting, setSorting] = useState("price");
  const [searchBy, setSearchBy] = useState("hotel");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleChange = (e) => {
    const selSorting = e.target.value;
    setSorting(selSorting);
    setSortDirection("asc");
    sortHotels(selSorting, "asc");
  };

  const handleClick = (e) => {
    const selSorting = e.target.value;
    if (sorting === selSorting) {
      let dir = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      sortHotels(selSorting, dir);
    }
  };

  
  useEffect(() => {
   
    sortHotels("rating", "desc");
  }, []);

  const sortHotels = (selSorting, dir) => {
    let newlist = listOfHotels.sort((hotelA, hotelB) => {
      if (selSorting === "name") {
        return dir === "asc"
          ? compareHotels(hotelA.hotelName, hotelB.hotelName, selSorting)
          : compareHotels(hotelB.hotelName, hotelA.hotelName, selSorting);
      } else if (selSorting === "rating") {
        return dir === "asc"
          ? compareHotels(hotelA.starRating, hotelB.starRating, selSorting)
          : compareHotels(hotelB.starRating, hotelA.starRating, selSorting);
      } else if (selSorting === "price") {
        return dir === "asc"
          ? compareHotels(
            (hotelA.hotelMinPrice),
            (hotelB.hotelMinPrice),
            selSorting
          )
          : compareHotels(
            (hotelB.hotelMinPrice),
            (hotelA.hotelMinPrice),
            selSorting
          );
      }
    });

    setListOfHotels([...newlist]);
  };

  const compareHotels = (a, b, selSorting) => {
    if (selSorting === "name" || selSorting === "price") {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    } else {
      return a - b;
    }
  };

  const getSortIcon = (val) => {
    return val === "asc" ? <CaretUpOutlined /> : <CaretDownOutlined />;
  };

  const onSearch = (val) => {
    applyFilters(val);
  };

  const applyFilters = (text) => {
    let visibleCount = 0;

    let data = listOfHotels.map((hotel) => {
      let isVisible = true;
      if (
        hotel.hotelName.toLowerCase().indexOf(text.toLowerCase()) === -1 &&
        hotel.addresses[0].address.toLowerCase().indexOf(text.toLowerCase()) ===
        -1
      ) {
        isVisible = false;
      }

      isVisible && visibleCount++;

      return { ...hotel, isVisible: isVisible };
    });
    data = data.filter((item) => item.isVisible);
    setListOfHotels(data);
  };


  return (
    <div className="sort-menu-15">
      <div className="hotel-sort-block sort-block main-sort-hotel">
        <Card>
          <div className="results-sort-block">
            <div className="flex-wrapper" style={{width:'100%'}}>
              <p className="sort-text">Sort by:</p>
              <Radio.Group onChange={handleChange} value={sorting} style={{display:'flex', width:'90%', justifyContent:'space-between'}}>
                <Radio value={"name"} onClick={handleClick}>
                  <span className="checkmark">
                    <div className="active-background">
                      <p className="price-type">
                        <span>
                          {sorting === "name" ? getSortIcon(sortDirection) : ""}
                        </span>
                        <i
                          className="fa fa-hospital-o cp-aria-cp"
                          aria-hidden="true"
                        ></i>
                        Name
                      </p>
                    </div>
                  </span>
                </Radio>
               
                <Radio value={"rating"} onClick={handleClick}>
                  <span className="checkmark">
                    <div className="active-background">
                      <p className="price-type">
                        <span>
                          {sorting === "rating"
                            ? getSortIcon(sortDirection)
                            : ""}
                        </span>
                        <i
                          className="fa fa-star-o cp-aria-cp"
                          aria-hidden="true"
                        ></i>
                        Rating
                      </p>
                    </div>
                  </span>
                </Radio>
                <Radio value={"price"} onClick={handleClick}>
                  <span className="checkmark">
                    <div className="active-background">
                      <p className="price-type">
                        <span>
                          {sorting === "price"
                            ? getSortIcon(sortDirection)
                            : ""}
                        </span>
                        <i
                          className="fa fa-inr cp-aria-cp"
                          aria-hidden="true"
                        ></i>
                        Price
                        
                      </p>
                      
                    </div>
                  </span>
                </Radio>
              </Radio.Group>
            </div>
            

              {agent && user?.Role?.RoleLevel === 3 ? (
                <div
                  className="netfareButton ml-1"
                  onClick={() => setShowNetFare(!showNetFare)}
                >
                  <Button> {showNetFare ? "Hide" : "Show"} Net Fare</Button>
                </div>
              ) : null}
            </div> 
        </Card>
      </div>
    </div>
  );
};

export default HotelSort;
