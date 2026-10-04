import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Table } from 'antd';
import ApiClient from '../Helpers/ApiClient';
import { Form, Modal, InputNumber, Select } from 'antd';
import { notifySuccess, notifyError, notifyWarning } from "../../public/js/notify/notify";
import { useSelector } from 'react-redux';

const { Option } = Select;

const AgentMarkup = () => {
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.auth);
  const [dataList, setDataList] = useState([]);
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
        commId: id == null ? 0 : id,
        userId: user?.id || 0,
        starRating: values.starRating || 0,
        markupType: values.markupType || 0,
        markupValue: values.markupValue || 0,
      };

      const res = await ApiClient.post("AgentMarkup/AddAgentMarkup", request);

      if (res?.success === true) {
        notifySuccess("success", res.message);
        setOpen(false);
        form.resetFields();
        GetData();
        setId(null);
      } else if (res?.status === 409) {
        notifyWarning("warning", res.message || "Duplicate Agent Markup");
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
  }, []);

  function GetData() {
    const request = { userId: user?.id || 0 }; 
    ApiClient.post("AgentMarkup/GetAgentMarkup", request)
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
      starRating: record.starRating,
      markupType: record.markupType,
      markupValue: record.markupValue,
    });
    setId(record.commId || record.id);
    setOpen(true);
  }

  function handleDelete() {
    ApiClient.put(`AgentMarkup/DeleteAgentMarkup/${deleteId}`)
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
            onClick={() => openDeleteModal(m.commId || m.id)}
          ></i>
        </div>
      ),
    },
    { 
      title: 'Star Rating', 
      dataIndex: 'starRating', 
      key: 'starRating',
      render: (val) => {
        const ratings = {0: 'All', 1: 'One Star', 2: 'Two Star', 3: 'Three Star', 4: 'Four Star', 5: 'Five Star'};
        return ratings[val] || val;
      }
    },
    { title: 'Markup Type', dataIndex: 'markupType', key: 'markupType', render: (val) => val === 1 ? 'Percentage' : 'Fixed' },
    { title: 'Markup Value', dataIndex: 'markupValue', key: 'markupValue' },
  ];

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-header card-header--2">
            <h5>All Agent Markups</h5>
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
                rowKey={(record) => record.commId || record.id}
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

      <Modal open={open} footer={null} closable={false} centered width={800} onCancel={handleCancel}>
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>{id == null ? "Add Agent Markup" : "Update Agent Markup"}</h5>
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
                <div className="col-md-12 mb-2">
                  <label className="form-label-title">Star Rating</label>
                  <Form.Item name="starRating">
                    <Select placeholder="Please select">
                      <Option value={0}>All</Option>
                      <Option value={1}>One Star</Option>
                      <Option value={2}>Two Star</Option>
                      <Option value={3}>Three Star</Option>
                      <Option value={4}>Four Star</Option>
                      <Option value={5}>Five Star</Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label-title">Markup Type</label>
                  <Form.Item name="markupType">
                   <Select placeholder="Please select">
                    <Option value={0}>Fixed</Option>
                    <Option value={1}>Percentage</Option>
                  </Select>
                  </Form.Item>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label-title">Markup Value</label>
                  <Form.Item name="markupValue">
                    <InputNumber placeholder="0" style={{ width: '100%' }} />
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

export default AgentMarkup;
