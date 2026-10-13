import React, { useState, useEffect } from "react";
import {
  DownloadOutlined,
  FileExcelOutlined,
  MailOutlined,
  MessageOutlined,
  PrinterOutlined,
  DollarOutlined,
  LoadingOutlined,
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
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { useSelector } from "react-redux";
import { selectIsAgent } from "../../store/slices/authSlice";
import { getPassengerData } from "../../Helpers/PassegerData";
import ApiClient from "../../Helpers/ApiClient";
import "./NewTicket.scss";
import HotelDoc from "../PdfDocuments/Hotel/HotelDoc";
import HotelNewInvoiceDoc from "../PdfDocuments/Hotel/HotelInvoice";

import Apiclient1 from "../../Helpers/Apiclient1";


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
  cancelLoading = false,
}) => {
  const user = useSelector((state) => state.auth.user);
  const agent = useSelector(selectIsAgent);

  const [holdLoading, setHoldLoading] = useState(false);

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
  const [downloadingVoucher, setDownloadingVoucher] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const handleDownloadVoucher = async () => {
    if (downloadingVoucher) return;
    setDownloadingVoucher(true);
    const hideMsg = message.loading("Generating E-Voucher PDF...", 0);
    try {
      const doc = (
        <HotelDoc
          ticketData={ticketData}
          cmsFareRules={cmsFareRules}
          withFare={true}
        />
      );
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const refName =
        ticketData?.RefNumber ||
        ticketData?.ConfirmationNumber ||
        ticketData?.booking?.referenceNumber ||
        "Voucher";
      link.download = `Hotel_Voucher_${refName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      hideMsg();
      message.success("E-Voucher downloaded successfully!");
    } catch (err) {
      hideMsg();
      console.error("Error generating hotel voucher PDF:", err);
      message.error("Failed to generate PDF. You can also use 'Print E-Voucher' and Save as PDF.");
    } finally {
      setDownloadingVoucher(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (downloadingInvoice) return;
    setDownloadingInvoice(true);
    const hideMsg = message.loading("Generating Invoice PDF...", 0);
    try {
      const doc = (
        <HotelNewInvoiceDoc
          invoiceData={invoiceData}
          type={"invoice"}
        />
      );
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const refName =
        invoiceData?.RefNumber ||
        invoiceData?.booking?.referenceNumber ||
        "Invoice";
      link.download = `Hotel_Invoice_${refName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      hideMsg();
      message.success("Invoice downloaded successfully!");
    } catch (err) {
      hideMsg();
      console.error("Error generating invoice PDF:", err);
      message.error("Failed to generate Invoice PDF.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const printTicket = () => {
    window.print();
  };

  const confirmHoldTicket = () => {
    if (holdLoading) return;
    setHoldLoading(true);
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
    };

    Apiclient1.post("Hotel/ConfirmHoldTicket", data)
      .then((res) => {
        setHoldLoading(false);
        const dataObj = res.data || res;
        if (dataObj && dataObj.errors && dataObj.errors.length > 0) {
          message.error(dataObj.errors[0]?.message || "Failed to confirm hold ticket.");
        } else {
          message.success("Hold ticket confirmed successfully.");
          getTicketDetails();
        }
      })
      .catch((error) => {
        setHoldLoading(false);
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
          <button
            className="sidebar-btn sidebar-btn-primary"
            onClick={handleDownloadVoucher}
            disabled={downloadingVoucher}
          >
            {downloadingVoucher ? (
              <>
                <LoadingOutlined spin /> Downloading...
              </>
            ) : (
              <>
                <DownloadOutlined /> Download E-Voucher
              </>
            )}
          </button>
        ) : null}

        {invoiceData.BookingStatus !== 6 && type === "Hotel" && (
          (invoiceData.BookingStatus === 2 && agent) ||
          ((user !== null) && (invoiceData.BookingStatus === 2 && user?.UserID === 1))
        ) ? (
          <button
            className="sidebar-btn sidebar-btn-invoice"
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
          >
            {downloadingInvoice ? (
              <>
                <LoadingOutlined spin /> Downloading...
              </>
            ) : (
              <>
                <FileExcelOutlined /> Download Invoice
              </>
            )}
          </button>
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

        {type === "Hotel" &&
        ticketData?.BookingStatus !== "CANCELLED" &&
        ticketData?.BookingStatus !== 3 &&
        ticketData?.BookingStatus !== "3" &&
        ticketData?.BookingStatus !== 4 &&
        ticketData?.BookingStatus !== "4" &&
        String(ticketData?.BookingStatus).toUpperCase() !== "CANCELLED" ? (
          <button
            className="sidebar-btn sidebar-btn-danger"
            onClick={() => handleCancel("Hotel")}
            disabled={cancelLoading}
            style={{
              opacity: cancelLoading ? 0.7 : 1,
              cursor: cancelLoading ? "not-allowed" : "pointer",
            }}
          >
            {cancelLoading ? (
              <>
                <LoadingOutlined spin /> Cancelling...
              </>
            ) : (
              <>
                <FileExcelOutlined /> Cancel Voucher
              </>
            )}
          </button>
        ) : null}

        {type === "Hotel" && (ticketData?.BookingStatus === "Hold" || ticketData?.BookingStatus === 6 || String(ticketData?.BookingStatus).toLowerCase() === "hold") ? (
          <button
            className="sidebar-btn sidebar-btn-primary"
            onClick={confirmHoldTicket}
            disabled={holdLoading}
            style={{
              background: "#28a745",
              color: "#fff",
              borderColor: "#28a745",
              marginBottom: "10px",
              opacity: holdLoading ? 0.7 : 1,
              cursor: holdLoading ? "not-allowed" : "pointer",
            }}
          >
            {holdLoading ? (
              <>
                <LoadingOutlined spin /> Confirming...
              </>
            ) : (
              <>
                <DollarOutlined /> Hold Confirm
              </>
            )}
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
