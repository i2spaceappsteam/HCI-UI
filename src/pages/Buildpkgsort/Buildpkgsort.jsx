import React, { useState, useEffect } from "react";
import { Card, Radio, Input, Select } from "antd";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import "./Buildpkgsort.scss";

const { Option } = Select;
const Buildpkgsort = () => {
  
  const getSortIcon = (val) => {
    return val === "asc" ? <CaretUpOutlined /> : <CaretDownOutlined />;
  };

  

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
            
            >
              
            </Select>
          </Input.Group>
        </div>
      </Card>
    </div>
  );
};

export default Buildpkgsort;
