import React, { useState } from "react";
import { Button, Card, Checkbox, Form, Spin, Modal } from "antd";
import "./HotelCheckout.scss";
import { useLocation } from "react-router";
import { LoadingOutlined } from "@ant-design/icons";

import { useSelector } from "react-redux";
import { selectIsAgent } from "../../store/slices/authSlice";

const HotelBookPayCard = (props) => {
  const user = useSelector((state) => state.auth.user);
  const agent = useSelector(selectIsAgent);
  const [form] = Form.useForm();
  const [clickType, setClickType] = useState(1);
  const location = useLocation();
  const goTo = () => {
    if (props.bookpaycardinfo === "hotel-review") {
      props.processPayGateway(clickType);
    } else if (props.bookpaycardinfo === "hotel-checkout") {
      props.redirectToPreview();
    }
  };

  const antIcon = (
    <LoadingOutlined style={{ fontSize: 24, color: "#ff7b54", background: "#ff7b54" }} spin />
  );

  return (

    <div className="ht-check">
      <Form form={form} onFinish={goTo}>
        {props.bookpaycardinfo === "hotel-checkout" ? (
          <div className="book-pay-tc">
            <Form.Item
              name="remember"
              rules={[
                {
                  validator: (rule, value) => {
                    return value
                      ? Promise.resolve()
                      : Promise.reject("Accept Terms & Conditions");
                  },
                },
              ]}
              valuePropName="checked"
            >
              <Checkbox style={{ border: "#ff3e3e" }}>
                I Agree To All The{" "}
                <a
                  href="/termsofconditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#003b95" }}
                >
                  {" Terms & Conditions"}{" "}
                </a>{" "}
                and{" "}
                <a
                  href="/privacypolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#003b95" }}
                >
                  {" "}
                  Privacy Policy.
                </a>
              </Checkbox>
            </Form.Item>
          </div>
        ) : null}
        <div className=" d-flex flex-wrap" style={{ justifyContent: "center", display: "flex" }}>
          {props?.bookpaycardinfo === "hotel-review" && props.isHoldAllowed && (
            <div className="book-pay-btn mr-2 mb-1 mt-1">
              <Button
                className="btn-book btn-md"
                htmlType={!user ? "button" : "submit"}
                onClick={() => {
                  setClickType(2);
                  if (!user) {
                     // trigger login modal if needed
                  }
                }}
                style={{ background: props.holdLoading ? "#ffa80a" : "linear-gradient(to right, #28a745, #218838)", border: "none", color: "#fff", marginRight: "10px" }}
                loading={props.holdLoading}
              >
                Hold Booking
              </Button>
            </div>
          )}

          <div className="book-pay-btn mr-2 mb-1 mt-1">
            <Button
              className="btn-book btn-md"
              htmlType={!user ? "button" : "submit"}
              onClick={() => {
                setClickType(1);
                // if (!user) setModalVisible({ visible: true, type: "USER" });
              }}
              style={{ background: props.loadingSpin ? "#ffa80a" : "linear-gradient(to right, #0370a9, #08acda)", border: "none", color: "#fff" }}
              loading={props.loadingSpin}
            >
              {props?.holdLoading ? "" : props?.bookpaycardinfo === "hotel-checkout" ? (
                "Proceed to Review"
              ) : props?.bookpaycardinfo === "hotel-review" ? (
                "Pay and Book"
              ) : ""}
            </Button>
          </div>

        </div>
      </Form>

    </div>
  );
};

export default HotelBookPayCard;
