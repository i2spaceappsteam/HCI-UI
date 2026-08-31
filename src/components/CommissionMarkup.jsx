import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Table } from 'antd';
import ApiClient from '../Helpers/ApiClient';
import { Form, Modal, Input, InputNumber, DatePicker,Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { notifySuccess, notifyError, notifyWarning } from "../../public/js/notify/notify";
import dayjs from 'dayjs';
import AirportAutoComplete from '../common/AirportAutoComplete/AirportAutoComplete';
import { useSelector } from 'react-redux';

const { Option } = Select;

const CommissionMarkup = () => {
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.auth);
  const [dataList, setDataList] = useState([]);
  const [membershipList, setMembershipList] = useState([]);
  const [operatorList, setOperatorList] = useState([]);
  const [id, setId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [originVal, setOriginVal] = useState(null);
  const [destinationVal, setDestinationVal] = useState(null);


  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {

    try {
      const values = await form.validateFields();
      console.log(values)
      const request = {
        userId: user?.id || 0,
        commId: id == null ? 0 : id,
        membershipID: values.membershipID || 0,
        serviceType: values.serviceType || 0,
        fareType: values.fareType || 0,
        airlineCode: values.airlineCode || "",
        transactionType: values.transactionType || 0,
        fareCategoryType: values.fareCategoryType || 0,
        markupType: values.markupType || 0,
        markupValue: values.markupValue || 0,
        commissionType: values.commissionType || 0,
        commissionValue: values.commissionValue || 0,
        cabinType: values.cabinType || "",
        origin: values.origin || "",
        destination: values.destination || "",
        fromTravelDate: values.fromTravelDate ? values.fromTravelDate.toISOString() : new Date().toISOString(),
        toTravelDate: values.toTravelDate ? values.toTravelDate.toISOString() : new Date().toISOString()
      };

      const res = await ApiClient.post("CommissionMarkup/AddCommissionMarkup", request);

      if (res?.success === true) {
        notifySuccess("success", res.message);
        setOpen(false);
        form.resetFields();
        GetData();
        setId(null);
      } else if (res?.status === 409) {
        notifyWarning("warning", res.message || "Duplicate Commission Markup");
      } else {
        notifyError("danger", res.message || "Something went wrong");
      }
    } catch (err) {
      console.log("Validation Failed:", err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setId(null);
    setOriginVal(null);
    setDestinationVal(null);
  };


  useEffect(() => {
    GetData();
    GetMemberships();
    getOperators();
  }, []);

  const getOperators = () => {
    ApiClient.get('Operator/GetAll')
      .then((res) => {
        if (res?.success === true) {
          setOperatorList(res.data || []);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  function GetMemberships() {
    ApiClient.get("Membership/GetMemberships")
      .then((res) => {
        if (res?.success === true) {
          setMembershipList(res.data || []);
        } else if (res?.status == 409) {
          notifyWarning("warning", res.message);
        } else {
          notifyError("danger", res.message);
        }
      })
      .catch((e) => {});
  }

  function GetData() {
    const request = { userId: user?.id || 0 }; // Pass dynamic userId
    ApiClient.post("CommissionMarkup/GetCommissionMarkup", request)
      .then((res) => {
        if (res?.success === true) {
          setDataList(res.data || []);
        } else if (res?.status == 409) {
          notifyWarning("warning", res.message);
        } else {
          notifyError("danger", res.message);
        }
      })
      .catch((e) => {});
  }

  function editRecord(record) {
    form.setFieldsValue({
      membershipID: record.membershipId,
      serviceType: record.serviceType,
      fareType: record.fareType,
      airlineCode: record.airlineCode,
      transactionType: record.transactionType,
      fareCategoryType: record.fareCategoryType,
      markupType: record.markupType,
      markupValue: record.markupValue,
      commissionType: record.commissionType,
      commissionValue: record.commissionValue,
      cabinType: record.cabinType,
      origin: record.origin,
      destination: record.destination,
      fromTravelDate: record.fromTravelDate ? dayjs(record.fromTravelDate) : null,
      toTravelDate: record.toTravelDate ? dayjs(record.toTravelDate) : null,
    });
    setId(record.commId);
    setOriginVal(record.origin);
    setDestinationVal(record.destination);
    setOpen(true);
  }


  function handleDelete() {
    ApiClient.put(`CommissionMarkup/DeleteCommissionMarkup/${deleteId}`)
      .then((res) => {
        if (res?.success === true) {
          setDeleteId(null);
          setDeleteOpen(false);
          GetData();
          notifySuccess("success", res.message);
        } else if (res?.status == 409) {
          notifyWarning("warning", res.message);
        } else {
          notifyError("danger", res.message);
        }
      })
      .catch((e) => {});
  }

  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      render: (_, m) => (
        <div className="d-flex align-items-center gap-3">
          <i
            className="fa fa-pencil-square-o text-warning"
            style={{ cursor: "pointer" }}
            title="Edit"
            onClick={() => editRecord(m)}
          ></i>
          <i
            className="fa fa-trash-o text-danger"
            style={{ cursor: "pointer" }}
            title="Delete"
            onClick={() => openDeleteModal(m.commId)}
          ></i>
        </div>
      ),
    },
    { 
      title: 'Membership', 
      key: 'membership',
      render: (_, m) => membershipList.find(ml => ml.id === m.membershipId)?.membership || m.membershipId
    },
    { title: 'Airline Code', dataIndex: 'airlineCode', key: 'airlineCode' },
    { title: 'Fare Type', dataIndex: 'fareType', key: 'fareType' },
    { title: 'Fare Category', dataIndex: 'fareCategoryType', key: 'fareCategoryType' },
    { title: 'Cabin Type', dataIndex: 'cabinType', key: 'cabinType' },
    { title: 'Origin', dataIndex: 'origin', key: 'origin' },
    { title: 'Destination', dataIndex: 'destination', key: 'destination' },
    { 
      title: 'Travel Dates', 
      key: 'travelDates',
      render: (_, m) => (
        <>
          {m.fromTravelDate ? dayjs(m.fromTravelDate).format('YYYY-MM-DD') : ''} to{' '}
          {m.toTravelDate ? dayjs(m.toTravelDate).format('YYYY-MM-DD') : ''}
        </>
      )
    },
    { title: 'Markup Value', dataIndex: 'markupValue', key: 'markupValue' },
    { title: 'Commission Value', dataIndex: 'commissionValue', key: 'commissionValue' },
  ];

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-header card-header--2">
            <h5>All Commission Markups</h5>
            <button type="button" className="btn btn-theme" onClick={() => setOpen(true)}>
              <i data-feather="plus-square"></i> Add New
            </button>
          </div>

          <div className="card-body">
            <div className="table-responsive table-desi">
              <Table 
                columns={columns} 
                dataSource={dataList} 
                size="small" 
                scroll={{ x: 'max-content' }} 
                rowKey={(record) => record.commId}
                pagination={{ pageSize: 10 }}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal open={deleteOpen} footer={null} closable={false} width={420} centered>
        <div className="card mb-0">
          <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between">
            <h6 className="mb-0">Confirm Delete</h6>
            <i className="fa fa-times cursor-pointer" style={{ fontSize: "16px" }} onClick={() => setDeleteOpen(false)}></i>
          </div>

          <div className="card-body text-center py-4">
            <i className="fa fa-trash text-danger fs-2 mb-2"></i>

            <h6 className="mb-1">Are you sure you want to delete?</h6>
            <small className="text-muted">This action cannot be undone.</small>
          </div>

          <div className="card-footer text-center py-2">
            <button className="btn btn-danger me-2 px-4" onClick={handleDelete}>
              Delete
            </button>
            <button className="btn btn-outline-secondary px-4" onClick={() => setDeleteOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={open} footer={null} closable={false} centered width={1140} onCancel={handleCancel}>
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>{id == null ? "Add Commission Markup" : "Update Commission Markup"}</h5>
            <button type="button" className="btn-close" onClick={handleCancel}></button>
          </div>

          <div className="card-body">
            <style>{`
              .mega-form .ant-form-item {
                margin-bottom: 0 !important;
              }
              .mega-form .ant-select-single:not(.ant-select-customize) .ant-select-input {
                background: transparent !important;
                border: none !important;
              }
            `}</style>
            <Form layout="vertical" form={form} className="theme-form mega-form">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Membership</label>
                  <Form.Item name="membershipID">
                    <Select placeholder="Select Membership" allowClear>
                      {membershipList.map((m) => (
                        <Select.Option key={m.id} value={m.id}>
                          {m.membership}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Service Type</label>
                  <Form.Item name="serviceType">
                     <Select placeholder="Please select">
                    
                    <Option value={0}>DOMESTIC FLIGHTS</Option>
                    <Option value={1}>INTERNATIONAL FLIGHTS</Option>
                  </Select>
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Fare Type</label>
                  <Form.Item name="fareType">
                  <Select
                     showSearch
                     placeholder="Select Fare Type"
                     filterOption={(input, option) =>
                       option.children
                         .toLowerCase()
                         .indexOf(input.toLowerCase()) >= 0
                     }
                   >
                    <Option value={1}>ALL</Option>
                    <Option value={2}>GENERAL</Option>
                    <Option value={3}>PUBLISH</Option>
                    <Option value={4}>INSTANTPUR</Option>
                    <Option value={5}>SME</Option>
                    <Option value={6}>SAVER</Option>
                    <Option value={7}>CORPORATE</Option>
                    <Option value={8}>COUPON</Option>
                    <Option value={9}>FLEXI</Option>
                    <Option value={10}>NDC</Option>
                    <Option value={11}>TACTICAL</Option>
                    <Option value={12}>SUPER6E</Option>
                    <Option value={13}>SME.CRPCON</Option>
                    <Option value={14}>SPECIAL</Option>
                    <Option value={15}>SUPERFARE</Option>
                    <Option value={16}>ECONOMY LITE</Option>
                    <Option value={17}>ECONOMY SMART</Option>
                    <Option value={18}>ECONOMY PRIME</Option>
                    <Option value={19}>ECONOMY CLASSIC</Option>
                    <Option value={20}>ECONOMY CONVENIENCE</Option>
                    <Option value={21}>COMFORT</Option>
                    <Option value={22}>BASIC FARE</Option>
                    <Option value={23}>VALUE FARE</Option>
                    <Option value={24}>EXTRA FARE</Option>
                    <Option value={25}>YL|ECONOMY LIGHT</Option>
                    <Option value={26}>EC|ECONOMY SMART</Option>
                    <Option value={27}>YL|ECONOMY FLEX</Option>
                    <Option value={28}>SPECIAL CP</Option>
                    <Option value={29}>SPICE FLEX</Option>
                    <Option value={30}>XPRESS VALUE CLASS</Option>
                    <Option value={31}>XPRESS FLEX CLASS</Option>
                    <Option value={32}>CORPORATE VALUE CLASS</Option>
                    <Option value={33}>LIGHT</Option>
                    <Option value={34}>STANDARD</Option>
                    <Option value={35}>PROMO FARE</Option>
                    <Option value={36}>CORP CONNECT FARE</Option>
                    <Option value={37}>REGULAR FARE</Option>
                    <Option value={38}>ECO VALUE</Option>
                    <Option value={39}>ECONOMY COMFORT</Option>
                    <Option value={40}>ECOFLEX|ECONOMY FLEX</Option>
                    <Option value={41}>VALUE</Option>
                    <Option value={42}>YS|ECONOMY FLEX</Option>
                    <Option value={43}>YR|ECONOMY SPECIAL</Option>
                    <Option value={44}>YP|ECONOMY SAVER</Option>
                    <Option value={45}>YF|ECONOMY FLEX PLUS</Option>
                    <Option value={46}>LITE</Option>
                    <Option value={47}>ECONOMY LIGHT</Option>
                    <Option value={48}>YF|ECONOMY FLEX</Option>
                    <Option value={49}>SALE</Option>
                    <Option value={50}>PUBLISHED</Option>
                    <Option value={51}>FAMILY</Option>
                    <Option value={52}>FLEXI_PLUS</Option>
                    <Option value={53}>PREMIUM_FLEX</Option>
                     <Option value={54}>GOMORE</Option>   
                     <Option value={55}>CORPORATE_FLEX</Option>
                     <Option value={56}>SPECIAL_RETURN</Option>
                     <Option value={57}>OFFER_FARE_WITHOUT_PNR</Option>
                     <Option value={58}>OFFER_FARE_WITH_PNR</Option>
                     <Option value={59}>SUPER_6E</Option>
                     <Option value={60}>AZAL CLASSIC</Option>
<Option value={61}>AZAL PLUS</Option>
<Option value={62}>ECONOMY FLEX</Option>
<Option value={63}>ECO CLASSIC</Option>
<Option value={64}>ECO FLEX</Option>
<Option value={65}>ECO SAVER</Option>
<Option value={66}>ECO FLEXPLUS</Option>
<Option value={67}>BASIC ECO</Option>
<Option value={68}>FLEX ECO</Option>
<Option value={69}>ECONOMY SAVER</Option>
<Option value={70}>ECONOMY BASE</Option>
<Option value={71}>ECONOMY GREEN</Option>
<Option value={72}>ECONOMY BASIC</Option>
<Option value={73}>ECONOMY VALUE</Option>
<Option value={74}>ECONOMY DELUXE</Option>
<Option value={75}>ECONOMY STANDARD</Option>
<Option value={76}>ECONOMY FLEXI</Option>
<Option value={77}>RESTRICTED</Option>
<Option value={78}>FLEXIBLE</Option>
<Option value={79}>ECONOMY ESSENTIAL</Option>
                     <Option value={81}>UPFRONT</Option>
                     <Option value={82}>SPICE SAVER</Option>
                     <Option value={83}>SAVER (REGULAR)</Option>
                     <Option value={84}>SPICE MAX</Option>
                     <Option value={85}>CORPORATE FLEX</Option>
                     <Option value={86}>PROMO</Option>
                     <Option value={87}>CLASSIC</Option>
                     <Option value={88}>STRETCH</Option>
                     <Option value={89}>STRETCHPLUS</Option>
                  </Select>
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Airline Code</label>
                  <Form.Item name="airlineCode">
                    <Select
                      showSearch
                      placeholder="Select Operator"
                      allowClear
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={operatorList.map((item) => ({
                        key: item.id,
                        value: item.airlineCode,
                        label: `${item.airlineName} - ${item.airlineCode}`,
                      }))}
                    />
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Transaction Type</label>
                  <Form.Item name="transactionType">
                    <Select placeholder="Select Transaction Type">
                      <Option value={0}>None</Option>
                      <Option value={1}>Booking</Option>
                      <Option value={2}>Cancellation</Option>
                      <Option value={3}>Meal</Option>
                      <Option value={4}>Baggage</Option>
                      <Option value={5}>Seat</Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Fare Category Type</label>
                  <Form.Item name="fareCategoryType">
                    <Select placeholder="Select Fare Category Type">
                      <Option value={0}>None</Option>
                      <Option value={1}>Basic</Option>
                      <Option value={2}>Tax</Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Markup Type</label>
                  <Form.Item name="markupType">
                   <Select placeholder="Please select">
                    <Option value={0}>Fixed</Option>
                    <Option value={1}>Percentage</Option>
                  </Select>
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Markup Value</label>
                  <Form.Item name="markupValue">
                    <InputNumber placeholder="0" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Commission Type</label>
                  <Form.Item name="commissionType">
 <Select placeholder="Please select">
                    <Option value={0}>Fixed</Option>
                    <Option value={1}>Percentage</Option>
                  </Select>
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Commission Value</label>
                  <Form.Item name="commissionValue">
                    <InputNumber placeholder="0" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">Cabin Type</label>
                  <Form.Item name="cabinType">
                    <Select placeholder="Select Cabin Type">
                    <Option value="A">All</Option>
                    <Option value="PE">Premium Economy</Option>
                    <Option value="B">Business</Option>
                    <Option value="F">First Class</Option>
                    <Option value="E">Economy</Option>
                  </Select>
                  </Form.Item>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label-title">Origin</label>
                  <AirportAutoComplete
                    formItemProps={{ name: "origin" }}
                    selectProps={{
                      value: originVal,
                      placeholder: "City or Airport",
                      style: { width: '100%' },
                      onChange: (val) => { setOriginVal(val); form.setFieldsValue({ origin: val }); }
                    }}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label-title">Destination</label>
                  <AirportAutoComplete
                    formItemProps={{ name: "destination" }}
                    selectProps={{
                      value: destinationVal,
                      placeholder: "City or Airport",
                      style: { width: '100%' },
                      onChange: (val) => { setDestinationVal(val); form.setFieldsValue({ destination: val }); }
                    }}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">From Travel Date</label>
                  <Form.Item name="fromTravelDate">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label-title">To Travel Date</label>
                  <Form.Item name="toTravelDate">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>

          <div className="card-footer text-end">
            <button className="btn btn-primary me-3" onClick={handleSubmit}>
              {id == null ? "Submit" : "Update"}
            </button>
            <button className="btn btn-outline-primary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommissionMarkup;
