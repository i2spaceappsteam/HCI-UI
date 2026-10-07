import React, { useState } from "react";
import { message, Popover } from "antd";
import { QuestionCircleOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import "./HotelPassengers.scss";

const HotelPassengers = ({ pax, index, updatePaxInfoFromChild, paxInfo }) => {
  const [childAgeErrors, setChildAgeErrors] = useState([]);

  const agesList = Array.from({ length: 13 }, (_, i) => ({ id: i.toString(), childYear: i }));

  const onIncreaseAdultCount = () => {
    if (pax.noOfAdults < 4) {
      pax.noOfAdults += 1;
      updatePaxInfoFromChild([...paxInfo]);
    } else {
      message.warning("Maximum 4 adults allowed per room");
    }
  };

  const onDecreaseAdultCount = () => {
    if (pax.noOfAdults > 1) {
      pax.noOfAdults -= 1;
      updatePaxInfoFromChild([...paxInfo]);
    } else {
      message.warning("At least 1 adult is required per room.");
    }
  };

  const onIncreaseChildCount = () => {
    if (pax.noOfChilds < 4) {
      pax.noOfChilds += 1;
      pax.childAge.push(null);
      setChildAgeErrors([...childAgeErrors, "Age needed"]);
      updatePaxInfoFromChild([...paxInfo]);
    } else {
      message.warning("Maximum 4 children allowed per room.");
    }
  };

  const onDecreaseChildCount = () => {
    if (pax.noOfChilds > 0) {
      pax.noOfChilds -= 1;
      pax.childAge.pop();
      childAgeErrors.pop();
      setChildAgeErrors([...childAgeErrors]);
      updatePaxInfoFromChild([...paxInfo]);
    }
  };

  const selectChildAge = (childIndex, e) => {
    const selectedAge = e.target.value;
    pax.childAge[childIndex] = selectedAge;
    const newErrors = [...childAgeErrors];
    newErrors[childIndex] = selectedAge ? "" : "Age needed";
    setChildAgeErrors(newErrors);
    updatePaxInfoFromChild([...paxInfo]);
  };

  return (
    <div key={"room-" + index} className="hotel-pax-box">
      {/* Adult Count Row */}
      <div className="pax-row">
        <div className="pax-label">
          <div className="pax-title">Adults</div>
          <div className="pax-sub">Above 12 years</div>
        </div>
        <div className="pax-counter">
          <button
            type="button"
            className={`counter-btn ${pax.noOfAdults <= 1 ? "disabled" : ""}`}
            onClick={onDecreaseAdultCount}
            disabled={pax.noOfAdults <= 1}
          >
            <MinusOutlined />
          </button>
          <span className="counter-val">{pax.noOfAdults}</span>
          <button
            type="button"
            className={`counter-btn ${pax.noOfAdults >= 4 ? "disabled" : ""}`}
            onClick={onIncreaseAdultCount}
            disabled={pax.noOfAdults >= 4}
          >
            <PlusOutlined />
          </button>
        </div>
      </div>

      {/* Child Count Row */}
      <div className="pax-row">
        <div className="pax-label">
          <div className="pax-title">Children</div>
          <div className="pax-sub">0 - 12 years</div>
        </div>
        <div className="pax-counter">
          <button
            type="button"
            className={`counter-btn ${pax.noOfChilds <= 0 ? "disabled" : ""}`}
            onClick={onDecreaseChildCount}
            disabled={pax.noOfChilds <= 0}
          >
            <MinusOutlined />
          </button>
          <span className="counter-val">{pax.noOfChilds}</span>
          <button
            type="button"
            className={`counter-btn ${pax.noOfChilds >= 4 ? "disabled" : ""}`}
            onClick={onIncreaseChildCount}
            disabled={pax.noOfChilds >= 4}
          >
            <PlusOutlined />
          </button>
        </div>
      </div>

      {/* Child Ages Dropdowns */}
      {pax.noOfChilds > 0 && (
        <div className="child-ages-section">
          <div className="child-age-header">
            <span>{pax.noOfChilds > 1 ? "Children's Ages" : "Child's Age"}</span>
            <Popover
              overlayClassName="pricepopup"
              placement="topLeft"
              content={
                <div style={{ maxWidth: "220px", fontSize: "12px", color: "#475569" }}>
                  To find the best room and accurate rates, hotel policies require the age of each child at check-in.
                </div>
              }
              title={<span style={{ fontSize: "13px", fontWeight: 600 }}>Why age is needed</span>}
            >
              <QuestionCircleOutlined className="info-icon" />
            </Popover>
          </div>
          <div className="child-ages-grid">
            {pax.childAge.map((age, childIdx) => (
              <div key={childIdx} className="child-age-item">
                <span className="child-tag">Child {childIdx + 1}</span>
                <select
                  value={age ?? ""}
                  onChange={(e) => selectChildAge(childIdx, e)}
                  className={`child-age-select ${childAgeErrors[childIdx] ? "has-error" : ""}`}
                >
                  <option value="">Age</option>
                  {agesList.map((item) => (
                    <option key={item.id} value={item.childYear}>
                      {item.childYear === 0 ? "< 1 yr" : `${item.childYear} yrs`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {childAgeErrors.some((err) => err) && (
            <span className="error-hint">Please select all child ages.</span>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelPassengers;
