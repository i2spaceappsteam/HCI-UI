
import React, { useState, useEffect } from "react";
import "./Filter.scss";
import { Card, Checkbox, Collapse, Rate, Slider, Skeleton, Select, Input, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { selectCurrencySymbol } from "../../store/slices/currencySlice";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { Option } = Select;
const Filter = ({ count, data, setListOfHotels, isHotelSearchLoad, Loading }) => {
  const currencySymbol = useSelector(selectCurrencySymbol) || "₹";
  const [priceRange, setPriceRange] = useState([]);
  const [filters, setFilters] = useState({});
  const listOfHotels = data;
  const [resultCount, setResultCount] = useState(count);
  const [searchBy, setSearchBy] = useState("hotel");


  const filtersObj = {
    amenities: [],
    price: { minPrice: 0, maxPrice: 0, maxPriceRange: 0, minPriceRange: 0 },
    property: [],
    roomAmenities: [],
    rating: [],
    amendment: [],
    tdRating: [],
    hotelFacilities: [],
    addresses: [],
    categoryListess: []
  };


  const onChange = (event, filterType, filterId) => {
    let { checked } = event.target;
    setFilters({
      ...filters,
      [filterType]: filters[filterType].map((filt) =>
        filt.id == filterId ? { ...filt, isChecked: checked } : filt
      ),
    });
    scrollToListTop();
  };

  //Scroll to Top of the List
  const scrollToListTop = () => {
    document.getElementsByClassName("list-container")[0].scrollIntoView({
      behavior: "smooth",
    });
  };

  const checkIfExist = (filterTypeObj, id) =>
    filterTypeObj.filter((obj) => obj["id"] === id).length === 0;

  const setDynamicFilters = () => {
    for (let i = 0; i < listOfHotels.length; i++) {
      let HotelTotPrice = Math.floor(Number(listOfHotels[i].hotelMinPrice));

      if (i === 0) {
        filtersObj.price.minPrice = HotelTotPrice;
      }
      let minFare = HotelTotPrice;
      if (HotelTotPrice > filtersObj.price.maxPrice) {
        filtersObj.price.maxPrice = filtersObj.price.maxPriceRange =
          HotelTotPrice;
      }
      if (minFare < filtersObj.price.minPrice) {
        filtersObj.price.minPrice = minFare;
      }
      filtersObj.price.minPriceRange = filtersObj.price.minPrice;


      //Setting Properties Filters
      const { propertyName } = listOfHotels[i];
      checkIfExist(filtersObj.property, propertyName) &&
        filtersObj.property.push({
          id: propertyName,
          label: propertyName,
          isChecked: false,
        });

      //Setting Room Amenities Filters
      const { roomAmenities } = listOfHotels[i];
      if (roomAmenities && roomAmenities.length > 1) {
        roomAmenities.map((facility) => {
          checkIfExist(filtersObj.roomAmenities, facility) &&
            filtersObj.roomAmenities.push({
              id: facility,
              label: facility,
              isChecked: false,
            });
        });
      }

      //Setting address Filters
      const { addresses } = listOfHotels[i];
      if (addresses && addresses.length > 0) {
        addresses.map((add) => {
          checkIfExist(filtersObj.addresses, add.address) &&
            filtersObj.addresses.push({
              id: add.address,
              label: add.address,
              isChecked: false,
            });
        });
      }


      //Setting Hotel Facilities Filter
      const { hotelFacility } = listOfHotels[i];
      if (hotelFacility && hotelFacility.length > 1) {
        hotelFacility.map((facility) => {
          checkIfExist(filtersObj.hotelFacilities, facility) &&
            filtersObj.hotelFacilities.push({
              id: facility,
              label: facility,
              isChecked: false,
            });
        });
      }

      const { categoryList } = listOfHotels[i];
      if (categoryList && categoryList.length > 0) {
        categoryList.map((category) => {
          checkIfExist(filtersObj.categoryListess, category) &&
            filtersObj.categoryListess.push({
              id: category,
              label: category,
              isChecked: false,
            });
        });
      }


      const { isAmendmentAllowed } = listOfHotels[i];
      if (isAmendmentAllowed) {
        filtersObj.amendment[0] = {
          id: 1,
          label: "Allowed",
          isChecked: false,
        };
      } else {
        filtersObj.amendment[1] = {
          id: 0,
          label: "Not Allowed",
          isChecked: false,
        };
      }

      //Setting Star Rating Filters
      const { starRating } = listOfHotels[i];
      const adjustedStarRating = starRating === 0.0 ? 0 : starRating; // Use a new variable

      if (adjustedStarRating) {
        checkIfExist(filtersObj.rating, adjustedStarRating) &&
          filtersObj.rating.push({
            id: adjustedStarRating,
            label: `${adjustedStarRating} Star`,
            isChecked: false,
          });
      }

      const { tripAdvisorRating } = listOfHotels[i];
      if (tripAdvisorRating)
        checkIfExist(filtersObj.tdRating, tripAdvisorRating) &&
          filtersObj.tdRating.push({
            id: tripAdvisorRating,
            label: `${tripAdvisorRating}`,
            isChecked: false,
          });
    }

    //Sort the Rating Filter
    filtersObj.rating.sort((a, b) => b.id - a.id);

    setFilters(filtersObj);
    setPriceRange([filtersObj.price.minPrice, filtersObj.price.maxPrice]);
  };

  const checkedFilters = (filterType) => {
    return filters[filterType].filter((filter) => filter.isChecked);
  };

  const applyFilters = () => {
    let visibleCount = 0;
    const propertyChecked = checkedFilters("property");
    const amendment = checkedFilters("amendment");
    const ratingChecked = checkedFilters("rating");
    const tdRatingChecked = checkedFilters("tdRating");
    const hotelFacilityChecked = checkedFilters("hotelFacilities");
    const addressesChecked = checkedFilters("addresses");
    const categoryListChecked = checkedFilters("categoryListess");



    let data = listOfHotels
      .map((hotel) => {
        let isVisible = true;
        const startingFare = Math.floor(Number(hotel.hotelMinPrice));
        if (
          !(
            startingFare >= filters.price.minPrice &&
            startingFare <= filters.price.maxPrice
          )
        ) {
          isVisible = false;
        }



        if (
          propertyChecked.length &&
          !propertyChecked.map((prop) => prop.id).includes(hotel.propertyName)
        ) {
          isVisible = false;
        }

        let id = hotel.isAmendmentAllowed ? 1 : 0;
        if (
          amendment.length &&
          !amendment.map((prop) => prop.id).includes(id)
        ) {
          isVisible = false;
        }

        if (
          ratingChecked.length &&
          !ratingChecked.map((ratg) => ratg.id).includes(hotel.starRating)
        ) {
          isVisible = false;
        }

        if (
          addressesChecked.length &&
          !addressesChecked.map((f) => f.id).some(item => hotel?.addresses?.map(add => add.address)?.includes(item))
        ) {
          isVisible = false;
        }

        if (
          hotelFacilityChecked.length &&
          !hotelFacilityChecked.map((f) => f.id).some(item => hotel?.hotelFacility?.includes(item))
        ) {
          isVisible = false;
        }

        if (
          categoryListChecked.length &&
          !categoryListChecked.map((f) => f.id).some(item => hotel?.categoryList?.includes(item))
        ) {
          isVisible = false;
        }

        if (
          tdRatingChecked.length &&
          !tdRatingChecked
            .map((ratg) => ratg.id)
            .includes(hotel.tripAdvisorRating)
        ) {
          isVisible = false;
        }

        isVisible && visibleCount++;

        return { ...hotel, isVisible: isVisible };
      })
      .filter((item) => item.isVisible);

    setListOfHotels(data);
    setResultCount(visibleCount);
  };

  useEffect(() => {
    setDynamicFilters();
  }, [count, isHotelSearchLoad]);

  useEffect(() => {
    if (!isHotelSearchLoad) {
      Object.keys(filters).length && applyFilters();
    }
  }, [filters, isHotelSearchLoad]);

  const handleClear = (filterType) => {
    let initFilterType;
    if (filterType === "price") {
      initFilterType = {
        ...filters[filterType],
        minPrice: filters.price.minPriceRange,
        maxPrice: filters.price.maxPriceRange,
      };
      setPriceRange([filters.price.minPriceRange, filters.price.maxPriceRange]);
    } else {
      initFilterType = filters[filterType]?.map((filt) => ({
        ...filt,
        isChecked: false,
      }));
    }
    setFilters({
      ...filters,
      [filterType]: initFilterType,
    });
    scrollToListTop();
  };

  const extraPanel = (filterType) => (
    <span
      onClick={(e) => {
        e.stopPropagation();
        handleClear(filterType);
      }}
    >
      Clear
    </span>
  );
  const priceChangeCompleteHandler = (priceVal) => {
    setFilters({
      ...filters,
      price: { ...filters.price, minPrice: priceVal[0], maxPrice: priceVal[1] },
    });
  };
  const priceChangeHandler = (price) => {
    setPriceRange(price);
  };

  function getCount(key, val) {
    switch (key) {

      case "tripRating":
        return listOfHotels.filter((item) => item.tripAdvisorRating === val)
          .length;
      case "starRating":
        return listOfHotels.filter((item) => item.starRating === val).length;
      case "amendment":
        val = val === 1 ? true : false;
        return listOfHotels.filter((item) => item.isAmendmentAllowed === val)
          .length;
      default:
        return 0;
    }
  }

  const onSearch = (val) => {
    applyFilterss(val);
  };

  const applyFilterss = (text) => {
    let visibleCount = 0;

    let data = listOfHotels.map((hotel) => {
      let isVisible = true;
      if (
        hotel?.hotelName?.toLowerCase()?.indexOf(text?.toLowerCase()) === -1
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
    <>
      <div className="side-bar e-hide">
        <div className="filter-elements">
          <div className="filter-top-bar">
            <span className="results-count">{resultCount} results</span>
            <br />
            <br />
            <span>FILTERS</span>
            <span className="clearall">Clear all</span>
          </div>
        </div>
      </div>

      <div>
        <Card>
          <div className="flight-filters slider-icon-1" style={{ padding: 14, background: 'white', borderRadius: 10 }}>
            <div className="flight-result-indicator">
              {isHotelSearchLoad ? (
                <Skeleton paragraph={{ rows: 0 }} active />
              ) : (
                <p>
                  {Loading ? "Fetching All Hotels For You" : `SHOWING  ${resultCount} HOTELS`}
                  {/* SHOWING {resultCount} HOTELS */}
                </p>
              )}
            </div>

            <div className="overall-filter-container">
              <div className="overall-filter-header">
                <p className="filter-text">FILTERS</p>
                <p className="clear-text" onClick={setDynamicFilters}>
                  Clear all
                </p>
              </div>


              <div className="overall-filter-container">
                <div className="stops-filter star-filters">
                  <div className="overall-filter-body">
                    <Collapse
                      defaultActiveKey={["1"]}
                      expandIconPosition={"right"}
                    >
                      <Panel className="hotel-name-panel" header="HOTEL NAME" key="1" extra={extraPanel("hotel name")}>
                        <div className="flex-wrapper">
                          <Input.Group className="hotel-name-search-input" >
                            <Select
                              style={{ border: "1px solid transparent", width: "100%", height: "36px", marginTop: "0%" }}
                              showSearch
                              className="search-select-box"
                              placeholder={`Search By ${searchBy === "hotel" ? "Name" : "Location"
                                }`}
                              onSelect={onSearch}
                              allowClear={true}
                              onClear={() => onSearch("")}
                              filterOption={(input, option) =>
                                option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {listOfHotels.map((hotel, i) => {
                                return searchBy === "hotel" ? (

                                  <Option className="search-select-hotel-name-option" key={"byName" + i} value={hotel.hotelName}>
                                    <Tooltip placement="rightTop" title={hotel.hotelName} >
                                      <div className="hotel-filter-name-details-displayname">   <i className="fa fa-building-o" aria-hidden="true"></i>  {" "} {hotel.hotelName}</div>
                                    </Tooltip>
                                  </Option>) : null
                              })}

                            </Select>
                          </Input.Group>


                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                </div>
              </div>
              <div className="overall-filter-body">
                <div className="stops-filter">
                  <Collapse
                    defaultActiveKey={["1"]}
                    expandIconPosition={"right"}
                  >
                    <Panel header="PRICE" key="1" extra={extraPanel("price")}>
                      {isHotelSearchLoad ? (
                        <Skeleton paragraph={{ rows: 0 }} active />
                      ) : (
                        <>
                          {filters.price && (
                            <Slider
                              range
                              step={1}
                              defaultValue={[
                                filters.price.minPrice,
                                filters.price.maxPrice,
                              ]}
                              value={priceRange}
                              min={filters.price.minPriceRange}
                              max={filters.price.maxPriceRange}
                              onChange={priceChangeHandler}
                              onAfterChange={priceChangeCompleteHandler}
                            />
                          )}
                          <div className="price-range-display">
                            <span className="price-badge">{currencySymbol} {priceRange[0]?.toLocaleString() || 0}</span>
                            <span className="price-sep">to</span>
                            <span className="price-badge">{currencySymbol} {priceRange[1]?.toLocaleString() || 0}</span>
                          </div>
                        </>
                      )}
                    </Panel>
                  </Collapse>
                </div>


                <div className="stops-filter star-filters">
                  <Collapse
                    defaultActiveKey={["1"]}
                    expandIconPosition={"right"}
                  >
                    <Panel
                      header={"STAR RATING"}
                      key="1"
                      extra={extraPanel("rating")}
                    >
                      {filters.rating &&
                        filters.rating.map((ratg) => (
                          <p key={ratg.id}>
                            <Checkbox
                              id={`rating_${ratg.id}`}
                              checked={ratg.isChecked}
                              onChange={(e) => onChange(e, "rating", ratg.id)}
                            >
                              {/* {ratg.label} */}
                              <Rate
                                className="starRating"
                                disabled
                                value={Number(ratg.id)}
                                allowHalf={true}
                              />
                              <span className="count">
                                ({getCount("starRating", ratg.id)})
                              </span>
                            </Checkbox>
                          </p>
                        ))}
                    </Panel>
                  </Collapse>
                </div>


                <div className="stops-filter star-filters">
                  <Collapse
                    defaultActiveKey={["1"]}
                    expandIconPosition={"right"}
                  >
                    <Panel
                      header={"AMENDMENT"}
                      key="1"
                      extra={extraPanel("amendment")}
                    >
                      {filters.amendment &&
                        filters.amendment.map((ratg) => (
                          <p key={ratg.id + "ratg"}>
                            <Checkbox
                              id={`amendment_${ratg.id}`}
                              checked={ratg.isChecked}
                              onChange={(e) =>
                                onChange(e, "amendment", ratg.id)
                              }
                            >
                              {ratg.label}
                              <span className="count">
                                ({getCount("amendment", ratg.id)})
                              </span>
                            </Checkbox>
                          </p>
                        ))}
                    </Panel>
                  </Collapse>
                </div>


                {
                  filters?.categoryListess?.length > 0 && (
                    <div className="stops-filter star-filters">
                      <Collapse
                        defaultActiveKey={["1"]}
                        expandIconPosition={"right"}
                        className="customscroll"
                      >
                        <Panel
                          header={"PROPERTY TYPE"}
                          key="1"
                          extra={extraPanel("categoryListess")}
                        >
                          {filters?.categoryListess &&
                            filters.categoryListess.map((category) => (
                              <p key={category.id}>
                                <Checkbox
                                  id={`categoryListess_${category.id}`}
                                  checked={category.isChecked}
                                  onChange={(e) => onChange(e, "categoryListess", category.id)}
                                >
                                  {category.label}
                                </Checkbox>
                              </p>
                            ))}
                        </Panel>
                      </Collapse>
                    </div>

                  )
                }

                {
                  filters?.hotelFacilities?.length > 0 && (
                  <div className="stops-filter star-filters">
                      <Collapse
                        defaultActiveKey={["1"]}
                        expandIconPosition={"right"}
                        className="customscroll"
                      >
                        <Panel
                          header={"HOTEL FACILITY"}
                          key="1"
                          extra={extraPanel("hotelFacilities")}
                        >
                          <div style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
                            {filters?.hotelFacilities &&
                              filters.hotelFacilities.map((facility) => (
                                <p key={facility.id}>
                                  <Checkbox
                                    id={`hotelFacility_${facility.id}`}
                                    checked={facility.isChecked}
                                    onChange={(e) => onChange(e, "hotelFacilities", facility.id)}
                                  >
                                    {facility.label}
                                  </Checkbox>
                                </p>
                              ))}
                          </div>
                        </Panel>
                      </Collapse>
                    </div>

                  )
                }

                {filters.tdRating && filters?.tdRating?.length > 0 ? (
                  <div className="stops-filter tripAd-filters">
                    <Collapse
                      defaultActiveKey={["1"]}
                      expandIconPosition={"right"}
                    >
                      <Panel
                        header={
                          <span>
                            <i
                              className="fa fa-tripadvisor"
                              aria-hidden="true"
                            ></i>{" "}
                            TripAdvisor Rating
                          </span>
                        }
                        key="1"
                        extra={extraPanel("tdRating")}
                      >
                        {filters.tdRating.map((ratg) => (
                          <p>
                            <Checkbox
                              checked={ratg.isChecked}
                              onChange={(e) => onChange(e, "tdRating", ratg.id)}
                            >
                              <Rate
                                className="tripRating"
                                disabled
                                character={
                                  <i
                                    className="fa fa-circle"
                                    aria-hidden="true"
                                  ></i>
                                }
                                value={Number(ratg.id)}
                                allowHalf={true}
                              />
                              <span className="count">
                                ({getCount("tripRating", ratg.id)})
                              </span>
                            </Checkbox>
                          </p>
                        ))}
                      </Panel>
                    </Collapse>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Card >
      </div >
    </>
  );
};

export default Filter;

