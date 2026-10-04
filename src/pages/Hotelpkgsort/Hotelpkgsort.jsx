import React, { useState, useEffect } from "react";
import { Card, Radio, Input, Select } from "antd";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import "./Hotelpkgsort.scss";

const { Option } = Select;
const Hotelpkgsort = () => {
  // const listOfHotels = props.data;
  // const { setListOfHotels } = props;
  // const [sorting, setSorting] = useState("price");
  // const [searchBy, setSearchBy] = useState("hotel");
  // const [sortDirection, setSortDirection] = useState("asc");
  // const handleChange = (e) => {
  //   const selSorting = e.target.value;
  //   setSorting(selSorting);
  //   setSortDirection("asc");
  //   sortHotels(selSorting, false);
  // };

  // const handleClick = (e) => {
  //   const selSorting = e.target.value;
  //   if (sorting === selSorting) {
  //     setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  //     sortHotels(selSorting, true);
  //   }
  // };

  // useEffect(() => {
  //   sortHotels("price", false);
  // }, []);

  // const sortHotels = (selSorting, isSameSortOption) => {
  //   let newlist = listOfHotels;
  //   newlist = isSameSortOption
  //     ? newlist.reverse()
  //     : newlist.sort((hotelA, hotelB) => {
  //         if (selSorting === "name") {
  //           return compareHotels(
  //             hotelA.hotelName,
  //             hotelB.hotelName,
  //             selSorting
  //           );
  //         } else if (selSorting === "rating") {
  //           const ratingA = hotelA.starRating;
  //           const ratingB = hotelB.starRating;
  //           return compareHotels(ratingA, ratingB, selSorting);
  //         } else if (selSorting === "price") {
  //           const priceA = hotelA.price;
  //           const priceB = hotelB.price;
  //           return compareHotels(priceA, priceB, selSorting);
  //         }
  //       });

  //   setListOfHotels([...newlist]);
  // };

  // const compareHotels = (a, b, selSorting) => {
  //   if (selSorting === "name" || selSorting === "price") {
  //     if (a < b) {
  //       return -1;
  //     }
  //     if (a > b) {
  //       return 1;
  //     }
  //     return 0;
  //   } else {
  //     return a - b;
  //   }
  // };

  const getSortIcon = (val) => {
    return val === "asc" ? <CaretUpOutlined /> : <CaretDownOutlined />;
  };

  // const onSearch = (val) => {
  //   applyFilters(val);
  // };

  // const applyFilters = (text) => {
  //   let visibleCount = 0;

  //   let data = listOfHotels.map((hotel) => {
  //     let isVisible = true;
  //     if (
  //       hotel.hotelName.toLowerCase().indexOf(text.toLowerCase()) === -1 &&
  //       hotel.addresses[0].address.toLowerCase().indexOf(text.toLowerCase()) ===
  //         -1
  //     ) {
  //       isVisible = false;
  //     }

  //     isVisible && visibleCount++;

  //     return { ...hotel, isVisible: isVisible };
  //   });
  //   data = data.filter((item) => item.isVisible);
  //   setListOfHotels(data);
  // };

  return (
    <div className="hotel-sort-block sort-block">
      <Card>
        <div className="results-sort-block">
          <div className="flex-wrapper">
            <p className="sort-text">Sort by:</p>
            <Radio.Group>
              <Radio value={"name"}>
                <span className="checkmark">
                  <div className="active-background">
                    <p className="price-type">
                      {/* <span>
                        {sorting === "name" ? getSortIcon(sortDirection) : ""}
                      </span> */}
                      Name
                    </p>
                  </div>
                </span>
              </Radio>
              <Radio value={"price"}>
                <span className="checkmark">
                  <div className="active-background">
                    <p className="price-type">
                      {/* <span>
                        {sorting === "price" ? getSortIcon(sortDirection) : ""}
                      </span> */}
                      Price
                    </p>
                    {/* <p className="total-fare-filter">
                    
                  </p> */}
                  </div>
                </span>
              </Radio>
              <Radio value={"rating"}>
                <span className="checkmark">
                  <div className="active-background">
                    <p className="price-type">
                      {/* <span>
                        {sorting === "rating" ? getSortIcon(sortDirection) : ""}
                      </span> */}
                      Rating
                    </p>
                  </div>
                </span>
              </Radio>
            </Radio.Group>
          </div>

          <Input.Group compact>
            <Select
              defaultValue="hotel"
              className="search-type-box"
              // onSelect={(val) => setSearchBy(val)}
            >
              <Option value="hotel">
                <i className="fa fa-building-o" aria-hidden="true"></i>
              </Option>

              <Option value="loc">
                <i className="fa fa-map-marker" aria-hidden="true"></i>
              </Option>
            </Select>

            <Select
            // showSearch
            // className="search-select-box"
            // placeholder={`Search By ${
            //   searchBy === "hotel" ? "Name" : "Location"
            // }`}
            // onSelect={onSearch}
            // allowClear={true}
            // onClear={() => onSearch("")}
            // filterOption={(input, option) =>
            //   option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
            // }
            >
              {/* {listOfHotels.map((hotel, i) => {
                return searchBy === "hotel" ? (
                  <Option key={"byName" + i} value={hotel.hotelName}>
                    <i className="fa fa-building-o" aria-hidden="true"></i>{" "}
                    {hotel.hotelName}
                  </Option>
                ) : (
                  <Option key={"byLoc" + i} value={hotel.addresses[0].address}>
                    <i className="fa fa-map-marker" aria-hidden="true"></i>{" "}
                    {hotel.addresses[0].address}
                  </Option>
                );
              })} */}
            </Select>
          </Input.Group>
        </div>
      </Card>
    </div>
  );
};

export default Hotelpkgsort;
