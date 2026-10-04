import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import ApiClient from '../../Helpers/ApiClient';

const Operator = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Fetch all operators
  const fetchOperators = async () => {
    setLoading(true);
    try {
      const response = await ApiClient.get('Operator/GetAll');
      if (response.success && response.data) {
        setOperators(response.data);
      } else {
        message.error(response.message || 'Failed to fetch operators');
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
      message.error('Failed to fetch operators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  // Add new operator
  const handleAdd = async (values) => {
    setLoading(true);
    try {
      const response = await ApiClient.post('Operator/Add', {
        airLineName: values.airLineName,
        airLineCode: values.airLineCode,
      });

      if (response.success) {
        message.success('Operator added successfully');
        fetchOperators();
        handleModalClose();
      } else {
        message.error(response.message || 'Failed to add operator');
      }
    } catch (error) {
      console.error('Error adding operator:', error);
      message.error('Failed to add operator');
    } finally {
      setLoading(false);
    }
  };

  // Update operator
  const handleUpdate = async (values) => {
    if (!editingOperator) return;

    setLoading(true);
    try {
      const response = await ApiClient.put(`Operator/Update/${editingOperator.id}`, {
        airLineName: values.airLineName,
        airLineCode: values.airLineCode,
      });

      if (response.success) {
        message.success('Operator updated successfully');
        fetchOperators();
        handleModalClose();
      } else {
        message.error(response.message || 'Failed to update operator');
      }
    } catch (error) {
      console.error('Error updating operator:', error);
      message.error('Failed to update operator');
    } finally {
      setLoading(false);
    }
  };

  // Delete operator
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await ApiClient.delete(`Operator/Delete/${deletingId}`);

      if (response.success) {
        message.success('Operator deleted successfully');
        setDeleteModalVisible(false);
        setDeletingId(null);
        fetchOperators();
      } else {
        message.error(response.message || 'Failed to delete operator');
      }
    } catch (error) {
      console.error('Error deleting operator:', error);
      message.error('Failed to delete operator');
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const showAddModal = () => {
    setEditingOperator(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingOperator(record);
    form.setFieldsValue({
      airLineName: record.airlineName,
      airLineCode: record.airlineCode,
    });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingOperator(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (editingOperator) {
      handleUpdate(values);
    } else {
      handleAdd(values);
    }
  };

  // Filter operators based on search
  const filteredOperators = operators.filter(
    (op) =>
      op.airlineName?.toLowerCase().includes(searchText.toLowerCase()) ||
      op.airlineCode?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Table columns
  const columns = [
    {
      title: 'Airline Name',
      dataIndex: 'airlineName',
      key: 'airlineName',
      sorter: (a, b) => a.airlineName.localeCompare(b.airlineName),
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Airline Code',
      dataIndex: 'airlineCode',
      key: 'airlineCode',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 180,
      render: (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString();
      },
    },
    {
      title: 'Updated Date',
      dataIndex: 'updatedDate',
      key: 'updatedDate',
      width: 180,
      render: (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <div className="d-flex align-items-center gap-3">
          <i
            className="fa fa-pencil-square-o text-warning"
            style={{ cursor: 'pointer', fontSize: '16px' }}
            title="Edit"
            onClick={() => showEditModal(record)}
          ></i>
          <i
            className="fa fa-trash-o text-danger"
            style={{ cursor: 'pointer', fontSize: '16px' }}
            title="Delete"
            onClick={() => {
              setDeletingId(record.id);
              setDeleteModalVisible(true);
            }}
          ></i>
        </div>
      ),
    },
  ];

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-header card-header--2">
            <h5>Operator Management</h5>
            <button
              type="button"
              className="btn btn-theme"
              onClick={showAddModal}
            >
              <i data-feather="plus-square" className="me-1"></i> Add Operator
            </button>
          </div>

          <div className="card-body">
            {/* Search */}
            <div className="mb-3" style={{ maxWidth: 360 }}>
              <Input
                placeholder="Search by airline name or code..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>

            {/* Table */}
            <div className="table-responsive table-desi">
              <Table
                columns={columns}
                dataSource={filteredOperators}
                loading={loading}
                rowKey="id"
                size="small"
                scroll={{ x: 'max-content' }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} operators`,
                }}
                bordered
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={isModalVisible}
        footer={null}
        closable={false}
        width={560}
        centered
        destroyOnHidden
      >
        <div className="card mb-0">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {editingOperator ? 'Edit Operator' : 'Add New Operator'}
            </h5>
            <button type="button" className="btn-close" onClick={handleModalClose}></button>
          </div>

          <div className="card-body">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              className="theme-form"
            >
              <Form.Item
                name="airLineName"
                label="Airline Name"
                rules={[
                  { required: true, message: 'Please enter airline name' },
                  { min: 2, message: 'Airline name must be at least 2 characters' },
                  { max: 100, message: 'Airline name must not exceed 100 characters' },
                ]}
              >
                <Input placeholder="Enter airline name (e.g., Air India)" />
              </Form.Item>

              <Form.Item
                name="airLineCode"
                label="Airline Code"
                rules={[
                  { required: true, message: 'Please enter airline code' },
                  {
                    pattern: /^[A-Z0-9]{2,3}$/,
                    message: 'Airline code must be 2-3 uppercase letters/numbers',
                  },
                ]}
              >
                <Input
                  placeholder="Enter airline code (e.g., AI, 6E)"
                  maxLength={3}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>

              <div className="card-footer text-end py-2 px-0">
                <Space>
                  <button type="button" className="btn btn-outline-secondary px-4" onClick={handleModalClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-theme px-4" disabled={loading}>
                    {loading ? 'Saving...' : editingOperator ? 'Update' : 'Add'}
                  </button>
                </Space>
              </div>
            </Form>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteModalVisible} footer={null} closable={false} width={420} centered>
        <div className="card mb-0">
          <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between">
            <h6 className="mb-0">Confirm Delete</h6>
            <i
              className="fa fa-times cursor-pointer"
              style={{ fontSize: '16px' }}
              onClick={() => { setDeleteModalVisible(false); setDeletingId(null); }}
            ></i>
          </div>

          <div className="card-body text-center py-4">
            <i className="fa fa-trash text-danger fs-2 mb-2"></i>
            <h6 className="mb-1">Are you sure you want to delete this operator?</h6>
            <small className="text-muted">This action cannot be undone.</small>
          </div>

          <div className="card-footer text-center py-2">
            <button className="btn btn-danger me-2 px-4" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </button>
            <button
              className="btn btn-outline-secondary px-4"
              onClick={() => { setDeleteModalVisible(false); setDeletingId(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Operator;
