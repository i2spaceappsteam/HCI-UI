import { message, Popover, Tooltip } from "antd";
import React, { useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "../HotelPassengers/HotelPassengers.scss";

const HotelPassengers = ({ pax, index, updatePaxInfoFromChild, paxInfo }) => {
  const [childAgeErrors, setChildAgeErrors] = useState([]); 

  const agesList = Array.from({ length: 13 }, (_, i) => ({ id: i.toString(), childYear: i }));

 
  const validateChildAges = (paxObj) => {
    const errors = paxObj.childAge.map((age) => (age === null || age === undefined ? "Age needed" : ""));
    setChildAgeErrors(errors);
    return errors.every((error) => error === ""); 
  };


  const onRemoveRoom = (i) => {
    paxInfo.splice(i, 1);
    updatePaxInfoFromChild(paxInfo);
  };

 
  const onIncreaseAdultCount = (paxObj) => {
    if (paxObj.noOfAdults < 4) {
      paxObj.noOfAdults += 1;
      updatePaxInfoFromChild(paxInfo);
    } else {
      message.error("Maximum 4 adults allowed");
    }
  };

  const onDecreaseAdultCount = (paxObj) => {
    if (paxObj.noOfAdults > 1) {
      paxObj.noOfAdults -= 1;
      updatePaxInfoFromChild(paxInfo);
    } else {
      message.error("At least 1 adult is required.");
    }
  };

  
  const onIncreaseChildCount = (paxObj) => {
    if (paxObj.noOfChilds < 4) {
      paxObj.noOfChilds += 1;
      paxObj.childAge.push(null); 
      setChildAgeErrors([...childAgeErrors, "Age needed"]);
      updatePaxInfoFromChild(paxInfo);
    } else {
      message.error("Maximum 4 children allowed.");
    }
  };

  const onDecreaseChildCount = (paxObj) => {
    if (paxObj.noOfChilds > 0) {
      paxObj.noOfChilds -= 1;
      paxObj.childAge.pop();
      childAgeErrors.pop();
      updatePaxInfoFromChild(paxInfo);
    }
  };

 
  const selectChildAge = (paxIndex, e, paxObj) => {
    const selectedAge = e.target.value;
    paxObj.childAge[paxIndex] = selectedAge;
    childAgeErrors[paxIndex] = selectedAge ? "" : "Age needed";
    setChildAgeErrors([...childAgeErrors]);
    updatePaxInfoFromChild(paxInfo);
  };

  return (
    <div key={"room" + index} className="hotel-pax-box">
      <li>
        <ul className="child-item">
          <li>
            <div className="lists-wrapper">
              <p className="roomtitle">Room {index + 1}</p>
              <p className="remove-btn" onClick={() => onRemoveRoom(index)}>
                Remove
              </p>
            </div>
          </li>
          {/* Adult Count */}
          <li>
            <div className="lists-wrapper">
              <div className="pax-label">
                <p>Adults</p>
                <span>Above 12 years</span>
              </div>
              <div className="pax-count">
                <i className="fa fa-minus" onClick={() => onDecreaseAdultCount(pax)}></i>
                <span>{pax.noOfAdults}</span>
                <i className="fa fa-plus" onClick={() => onIncreaseAdultCount(pax)}></i>
              </div>
            </div>
          </li>
          {/* Child Count */}
          <li>
            <div className="lists-wrapper">
              <div className="pax-label">
                <p>Children</p>
                <span>Below 12 years</span>
              </div>
              <div className="pax-count">
                <i className="fa fa-minus" onClick={() => onDecreaseChildCount(pax)}></i>
                <span>{pax.noOfChilds}</span>
                <i className="fa fa-plus" onClick={() => onIncreaseChildCount(pax)}></i>
              </div>
            </div>
            {/* Child Ages */}
            {pax.childAge.length >= 0 && (
              <div className="ages-select">
                <p className="agetitle">
                  {pax.noOfChilds > 1 ? "Children's" : "Child's"} Age{" "}
                  <Popover
                    overlayClassName="pricepopup"
                    placement="left"
                    content={
                      <div>
                        <p>
                          To find a place to stay that fits your group and shows correct pricing,
                          we need to know how old your children will be at check-out.
                        </p>
                      </div>
                    }
                    title="Why Age Needed?"
                  >
                    <QuestionCircleOutlined style={{ color: "#0f76bb" }} />
                  </Popover>
                </p>
                {pax.childAge.map((_, childIndex) => (
                  <select
                    key={childIndex}
                    value={pax.childAge[childIndex] || ""}
                    onChange={(e) => selectChildAge(childIndex, e, pax)}
                    style={{
                      borderColor: childAgeErrors[childIndex] ? "red" : "",
                    }}
                  >
                    <option value="">Age needed</option>
                    {agesList.map((ageObj) => (
                      <option key={ageObj.id} value={ageObj.childYear}>
                        {ageObj.id}
                      </option>
                    ))}
                  </select>
                ))}
                {childAgeErrors.some((error) => error) && (
                  <p style={{ color: "red" }}>Please select all children's ages.</p>
                )}
              </div>
            )}
          </li>
        </ul>
      </li>
    </div>
  );
};

export default HotelPassengers;
