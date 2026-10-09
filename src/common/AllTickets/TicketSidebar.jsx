import React, { useState, useEffect } from "react";
import {
  DownloadOutlined,
  FileExcelOutlined,
  MailOutlined,
  MessageOutlined,
  PrinterOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Collapse,
} from "antd";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useSelector } from "react-redux";
import { selectIsAgent } from "../../store/slices/authSlice";
import { getPassengerData } from "../../Helpers/PassegerData";
import ApiClient from "../../Helpers/ApiClient";
import "./NewTicket.scss";
import HotelDoc from "../PdfDocuments/Hotel/HotelDoc";
import HotelNewInvoiceDoc from "../PdfDocuments/Hotel/HotelInvoice";




import ReactDOMServer from "react-dom/server";


const ImBUrl = import.meta.env.VITE_Image_URL;
const TicketSidebar = ({
  ticketData,
  type,
  onCancelTicket,
  onGetStatus,
  getTicketDetails = () => { },
  cmsFareRules = {},
  fareRulesResp = null,
  onResheduleTicket,
}) => {
  const user = useSelector((state) => state.auth.user);
  const agent = useSelector(selectIsAgent);

  const logo = "";
  const agentLogo = "";
  const [smsForm] = Form.useForm();
  const [pstMrkForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const { Panel } = Collapse;
  const [userInvoiceVisible, setUserinvoiceVisible] = useState(false);
  const [limitCount, setLimitCount] = useState({
    smsCount: 0,
    emailCount: 0,
  });
  const [pgData, setPgData] = useState({
    data: {},
    visible: false,
  });
  const [invoiceData, setInvoiceData] = useState({});
  const [creditNoteData, setCreditNoteData] = useState({});
  const [withFare, setWithFare] = useState(-1);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [pstMrkModalVisible, setPstMrkModalVisible] = useState(false);

  const toggleEmailModal = () => {
    emailForm.resetFields();
    if (!emailModalVisible) loadpassengerData("Email");
    setEmailModalVisible((prev) => !prev);
  };
  const toggleSmsModal = () => {
    smsForm.resetFields();
    if (!smsModalVisible) loadpassengerData("SMS");
    setSmsModalVisible((prev) => !prev);
  };

  const togglePstMrkModal = () => {
    pstMrkForm.resetFields();
    setPstMrkModalVisible((prev) => !prev);
  };


  const loadpassengerData = (type) => {
    if (user && user?.UserID) {
      getPassengerData(user?.UserID).then((data) => {
        if (data.status) {
          if (type === "SMS") smsForm.setFieldsValue({ Mobile: data.Mobile });

        }
      });
    }
  };

  const addPostMarkup = (req) => {
    ApiClient.post("admin/postmarkup", req).then((res) => {
      if (res.status === 200) {
        if (res?.message) message.success(res?.message, 3);
        getTicketDetails();
        setPstMrkModalVisible(false);
      } else if (res.status === 400) {
        if (res?.message) message.success(res?.message, 3);
      } else {
        if (res?.message) message.success(res?.message, 3);
        else alert("Failed");
      }
    });
  };

  useEffect(() => {
    getInvoiceData();

  }, []);


  const getInvoiceData = () => {
    let formData = {};


    if (type === "Hotel") {
      formData.serviceType = 2;
      formData.refNo = ticketData.RefNumber;
    }


    // if (formData) {
    //   ApiClient.post("admin/invoice", formData)
    //     .then((res) => {
    //       if (res.status == 200) {
    //         setInvoiceData(res.data);
    //       } else {
    //         setInvoiceData({});
    //       }
    //     })
    //     .catch((error) => {
    //       setInvoiceData({});
    //     });
    // }
  };

  const submitPostMarkup = (val) => {
    if (user) {
      let formData = {
        amount: val.amount,
        userId: user?.UserID,
      };



      if (type === "Hotel") {
        formData.serviceType = 2;
        formData.refNumber = ticketData.RefNumber;
      }



      addPostMarkup(formData);
    }
  };


  const sendEmailSmsETicket = (val) => {
    ApiClient.post("CommonUtility/notification", val).then((res) => {
      if (res.status === 200) {
        message.success(
          `${val.trigger === 2 ? "Sms" : "Email"} Sent Successfully`
        );
        setEmailModalVisible(false);
        setSmsModalVisible(false);
      } else {
        if (res?.message) alert(res?.message, 3);
        else alert("Failed");
      }
    });
  };
  const submitEmailForm = (val) => {
    if (limitCount.emailCount > 8) {
      alert("Limit Exceeded");
      setEmailModalVisible(false);
      return;
    } else {
      setLimitCount((prev) => ({
        ...prev,
        emailCount: limitCount.emailCount + 1,
      }));
    }

    if (type === "Bus") {
      let formData = {
        phoneNumber: "string",
        travelType: 3,
        trigger: 1,
        bookingReference: ticketData.bookingRefNo,
        email: val.Email,
        withFare: withFare,
      };
      sendEmailSmsETicket(formData);
    }









  };

  const k = (price) => {
    const htl = ReactDOMServer.renderToStaticMarkup(

    );


    let k = htl.toString();
    k = k.replaceAll("VIEW", "div");
    k = k.replaceAll("DOCUMENT", "div");
    k = k.replaceAll("PAGE", "div");
    k = k.replaceAll("TEXT", "p");
    k = k.replaceAll("IMAGE", "img");
    return k;
  };


  const handleCancel = (cancelTicketType) => {
    onCancelTicket(cancelTicketType);
  };
  const handleStatus = (status) => {
    onGetStatus(status);
  };
  const handleReshedule = (ticketType) => {
    onResheduleTicket(ticketType);
  };
  const printTicket = () => {
    window.print();
  };

  const confirmHoldTicket = () => {
    let data = {
      referenceNumber: ticketData?.booking?.referenceNumber || ticketData?.RefNumber || ticketData?.ConfirmationNumber || "",
      paymentModeType: "deposit",
      creditCardInfo: {
        securityId: "",
        cardNumber: "",
        expirationMonth: "",
        expirationYear: "",
        firstName: "",
        lastName: "",
        billingAmount: "",
        billingCurrency: "",
        cardHolderAddress: {
          addressLine1: "",
          addressLine2: "",
          city: "",
          zipcode: "",
          countryCode: ""
        }
      }
    }


    ApiClient.post("Hotel/ConfirmHoldTicket", data)
      .then((res) => {
        const dataObj = res.data || res;
        if (dataObj && dataObj.errors && dataObj.errors.length > 0) {
          message.error(dataObj.errors[0]?.message || "Failed to confirm hold ticket.");
        } else {
          message.success("Hold ticket confirmed successfully.");
          getTicketDetails();
        }
      })
      .catch((error) => {
        console.error(error);
        message.error("An error occurred while confirming the ticket.");
      });
  };


  return (
    <div className="actionable-buttons sidebar-card">
      <div className="sidebar-header">
        <h5 className="sidebar-title">Booking Actions</h5>
      </div>

      <div className="sidebar-actions-list">
        {type === "Hotel" ? (
          <PDFDownloadLink
            document={
              <HotelDoc
                ticketData={ticketData}
                cmsFareRules={cmsFareRules}
                withFare={true}
              />
            }
            fileName="hotelVoucher.pdf"
            style={{ textDecoration: "none", display: "block" }}
          >
            {({ blob, url, loading, error }) =>
              loading ? (
                <button className="sidebar-btn sidebar-btn-primary" disabled>
                  <DownloadOutlined /> Preparing Voucher...
                </button>
              ) : (
                <button className="sidebar-btn sidebar-btn-primary">
                  <DownloadOutlined /> Download E-Voucher
                </button>
              )
            }
          </PDFDownloadLink>
        ) : null}

        {invoiceData.BookingStatus !== 6 && type === "Hotel" && (
          (invoiceData.BookingStatus === 2 && agent) ||
          ((user !== null) && (invoiceData.BookingStatus === 2 && user?.UserID === 1))
        ) ? (
          <PDFDownloadLink
            document={
              <HotelNewInvoiceDoc
                invoiceData={invoiceData}
                type={"invoice"}
              />
            }
            fileName="Hotel_Invoice.pdf"
            style={{ textDecoration: "none", display: "block" }}
          >
            {({ blob, url, loading, error }) =>
              loading ? (
                <button className="sidebar-btn sidebar-btn-invoice" disabled>
                  <FileExcelOutlined /> Loading Invoice...
                </button>
              ) : (
                <button className="sidebar-btn sidebar-btn-invoice">
                  <FileExcelOutlined /> Download Invoice
                </button>
              )
            }
          </PDFDownloadLink>
        ) : null}

        <button className="sidebar-btn sidebar-btn-secondary" onClick={() => printTicket()}>
          <PrinterOutlined />{" "}
          {type === "Flight"
            ? "Print E-Ticket"
            : type === "Hotel"
              ? "Print E-Voucher"
              : "Print E-Ticket"}
        </button>

        <button
          className="sidebar-btn sidebar-btn-info"
          onClick={() => {
            toggleEmailModal();
            setWithFare(1);
          }}
        >
          <MailOutlined /> Send Mail
        </button>

        {type === "Bus" && ticketData.cancellable ? (
          <button className="sidebar-btn sidebar-btn-danger" onClick={() => handleCancel(type)}>
            <FileExcelOutlined /> Cancel E-Ticket
          </button>
        ) : null}

        {type === "Hotel" && ticketData?.BookingStatus !== "CANCELLED" && ticketData?.BookingStatus !== 4 ? (
          <button className="sidebar-btn sidebar-btn-danger" onClick={() => handleCancel("Hotel")}>
            <FileExcelOutlined /> Cancel Voucher
          </button>
        ) : null}

        {type === "Hotel" && (ticketData?.BookingStatus === "Hold" || ticketData?.BookingStatus === 6 || String(ticketData?.BookingStatus).toLowerCase() === "hold") ? (
          <button className="sidebar-btn sidebar-btn-primary" onClick={confirmHoldTicket} style={{ background: "#28a745", color: "#fff", borderColor: "#28a745", marginBottom: "10px" }}>
            <DollarOutlined /> Hold Confirm
          </button>
        ) : null}

        {type === "Flight" &&
          ticketData.BookingStatus !== "CANCELLED" &&
          ticketData?.BookingStatus === "CONFIRMED" &&
          ticketData?.cancellable ? (
          <button className="sidebar-btn sidebar-btn-danger" onClick={() => handleCancel("Flight")}>
            <FileExcelOutlined /> Cancel / Reschedule
          </button>
        ) : null}
      </div>












      <Modal
        title={[
          <div>
            <h6 style={{ margin: "0px", fontSize: "20px" }}>
              <strong>Enter The Email Address</strong>
            </h6>
          </div>,
        ]}
        className="promo-modal-header"
        open={emailModalVisible}
        onOk={toggleEmailModal}
        onCancel={toggleEmailModal}
        footer={[
          <div>
            <Button key="close" onClick={toggleEmailModal}>
              Cancel
            </Button>

            <Button
              key="add"
              type="primary"
              htmlType="submit"
              onClick={emailForm.submit}
            >
              Send
            </Button>
          </div>,
        ]}
      >
        <Form form={emailForm} layout="vertical" onFinish={submitEmailForm}>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Email"
                name="Email"
                rules={[
                  { required: true, message: "Required!" },
                  { type: "email", message: "Email is not a valid email" },
                ]}
              >
                <Input placeholder="Enter The Email Address" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={[
          <div>
            <h6 style={{ margin: "0px", fontSize: "20px" }}>
              <strong>SMS E-Ticket</strong>
            </h6>
          </div>,
        ]}
        className="promo-modal-header"
        open={smsModalVisible}
        onOk={toggleSmsModal}
        onCancel={toggleSmsModal}
        footer={[
          <div>
            <Button key="close" onClick={toggleSmsModal}>
              Cancel
            </Button>

            <Button
              key="add"
              type="primary"
              htmlType="submit"
              onClick={smsForm.submit}
            >
              Submit
            </Button>
          </div>,
        ]}
      >
        {/* <Form form={smsForm} layout="vertical" onFinish={sendSms}>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Mobile No."
                name="Mobile"
                autoFocus
                rules={[
                  {
                    required: true,
                    message: "Mobile Number Required",
                  },
                  {
                    minLength: 10,
                    maxLength: 10,
                    pattern: "^[0-9]{10}$",
                    message: "Must be 10 digits",
                  },
                ]}
              >
                <Input
                  className="number-specing"
                  placeholder="Enter Mobile number"
                  autoComplete="off"
                  autoFocus
                />
              </Form.Item>
            </Col>
          </Row>
        </Form> */}
      </Modal>
    </div>
  );
};
export default TicketSidebar;
