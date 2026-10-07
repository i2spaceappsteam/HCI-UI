
import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Popover,
  Radio,
  message,
  Modal,
  Collapse,
  InputNumber
} from "antd";
import "./HotelFairBox.scss";
import GlobalStatesContext from "../../Providers/GlobalStatesContext";
import { useSelector } from "react-redux";
import { selectIsAgent, selectUser } from "../../store/slices/authSlice";
import {
  QuestionCircleOutlined,
  CloseOutlined,
  EditOutlined,
  FileTextOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";

export const getPromoDiscount = (promoData, total) => {
  let promoAmount = 0;

  if (promoData && promoData?.status) {
    if (promoData.DiscountType === 1) {
      promoAmount = Number((total / 100) * promoData.Discount);
    } else {
      promoAmount = Number(promoData.Discount);
    }
  }

  return Number(promoAmount);
};

export const getHotelGrandTotal = (hotelDetailsObj, hotelSearchData, ConvFee, promoData, selectedInsuranceData, redeemAmount, agentTax
) => {
  let totalRoomBaseFare = 0;
  let totalRoomTax = 0;
  let totalOtherCharges = 0;
  let totalExtraGuestCharges = 0;
  let noOfNights = 0;
  let convamount = 0;
  let promoDiscount = 0;
  let noOfRooms = 0;
  let adminCommission = 0;
  let agentMarkup = 0;
  let markup = 0;
  let insuranceTotal = 0;
  let totalCommission = 0;
  let redeemTotal = 0;
  let hotelDiscount = 0;
  let roomDetails = {
    roomCount: 0,
    roomNightPrice: 0,
    totalTax: 0,
    total: 0

  };

  if (Object.keys(hotelSearchData).length > 0) {
    let checkin = new Date(hotelSearchData.checkInDate);
    let checkout = new Date(hotelSearchData.checkOutDate);
    let diffTime = checkout - checkin;
    let diffDays = Math.ceil(diffTime / (1000 * 24 * 60 * 60));

    noOfNights = Number(diffDays);
  } else return;

  if (hotelDetailsObj?.combineRoom?.length > 0) {
    noOfRooms = hotelDetailsObj?.combineRoom[0]?.combineRooms.length;
    hotelDetailsObj?.combineRoom.forEach((roomDetail) => {
      if (roomDetail?.priceDetails) {
        const priceObj = roomDetail?.priceDetails;

        totalRoomBaseFare += Number(priceObj.base);
        totalRoomTax += Number(priceObj.tax);
        totalOtherCharges += Number(priceObj.otherCharges);
        totalExtraGuestCharges += Number(priceObj?.extraGuestCharges ?? 0);
        agentMarkup += Number(priceObj?.agentMarkup ?? 0);
        adminCommission += Number(priceObj?.adminCommission ?? 0);
        markup += Number(priceObj?.markup ?? 0);
        totalCommission += Number(roomDetail?.commission ?? 0);
        hotelDiscount += Number(priceObj?.discount ?? 0);
      }
    });
  }

  let grandBaseFare = Number(totalRoomBaseFare);
  let grandTax = Number(totalRoomTax);
  let grandOtherCharges = Number(totalOtherCharges);
  let grandExtraGuestCharges = Number(totalExtraGuestCharges);
  let grandHotelDiscount = Number(hotelDiscount);

  let totalTax = Number(grandTax) + Number(grandOtherCharges) + Number(agentTax);

  roomDetails = {
    roomCount: noOfRooms,
    roomNightPrice: grandBaseFare,
    totalTax: totalTax,
    tax: grandTax,
    otherCharges: grandOtherCharges,
    extraGuestCharges: grandExtraGuestCharges,
    totalHotelDiscount: grandHotelDiscount,
  };

  let total = hotelDetailsObj?.combineRoom[0]?.price




  if (ConvFee) {
    if (ConvFee.type === 1) {
      convamount = Number(ConvFee.amount);
    } else {
      convamount = Number((total / 100) * Number(ConvFee.amount));
    }
  }



  if (
    selectedInsuranceData?.status === 1 &&
    selectedInsuranceData?.serviceType === 2
  ) {
    let totalPax = hotelSearchData.roomGuests.reduce(
      (acc, cur) => acc + Number(cur.noOfAdults) + Number(cur.noOfChilds),
      0
    );

    insuranceTotal = totalPax * Number(selectedInsuranceData.amount);
  }
  promoDiscount = getPromoDiscount(promoData, total);

  let totalAmount = Number(total) + Number(convamount) + Number(insuranceTotal) + Number(agentTax);
  totalAmount = Number(totalAmount) - Number(promoDiscount);

  if (redeemAmount?.CouponAmt) {
    redeemTotal = Number(redeemAmount?.CouponAmt);
  }
  totalAmount -= redeemTotal;
  return {
    roomDetails,
    noOfNights,
    promoDiscount,
    totalAmount: Number(totalAmount).toFixed(2),
    convamount,
    totalCommission,
    adminCommission,
    agentMarkup,
    markup,
    insuranceTotal: Number(insuranceTotal).toFixed(2),
    redeemTotal: redeemTotal,
    agentTax: Number(agentTax)
  };
};
const HotelFairBox = ({ hotelDetailsObj, hotelSearchData, isPromoVisible, location, onAgentTaxChange,
  agentTax = 0,
  isEditable }) => {
  const [form] = Form.useForm();
  let dateFormat = "YYYY-MM-DD";
  const agent = useSelector(selectIsAgent);
  const user = useSelector(selectUser);
  const {
    state: {
      otherData: { ConvFee, promoData, selectedInsuranceData, redeemAmount },
    },
    AddConvFee,
    validatePromoCode,
    RemovePromo,
    getInsuranceByServiceType,
    validateRedeemCoupon,
    RemoveRedeemCoupon,
  } = useContext(GlobalStatesContext);

  const [promoCode, setPromoCode] = useState([]);
  const [redeemData, setRedeemData] = useState({});
  const [showTaxEditModal, setShowTaxEditModal] = useState(false);
  const [tempAgentTax, setTempAgentTax] = useState(0);
  const {
    roomDetails,
    noOfNights,
    promoDiscount,
    totalAmount,
    convamount,
    insuranceTotal,
    totalCommission,
    redeemTotal,
  } = getHotelGrandTotal(
    hotelDetailsObj,
    hotelSearchData,
    ConvFee,
    promoData,
    selectedInsuranceData,
    redeemAmount,
    agentTax
  );


  const muAgent = Number(hotelDetailsObj.combineRoom[0].agentMarkup) || 0

  const Netfare = totalAmount - totalCommission - muAgent


  // console.log(hotelDetailsObj)
  useEffect(() => {

    if (hotelDetailsObj?.country) {


      const isDomestic = hotelDetailsObj.country === "IN";

      if (agent) {
        if (isDomestic) {

          AddConvFee(2, "Domestic");
        } else {

          AddConvFee(2, "International");
        }
      }

      if (!agent) {
        // AddConvFee(2); 
        // getpromo();
      }
    }
  }, [agent, hotelDetailsObj]); // Added hotelDetailsObj to dependency array
  // useEffect(() => {
  //   getInsuranceByServiceType(2);
  // }, []);

  // const getpromo = () => {
  //   ApiClient.get("admin/promo")
  //     .then((res) => {
  //       if (res.status === 200) {
  //         let data = res.data.filter((item) =>
  //           moment(item.ValidTill, dateFormat).isSameOrAfter(moment(), 'day')
  //         );
  //         if (data.length > 0) {
  //           let busPromo = data.filter(
  //             (promo) =>
  //               promo.ServiceType === 2 &&
  //               (promo.ApplicationType === 1 || promo.ApplicationType === 3)
  //           );

  //           setPromoCode(busPromo);
  //         }
  //       }
  //     })
  //     .catch((error) => {
  //       setPromoCode([]);

  //       console.error(error);
  //     });
  // };
  const [Loc, setLoc] = useState({});
  useEffect(() => {
    if (location) {
      setLoc(location);
    }
  }, [location]);

  const [selectedPromoCode, setSelectedPromoCode] = useState(null); // Track the selected promo code

  const handleApply = (code) => {

    setSelectedPromoCode(code);
    form.setFieldsValue({
      promo: code,
    });
    form.submit();

  };
  const roomFare = () => {
    return (
      <div className="pax-count-acc-body">
        <p>({`${roomDetails.roomCount} Rooms x ${noOfNights} Nights`})</p>
        <p>
          {"₹"} {Number(hotelDetailsObj?.combineRoom[0]?.priceDetails?.totalBasePrice || 0).toFixed(2)}{" "}
        </p>
      </div>
    );
  };
  const taxEditContent = (
    <div style={{ padding: '16px', minWidth: '300px' }}>
      <Form
        layout="vertical"
        onFinish={(values) => {
          if (onAgentTaxChange) {
            onAgentTaxChange(Number(values.agentTax));
          }
          setShowTaxEditModal(false);
          message.success('Tax amount updated successfully');
        }}
        initialValues={{ agentTax: agentTax }}
      >
        <Form.Item
          label="Agent Tax Amount"
          name="agentTax"
          rules={[
            { required: true, message: 'Please enter tax amount' },
            {
              validator: (_, value) => {
                if (value >= 0) return Promise.resolve();
                return Promise.reject(new Error('Tax amount cannot be negative'));
              }
            }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter tax amount"
            min={0}
            step={1}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
            Update Tax
          </Button>
          <Button onClick={() => setShowTaxEditModal(false)}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  useEffect(() => {
    if (user?.UserID) {
      getRedeemCoupon(user.UserID);
    }
  }, [user]);
  const getRedeemCoupon = (userID) => {
    ApiClient.get("admin/getUserCouponsWalletAmt/" + userID)
      .then((res) => {
        if (res.status === 200) {
          setRedeemData(res.data);
        }
      })
      .catch((error) => {
        setRedeemData({});
      });
  };
  const [modalVisible, setModalVisible] = useState({
    visible: false,
    type: "USER",
  });
  const showModal1 = (type) => {
    /*============= check user logged or not =========== */
    setModalVisible({ visible: true, type: type });

  };
  const handleTaxClick = () => {
    if (isEditable) {
      setShowTaxEditModal(true);
    }
  };
  return (
    <>
      <div className="luxury-fare-box">
        <div className="fare-box-header">
          <div className="header-title-flex">
            <FileTextOutlined className="fare-icon" />
            <span className="fare-title-text">Fare Breakdown</span>
          </div>
          <span className="fare-currency-badge">INR</span>
        </div>

        <div className="fare-box-content">
          <div className="fare-item-row">
            <span className="item-label">Room Price</span>
            <div className="item-val-wrap">
              <span className="item-price">₹ {Number(hotelDetailsObj?.combineRoom[0]?.priceDetails?.totalBasePrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <Popover
                overlayClassName="pricepopup"
                placement="left"
                content={roomFare()}
                title="Room Price Breakdown"
              >
                <QuestionCircleOutlined className="info-pop-icon" />
              </Popover>
            </div>
          </div>

          <div className="fare-item-row">
            <span className="item-label">Taxes &amp; Fees</span>
            <div className="item-val-wrap">
              <span className="item-price">₹ {(Number(hotelDetailsObj?.combineRoom[0]?.priceDetails?.totalTax || 0) + Number(agentTax)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <Popover
                overlayClassName="pricepopup"
                placement="left"
                content={
                  <>
                    {hotelDetailsObj?.combineRoom[0]?.priceDetails?.totalTax > 0 && (
                      <div className="pax-count-acc-body">
                        <div className="pax-type"><p>Tax</p></div>
                        <div className="service-price">
                          <p style={{ whiteSpace: "nowrap" }}>
                            {Number(hotelDetailsObj?.combineRoom[0]?.priceDetails?.totalTax || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                    {hotelDetailsObj?.combineRoom[0]?.priceDetails?.tax > 0 && (
                      <div className="pax-count-acc-body">
                        <div className="pax-type"><p>Tax</p></div>
                        <div className="service-price">
                          <p style={{ whiteSpace: "nowrap" }}>
                            {Number(hotelDetailsObj?.combineRoom[0]?.priceDetails?.tax || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                    {hotelDetailsObj?.combineRoom[0]?.priceDetails?.otherCharges > 0 && (
                      <div className="pax-count-acc-body">
                        <div className="pax-type"><p>Other Tax</p></div>
                        <div className="service-price">
                          <p style={{ whiteSpace: "nowrap" }}>
                            {Number(hotelDetailsObj?.combineRoom[0]?.priceDetails?.otherCharges || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                    {agentTax > 0 && (
                      <div className="pax-count-acc-body">
                        <div className="pax-type"><p>Agent Tax</p></div>
                        <div className="service-price">
                          <p style={{ whiteSpace: "nowrap", color: '#0075c3' }}>
                            {Number(agentTax || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                }
                title="Taxes and Fees"
              >
                <QuestionCircleOutlined className="info-pop-icon" />
              </Popover>
              {/* {isEditable && (
                <button type="button" className="edit-tax-btn" onClick={handleTaxClick} title="Edit Tax">
                  <EditOutlined />
                </button>
              )} */}
            </div>
          </div>

          {roomDetails.extraGuestCharges > 0 && (
            <div className="fare-item-row">
              <span className="item-label">Extra Guest Charge</span>
              <span className="item-price">₹ {Number(roomDetails.extraGuestCharges || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          {roomDetails.totalHotelDiscount > 0 && (
            <div className="fare-item-row discount">
              <span className="item-label">Hotel Discount</span>
              <span className="item-price discount">- ₹ {Number(roomDetails.totalHotelDiscount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          {promoData.status && promoDiscount > 0 && (
            <div className="fare-item-row discount">
              <span className="item-label">Promo Discount</span>
              <span className="item-price discount">- ₹ {Number(promoDiscount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          {convamount > 0 && (
            <div className="fare-item-row">
              <span className="item-label">Service Fee</span>
              <span className="item-price">₹ {Number(convamount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="fare-total-banner">
            <div className="total-left">
              <span className="total-title">Total Amount</span>
              <span className="total-tax-note">Includes all taxes &amp; fees</span>
            </div>
            <div className="total-right">
              <span className="total-currency">₹</span>
              <span className="total-amount-number">
                {Number(totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="fare-trust-footer">
            <SafetyCertificateFilled className="shield-icon" />
            <span>100% Safe &amp; Secure Booking</span>
          </div>

          {agent && (
            <Collapse
              size="small"
              defaultActiveKey={[]}
              className="agent-collapse-box"
              style={{ marginTop: 12 }}
              items={[
                {
                  key: '1',
                  label: 'Agent Fare Details',
                  children: (
                    <div className="agent-breakdown-details">
                      <div className="agent-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Commission:</span>
                        <strong>₹ {Number(totalCommission || 0).toFixed(2)}</strong>
                      </div>
                      <div className="agent-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Net Fare:</span>
                        <strong>₹ {Number(Netfare || 0).toFixed(2)}</strong>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          )}

          <Modal
            title="Edit Tax Amount"
            open={showTaxEditModal}
            onCancel={() => setShowTaxEditModal(false)}
            footer={null}
            width={400}
          >
            {taxEditContent}
          </Modal>

        </div>
      </div>
      {/* <div style={{ background: "white", boxShadow: "0 2px 14px #c9c9c9" }}>
        {!agent && user?.Role?.RoleLevel !== 3 && isPromoVisible ? (
          <div className="buspromo_wrapper">
            {promoData.status == false ? (

              <div className="promo-hot">
                <div style={{ background: "#f9f9f9", padding: 10 }}>
                  <p className="name">Apply Promo</p>
                </div>
                {user != null ?
                  <Form
                    layout="vertical"
                    form={form}
                    onFinish={(d) => {
                      validatePromoCode({
                        ServiceType: 2,
                        Amount: Number(totalAmount),
                        PromoCode: d.promo,
                        UserId: user?.UserID ?? 1,
                        userMail: user?.Email,
                      });
                    }}
                    style={{ margin: "16px" }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col md={12} sm={12} xs={12}>
                        <Form.Item
                          name="promo"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input
                            className="inputbg"
                            placeholder="Enter Your Promo code"
                            autoComplete="off"
                          />
                        </Form.Item>
                      </Col>
                      <Col md={8} sm={12} xs={12}>
                        <Form.Item>
                          <Button className="btn-pro" type="primary" onClick={() => form.submit()}>
                            Apply
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form> : <div className="promo-input" style={{ padding: 10 }}>
                    <p>Please <span style={{ color: "#023d96", cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "jost" }} onClick={() => showModal1("USER")}>Sign-In</span> to Avail Offers</p>
                  </div>
                }

                <div className="pr-card-cn">
                  {promoCode.length ? (
                    promoCode.map((item, key) => {
                      return (
                        <div className="promo-cp-coupons" key={key}>
                          <div className="inline-cp-promo">
                            <Form>
                              <Form.Item>
                                <Radio
                                  checked={selectedPromoCode === item.Code}
                                  onClick={() => handleApply(item.Code)}
                                  key={item.Code}
                                />
                              </Form.Item>
                            </Form>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "-webkit-fill-available",
                              }}
                            >
                              <p className="promo-key-cp">{item.Code}</p>
                              {item.DiscountType === 1 ? (
                                <p className="save-cp-offer">
                                  Save {Math.floor(item.Discount) + " %"}
                                </p>
                              ) : (
                                <p className="save-cp-offer">
                                  Save{" "}
                                  {"₹"
                                  }
                                  &nbsp;
                                  {item.Discount}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="promo-percentage-cp">
                            <p>{item.Description}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="promo-cp-coupons" style={{ padding: 10 }}>
                      <div className="promo-percentage-cp pl-0 pt-0">
                        <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "jost" }}>
                          No Promo Code Available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            ) : (
              <Card bordered={false} className="hotel-card-wrapper" >
                <div style={{ margin: 20 }}>
                  <div className="promo-card-header">
                    <p
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      className="name"
                    >
                      Promo Coupon{" "}
                      <CloseOutlined
                        onClick={() => {
                          RemovePromo();
                          form.resetFields();
                        }}
                      />{" "}
                    </p>
                  </div>
                  <div className="promo-input">
                    <p className="mb-0">
                      <span className="applied"> {promoData.Code} </span> Promo Code
                      Applied
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </div> */}

      {user && redeemData?.couponAmt > 0 ? (
        redeemAmount.status === true ? (
          <Card className="flight-cards-details mt-3">
            <div className="d-flex justify-content-between align-items-center">
              <p className="name mb-0">
                Redeemed From Coupon Wallet: {redeemTotal}
              </p>
              {!isPromoVisible ? null : (
                <CloseOutlined
                  onClick={() => {
                    RemoveRedeemCoupon();
                  }}
                />
              )}
            </div>
          </Card>
        ) : !isPromoVisible ? null : (
          <Card className="flight-cards-details mt-3">
            <p className="font-weight-bold mb-1">
              Coupon Wallet:
              {"("}
              {redeemData?.couponAmt} {")"}
            </p>

            <div className="book-pay-btn">
              {" "}
              <Button
                type="primary"
                className=" redeem_btn"
                onClick={() => {
                  validateRedeemCoupon({
                    userId: user?.UserID ?? 0,
                    roleType: user?.Role?.RoleId ?? 0,
                    membershipId: user?.Membership ?? 0,
                    couponAmt: redeemData?.couponAmt ?? 0,
                  });
                }}
              >
                Redeem Coupon
              </Button>
            </div>
          </Card>
        )
      ) : null}

    </>
  );
};

export default HotelFairBox;
