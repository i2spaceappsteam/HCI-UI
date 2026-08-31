import React, { useEffect, useState } from 'react';
import { Form, Modal, Input, Row, Col, Table, Select } from 'antd';
import ApiClient from '../Helpers/ApiClient';
import { notifySuccess, notifyError } from '../../public/js/notify/notify';

const UserIpConfig = () => {
  const [form] = Form.useForm();
  const [ipList, setIpList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Fetch IP Addresses ────────────────────────────────────────────
  function fetchIpAddresses() {
    setLoading(true);
    ApiClient.get('UserIpConfig/GetUserIpAddresses')
      .then((res) => {
        if (res?.success === true) {
          setIpList(res.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  // ── Fetch Users ───────────────────────────────────────────────────
  function GetUsers() {
    ApiClient.get('Users/GetUsers')
      .then((res) => {
        console.log('Users API Response:', res);
        if (res.success === true) {
          console.log('Users data received:', res.data);
          setUsersList(res.data || []);
        } else {
          console.warn('Users API returned success=false');
          setUsersList([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setUsersList([]);
      });
  }

  useEffect(() => {
    fetchIpAddresses();
    GetUsers();
  }, []);

  // ── Add / Update ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        id: editId ?? 0,
        userId: values.userId,
        ipAddress: values.ipAddress,
      };
      const res = await ApiClient.post('UserIpConfig/AddOrUpdateIpAddress', payload);
      if (res?.success === true) {
        notifySuccess('success', res.message || 'Saved successfully');
        setOpen(false);
        form.resetFields();
        setEditId(null);
        fetchIpAddresses();
      } else {
        notifyError('danger', res?.message || 'Something went wrong');
      }
    } catch (err) {
      // Ant Design validation error — no action needed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setEditId(null);
  };

  // ── Edit ──────────────────────────────────────────────────────────
  function editRecord(record) {
    form.setFieldsValue({
      userId: record.userId,
      ipAddress: record.ipAddress,
    });
    setEditId(record.id);
    setOpen(true);
  }

  // ── Delete ────────────────────────────────────────────────────────
  function openDeleteModal(id) {
    setDeleteId(id);
    setDeleteOpen(true);
  }

  function handleDelete() {
    ApiClient.put(`UserIpConfig/DeleteIpAddress/${deleteId}`)
      .then((res) => {
        if (res?.success === true) {
          notifySuccess('success', res.message || 'Deleted successfully');
          setDeleteId(null);
          setDeleteOpen(false);
          fetchIpAddresses();
        } else {
          notifyError('danger', res?.message || 'Delete failed');
        }
      })
      .catch(() => {});
  }

  // ── Helper: resolve userId → companyName for display ─────────────────
  function getUserName(userId) {
    const user = usersList.find((u) => u.id == userId || u.userId == userId);
    return user ? (user.companyName || user.userName || user.name || userId) : userId;
  }

  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      render: (_, item) => (
        <div className="d-flex align-items-center gap-3">
          <i
            className="fa fa-pencil-square-o text-warning"
            style={{ cursor: 'pointer' }}
            title="Edit"
            onClick={() => editRecord(item)}
          ></i>
          <i
            className="fa fa-trash-o text-danger"
            style={{ cursor: 'pointer' }}
            title="Delete"
            onClick={() => openDeleteModal(item.id)}
          ></i>
        </div>
      ),
    },
    { title: 'User', dataIndex: 'companyName', key: 'companyName' },
    { title: 'IP Address', dataIndex: 'ipAddress', key: 'ipAddress' },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
    { title: 'Created Date', dataIndex: 'createdDate', key: 'createdDate' },
    { title: 'Modified By', dataIndex: 'modifiedBy', key: 'modifiedBy' },
    { title: 'Modified Date', dataIndex: 'modifiedDate', key: 'modifiedDate' },
  ];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="row">
      <style>{`
        .ant-select-input {
          background: transparent !important;
        }
        .ant-select-selector {
          align-items: center !important;
          background: #ffffff !important;
          border-color: #cbd5e1 !important;
        }
        .ant-select-selection-item {
          color: #1e293b !important;
          font-weight: 500;
        }
        .ant-select-selection-placeholder {
          color: #94a3b8 !important;
        }
        .ant-select-selection-search-input {
          color: #1e293b !important;
        }
      `}</style>
      <div className="col-sm-12">
        <div className="card">

          {/* Header */}
          <div className="card-header card-header--2">
            <h5>User IP Config</h5>
            <button
              type="button"
              className="btn btn-theme"
              onClick={() => setOpen(true)}
            >
              <i data-feather="plus-square"></i> Add New
            </button>
          </div>

          {/* Table */}
          <div className="card-body">
            <div className="table-responsive table-desi">
              <Table 
                columns={columns} 
                dataSource={ipList} 
                size="small" 
                scroll={{ x: 'max-content' }} 
                rowKey={(record) => record.id || record.ipAddress}
                pagination={{ pageSize: 10 }}
                loading={loading}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── Delete Confirm Modal ─────────────────────────────────── */}
      <Modal open={deleteOpen} footer={null} closable={false} width={420} centered>
        <div className="card mb-0">
          <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between">
            <h6 className="mb-0">Confirm Delete</h6>
            <i
              className="fa fa-times cursor-pointer"
              style={{ fontSize: '16px' }}
              onClick={() => setDeleteOpen(false)}
            ></i>
          </div>
          <div className="card-body text-center py-4">
            <i className="fa fa-trash text-danger fs-2 mb-2"></i>
            <h6 className="mb-1">Are you sure you want to delete this IP address?</h6>
            <small className="text-muted">This action cannot be undone.</small>
          </div>
          <div className="card-footer text-center py-2">
            <button className="btn btn-danger me-2 px-4" onClick={handleDelete}>
              Delete
            </button>
            <button
              className="btn btn-outline-secondary px-4"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Add / Update Modal ───────────────────────────────────── */}
      <Modal
        open={open}
        footer={null}
        closable={false}
        centered
        width={500}
        onCancel={handleCancel}
      >
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>{editId === null ? 'Add IP Address' : 'Update IP Address'}</h5>
            <button type="button" className="btn-close" onClick={handleCancel}></button>
          </div>
          <div className="card-body">
            <Form layout="vertical" form={form} className="theme-form mega-form">
              <Row gutter={16}>
                {/* User dropdown */}
                <Col span={24}>
                  <Form.Item
                    label="User"
                    name="userId"
                    rules={[{ required: true, message: 'Please select a user' }]}
                  >
                    <Select
                      showSearch
                      placeholder="-- Select Company --"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      style={{ width: '100%', height: '36px' }}
                    >
                      {usersList && usersList.length > 0 ? (
                        usersList.map(item => (
                          <Select.Option 
                            key={item.id || item.userId} 
                            value={item.id || item.userId}
                          >
                            {item.companyName || item.userName || item.name || 'Unknown'}
                          </Select.Option>
                        ))
                      ) : (
                        <Select.Option value="" disabled>No users available</Select.Option>
                      )}
                    </Select>
                  </Form.Item>
                </Col>

                {/* IP Address */}
                <Col span={24}>
                  <Form.Item
                    label="IP Address"
                    name="ipAddress"
                    rules={[
                      { required: true, message: 'IP Address is required' },
                      {
                        pattern: /^(\d{1,3}\.){3}\d{1,3}$|^\*$/,
                        message: 'Enter a valid IP address (e.g. 192.168.1.1)',
                      },
                    ]}
                  >
                    <Input placeholder="e.g. 192.168.1.1" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
          <div className="card-footer text-end">
            <button className="btn btn-primary me-3" onClick={handleSubmit}>
              {editId === null ? 'Submit' : 'Update'}
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

export default UserIpConfig;
