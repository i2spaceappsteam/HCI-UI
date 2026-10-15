import React, { useEffect, useState } from 'react';
import { Table, Form, Modal, InputNumber, Select } from 'antd';
import ApiClient from '../Helpers/ApiClient';
import { notifySuccess, notifyError, notifyWarning } from "../../public/js/notify/notify";
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

const { Option } = Select;

const AgentMarkup = () => {
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.auth);
  const [dataList, setDataList] = useState([]);
  const [id, setId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = user?.id || user?.userId || 0;

  // ── Fetch Markups ───────────────────────────────────────────────────
  const GetData = () => {
    setLoading(true);
    const request = {
      userId: userId,
      fromDate: null,
      toDate: null,
    };

    ApiClient.post("AgentMarkup/GetAgentMarkup", request)
      .then((res) => {
        if (res?.success === true) {
          setDataList(res.data || []);
        } else if (res?.status === 409) {
          notifyWarning("warning", res.message);
        } else {
          notifyError("danger", res?.message || "Something went wrong");
        }
      })
      .catch(() => {
        notifyError("danger", "Failed to load agent markups");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    GetData();
  }, [user]);

  // ── Open Add Modal ──────────────────────────────────────────────────
  const handleOpenAdd = () => {
    form.resetFields();
    form.setFieldsValue({ markupType: 0, markupValue: 0 });
    setId(null);
    setOpen(true);
  };

  // ── Edit Record ─────────────────────────────────────────────────────
  const editRecord = (record) => {
    const targetId = record.commId || record.id;
    if (targetId) {
      ApiClient.get(`AgentMarkup/GetAgentMarkupById/${targetId}`)
        .then((res) => {
          const item = (res?.success === true && res.data) ? res.data : record;
          form.setFieldsValue({
            markupType: item.markupType,
            markupValue: item.markupValue,
          });
          setId(item.commId || targetId);
          setOpen(true);
        })
        .catch(() => {
          form.setFieldsValue({
            markupType: record.markupType,
            markupValue: record.markupValue,
          });
          setId(targetId);
          setOpen(true);
        });
    }
  };

  // ── Submit (Add or Update) ──────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const request = {
        commId: id == null ? 0 : Number(id),
        userId: userId,
        markupType: Number(values.markupType ?? 0),
        markupValue: Number(values.markupValue ?? 0),
      };

      const res = await ApiClient.post("AgentMarkup/AddAgentMarkup", request);

      if (res?.success === true) {
        notifySuccess("success", res.message || (id == null ? "Agent markup added successfully" : "Agent markup updated successfully"));
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

  // ── Delete ──────────────────────────────────────────────────────────
  const openDeleteModal = (recordId) => {
    setDeleteId(recordId);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    ApiClient.put(`AgentMarkup/DeleteAgentMarkup/${deleteId}`)
      .then((res) => {
        if (res?.success === true) {
          setDeleteId(null);
          setDeleteOpen(false);
          GetData();
          notifySuccess("success", res.message || "Agent markup deleted successfully");
        } else if (res?.status === 409) {
          notifyWarning("warning", res.message);
        } else {
          notifyError("danger", res.message || "Something went wrong");
        }
      })
      .catch(() => {
        notifyError("danger", "Failed to delete agent markup");
      });
  };

  // ── Table Columns ───────────────────────────────────────────────────
  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      render: (_, m) => (
        <div className="d-flex align-items-center gap-3">
          <i
            className="fa fa-pencil-square-o text-warning"
            style={{ cursor: "pointer", fontSize: "16px" }}
            title="Edit"
            onClick={() => editRecord(m)}
          ></i>
          <i
            className="fa fa-trash-o text-danger"
            style={{ cursor: "pointer", fontSize: "16px" }}
            title="Delete"
            onClick={() => openDeleteModal(m.commId || m.id)}
          ></i>
        </div>
      ),
    },
    {
      title: 'Markup Type',
      dataIndex: 'markupType',
      key: 'markupType',
      render: (val) =>
        val === 1 ? (
          <span className="badge" style={{ backgroundColor: "#0d6efd", color: "#fff", padding: "5px 10px", borderRadius: "4px" }}>
            Percentage
          </span>
        ) : (
          <span className="badge" style={{ backgroundColor: "#6c757d", color: "#fff", padding: "5px 10px", borderRadius: "4px" }}>
            Fixed
          </span>
        ),
    },
    {
      title: 'Markup Value',
      dataIndex: 'markupValue',
      key: 'markupValue',
      render: (val, record) => (record.markupType === 1 ? `${val}%` : `${val}`),
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (val) => val || '-',
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (val) => (val ? new Date(val).toLocaleString() : '-'),
    },
  ];

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-header card-header--2">
            <h5>All Agent Markups</h5>
            <button type="button" className="btn btn-theme" onClick={handleOpenAdd}>
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
                loading={loading}
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
          <h6 className="mb-1">Are you sure you want to delete this agent markup?</h6>
          <small className="text-muted">This action cannot be undone.</small>
        </div>
      </Modal>

      {/* Add / Update Modal */}
      <Modal
        title={id == null ? "Add Agent Markup" : "Update Agent Markup"}
        open={open}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={id == null ? "Submit" : "Update"}
        cancelText="Cancel"
        width={460}
        centered
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <div className="row g-3">
            {/* Markup Type */}
            <div className="col-md-6">
              <Form.Item
                label="Markup Type"
                name="markupType"
                rules={[{ required: true, message: 'Please select markup type' }]}
              >
                <Select placeholder="Please select">
                  <Option value={0}>Fixed</Option>
                  <Option value={1}>Percentage</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Markup Value */}
            <div className="col-md-6">
              <Form.Item
                label="Markup Value"
                name="markupValue"
                rules={[{ required: true, message: 'Please enter markup value' }]}
              >
                <InputNumber
                  placeholder="0"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentMarkup;
