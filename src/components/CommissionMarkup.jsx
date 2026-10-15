import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Table } from 'antd';
import ApiClient from '../Helpers/ApiClient';
import { Form, Modal, Input, InputNumber, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { notifySuccess, notifyError, notifyWarning } from "../../public/js/notify/notify";
import { useSelector } from 'react-redux';

const { Option } = Select;

const CommissionMarkup = () => {
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.auth);
  const [dataList, setDataList] = useState([]);
  const [membershipList, setMembershipList] = useState([]);
  const [id, setId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const request = {
        id: id == null ? 0 : id,
        membershipId: values.membershipID || 0,
        serviceType: values.serviceType || 0,
        starRating: values.starRating || 0,
        markupType: values.markupType || 0,
        markupValue: values.markupValue || 0,
        commissionType: values.commissionType || 0,
        commissionValue: values.commissionValue || 0,
      };

      const res = await ApiClient.post("AdminCommission/AddAdminCommission", request);

      if (res?.success === true) {
        notifySuccess("success", res.message);
        setOpen(false);
        form.resetFields();
        GetData();
        setId(null);
      } else if (res?.status === 409) {
        notifyWarning("warning", res.message || "Duplicate Admin Commission");
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
  };

  useEffect(() => {
    GetData();
    GetMemberships();
  }, []);

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
      .catch((e) => { });
  }

  function GetData() {
    const request = { userId: user?.id || 0 };
    ApiClient.post("AdminCommission/GetAdminCommission", request)
      .then((res) => {
        if (res?.success === true) {
          setDataList(res.data || []);
        } else if (res?.status == 409) {
          notifyWarning("warning", res.message);
        } else {
          notifyError("danger", res.message);
        }
      })
      .catch((e) => { });
  }

  function editRecord(record) {
    form.setFieldsValue({
      membershipId: record.membershipID || record.membershipId, // Fallback in case of camelCase mismatch
      serviceType: record.serviceType,
      starRating: record.starRating,
      markupType: record.markupType,
      markupValue: record.markupValue,
      commissionType: record.commissionType,
      commissionValue: record.commissionValue,
    });
    setId(record.id || record.commId);
    setOpen(true);
  }

  function handleDelete() {
    ApiClient.put(`AdminCommission/DeleteAdminCommission/${deleteId}`)
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
      .catch((e) => { });
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
            onClick={() => openDeleteModal(m.id || m.commId)}
          ></i>
        </div>
      ),
    },
    {
      title: 'Membership',
      key: 'membership',
      render: (_, m) => {
        const mId = String(m.membershipID || m.membershipId || '');
        const match = membershipList.find(ml => String(ml.id) === mId);
        return match ? match.membership : mId;
      }
    },
    { title: 'Service Type', dataIndex: 'serviceType', key: 'serviceType', render: (val) => val === 0 ? 'DOMESTIC HOTEL' : 'INTERNATIONAL HOTEL' },
    {
      title: 'Star Rating',
      dataIndex: 'starRating',
      key: 'starRating',
      render: (val) => {
        const ratings = { 0: 'All', 1: 'One Star', 2: 'Two Star', 3: 'Three Star', 4: 'Four Star', 5: 'Five Star' };
        return ratings[val] || val;
      }
    },
    { title: 'Markup Type', dataIndex: 'markupType', key: 'markupType', render: (val) => val === 1 ? 'Percentage' : 'Fixed' },
    { title: 'Markup Value', dataIndex: 'markupValue', key: 'markupValue' },
    { title: 'Commission Type', dataIndex: 'commissionType', key: 'commissionType', render: (val) => val === 1 ? 'Percentage' : 'Fixed' },
    { title: 'Commission Value', dataIndex: 'commissionValue', key: 'commissionValue' },
  ];

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-header card-header--2">
            <h5>All Admin Commissions</h5>
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
                rowKey={(record) => record.id || record.commId}
                pagination={{ pageSize: 10 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Confirmation"
        open={deleteOpen}
        onOk={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        width={380}
        centered
      >
        <div className="text-center py-3">
          <i className="fa fa-trash-o text-danger fs-1 mb-2 d-block"></i>
          <h6 className="mb-1">Are you sure you want to delete this commission?</h6>
          <small className="text-muted">This action cannot be undone.</small>
        </div>
      </Modal>

      {/* Add / Update Modal */}
      <Modal
        title={id == null ? "Add Admin Commission" : "Update Admin Commission"}
        open={open}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={id == null ? "Submit" : "Update"}
        cancelText="Cancel"
        width={640}
        centered
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <div className="row g-3">
            <div className="col-md-6">
              <Form.Item label="Membership" name="membershipID">
                <Select placeholder="Select Membership" allowClear>
                  {membershipList.map((m) => (
                    <Select.Option key={m.id} value={m.id}>
                      {m.membership}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item label="Service Type" name="serviceType">
                <Select placeholder="Select Service Type">
                  <Option value={0}>DOMESTIC HOTEL</Option>
                  <Option value={1}>INTERNATIONAL HOTEL</Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item label="Star Rating" name="starRating">
                <Select placeholder="Select Star Rating">
                  <Option value={0}>All</Option>
                  <Option value={1}>One Star</Option>
                  <Option value={2}>Two Star</Option>
                  <Option value={3}>Three Star</Option>
                  <Option value={4}>Four Star</Option>
                  <Option value={5}>Five Star</Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item label="Markup Type" name="markupType">
                <Select placeholder="Select Markup Type">
                  <Option value={0}>Fixed</Option>
                  <Option value={1}>Percentage</Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item label="Markup Value" name="markupValue">
                <InputNumber placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item label="Commission Type" name="commissionType">
                <Select placeholder="Select Commission Type">
                  <Option value={0}>Fixed</Option>
                  <Option value={1}>Percentage</Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item label="Commission Value" name="commissionValue">
                <InputNumber placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CommissionMarkup;

