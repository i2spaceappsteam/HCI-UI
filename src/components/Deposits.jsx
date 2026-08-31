import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, DatePicker, Select, Space, Modal, message, Row, Col, Table } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ApiClient from '../Helpers/ApiClient';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const Deposits = () => {
    const { user } = useSelector((state) => state.auth);
    const [deposits, setDeposits] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [balanceModalVisible, setBalanceModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState(''); // 'Approve', 'Reject', 'Add', 'Revoke'
    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [editedRemarks, setEditedRemarks] = useState({});
    const [modalForm] = Form.useForm();
    const [createForm] = Form.useForm();
    const [searchForm] = Form.useForm();

    const fetchDeposits = async (values = {}) => {
        setLoading(true);
        try {
            const payload = {
                fromDate: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : null,
                toDate: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : null,
                userId:  0,
                approvalStatus: values.approvalStatus || "Pending"
            };

            const response = await ApiClient.post('Deposits/GetDeposits', payload);
            if (response && response.success) {
                setDeposits(response.data || []);
            } else {
                message.error(response.message || 'Failed to fetch deposits');
            }
        } catch (error) {
            console.error(error);
            message.error('An error occurred while fetching deposits');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await ApiClient.get("Users/GetUsers");
            if (res && res.success) {
                setUsersList(res.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const onSearch = (values) => {
        fetchDeposits(values);
    };

    const handleActionClick = (record, action) => {
        setSelectedDeposit(record);
        setModalAction(action);
        modalForm.resetFields();
        
        if (action === 'UpdateStatus') {
            modalForm.setFieldsValue({ approvalStatus: 'Approved' });
            setStatusModalVisible(true);
        } else {
            modalForm.setFieldsValue({ 
                userId: record.userId,
                action: action,
                amount: record.amount,
                referenceNumber: record.referenceNumber,
                transactionId: record.transactionId,
                remarks: record.remarks,
                paymentMode: record.paymentMode != null ? record.paymentMode.toString() : "0",
                depositDate: record.depositDate ? dayjs(record.depositDate) : dayjs()
            });
            setBalanceModalVisible(true);
        }
    };

    const handleStatusSubmit = async (values) => {
        setModalLoading(true);
        try {
            const payload = {
                depositId: selectedDeposit.depositId,
                approvalStatus: values.approvalStatus,
                remarks: values.remarks || ''
            };

            const response = await ApiClient.post('Deposits/UpdateDeposit', payload);
            if (response && response.success) {
                message.success(`Deposit status updated successfully!`);
                setStatusModalVisible(false);
                fetchDeposits(searchForm.getFieldsValue());
            } else {
                message.error(response.message || `Failed to update deposit status`);
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateRemark = async (record) => {
        setLoading(true);
        try {
            let status = 'Pending';
            if (record.approvalStatus === 'Approved' || parseInt(record.approvalStatus) === 1) status = 'Approved';
            else if (record.approvalStatus === 'Rejected' || parseInt(record.approvalStatus) === 2) status = 'Rejected';

            const newRemark = editedRemarks[record.depositId] !== undefined ? editedRemarks[record.depositId] : record.remarks;

            const payload = {
                depositId: record.depositId,
                approvalStatus: status,
                remarks: newRemark || ''
            };

            const response = await ApiClient.post('Deposits/UpdateDeposit', payload);
            if (response && response.success) {
                message.success(`Deposit updated successfully!`);
                setEditedRemarks(prev => {
                    const next = { ...prev };
                    delete next[record.depositId];
                    return next;
                });
                fetchDeposits(searchForm.getFieldsValue());
            } else {
                message.error(response.message || `Failed to update deposit`);
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (values) => {
        setModalLoading(true);
        try {
            const payload = {
                id: 0,
                amount: parseFloat(values.amount) || 0,
                referenceNumber: values.referenceNumber || "",
                paymentMode: parseInt(values.paymentMode) || 0,
                depositDate: values.depositDate ? values.depositDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                transactionId: values.transactionId || "",
                remarks: values.remarks || "",
                adminRemarks: values.remarks || "",
                approvalStatus: 0
            };

            const response = await ApiClient.post('Deposits/DepositRequest', payload);
            if (response && response.success) {
                message.success('Deposit requested successfully!');
                setCreateModalVisible(false);
                createForm.resetFields();
                fetchDeposits(searchForm.getFieldsValue());
            } else {
                message.error(response.message || 'Failed to create deposit');
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setModalLoading(false);
        }
    };

    const handleBalanceSubmit = async (values) => {
        setModalLoading(true);
        try {
            const action = values.action; // Get action from form values
            const endpoint = action === 'Add' ? `Deposits/AddBalance/${values.userId}` : `Deposits/RevokeBalance/${values.userId}`;
            
            const payload = {
                id: values.userId || 0,
                amount: parseFloat(values.amount) || 0,
                referenceNumber: values.referenceNumber || "",
                paymentMode: parseInt(values.paymentMode) || 0,
                depositDate: values.depositDate ? values.depositDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : selectedDeposit?.depositDate || dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                transactionId: values.transactionId || "",
                remarks: values.remarks || "",
                adminRemarks: values.adminRemarks || "",
                approvalStatus: 0
            };

            console.log('Endpoint:', endpoint);
            console.log('Payload:', payload);

            const response = await ApiClient.post(endpoint, payload);
            if (response && response.success) {
                message.success(`Balance successfully ${action === 'Add' ? 'added' : 'revoked'}!`);
                setBalanceModalVisible(false);
                modalForm.resetFields();
                fetchDeposits(searchForm.getFieldsValue());
            } else {
                message.error(response.message || 'Action failed');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('An error occurred');
        } finally {
            setModalLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'depositId', key: 'depositId' },
        { title: 'Company', dataIndex: 'companyName', key: 'companyName' },
        { 
            title: 'Amount', 
            dataIndex: 'amount', 
            key: 'amount',
            render: (amount) => <strong>₹{amount}</strong>
        },
        { title: 'Ref Number', dataIndex: 'referenceNumber', key: 'referenceNumber' },
        { 
            title: 'Date', 
            dataIndex: 'depositDate', 
            key: 'depositDate',
            render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'N/A'
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                const statusInt = parseInt(record.approvalStatus);
                const isPending = record.approvalStatus === 'Pending' || statusInt === 0;
                const isApproved = record.approvalStatus === 'Approved' || statusInt === 1;
                
                const statusText = isPending ? 'Pending' : (isApproved ? 'Approved' : 'Rejected');
                const badgeClass = isApproved ? 'success' : (isPending ? 'warning' : 'danger');

                return (
                    <span className={`badge rounded-pill badge-${badgeClass}`}>
                        {statusText}
                    </span>
                );
            }
        },
        { 
            title: 'Remarks', 
            key: 'remarks',
            render: (_, record) => {
                const statusInt = parseInt(record.approvalStatus);
                const isPending = record.approvalStatus === 'Pending' || statusInt === 0;
                
                return isPending ? (
                    <Input 
                        value={editedRemarks[record.depositId] !== undefined ? editedRemarks[record.depositId] : record.remarks}
                        onChange={(e) => setEditedRemarks({ ...editedRemarks, [record.depositId]: e.target.value })}
                        placeholder="Remarks"
                    />
                ) : (
                    record.remarks
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const statusInt = parseInt(record.approvalStatus);
                const isPending = record.approvalStatus === 'Pending' || statusInt === 0;
                
                return isPending && (
                    <Space size="small">
                        <Button size="small" type="primary" onClick={() => handleActionClick(record, 'UpdateStatus')}>
                            Update Status
                        </Button>
                        {/* <Button size="small" type="primary" onClick={() => handleUpdateRemark(record)}>
                            Update
                        </Button> */}
                    </Space>
                );
            }
        }
    ];

    return (
        <div className="row">
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-header card-header--2">
                        <h5>Deposits Management</h5>
                        <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-theme"
                            onClick={() => { createForm.resetFields(); setCreateModalVisible(true); }}
                        >
                            <i data-feather="plus-square" className="me-2"></i> New Deposit
                        </button>
                            <button
                                type="button"
                                className="btn btn-theme"
                                onClick={() => { 
                                    modalForm.resetFields();
                                    setSelectedDeposit(null);
                                    modalForm.setFieldsValue({ 
                                        action: 'Add', 
                                        depositDate: dayjs(), 
                                        paymentMode: "0"
                                    });
                                    console.log('Opening Add/Revoke modal');
                                    setBalanceModalVisible(true); 
                                }}
                            >
                                <i data-feather="plus-square" className="me-2"></i> Add or Revoke
                            </button>
                        </div>
                    </div>

                    <div className="card-body">
                        <Form 
                            form={searchForm} 
                            layout="vertical" 
                            onFinish={onSearch}
                            className="mb-4"
                        >
                            <Row gutter={16} align="bottom">
                                <Col span={8}>
                                    <Form.Item name="dateRange" label="Date Range">
                                        <RangePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="approvalStatus" label="Status">
                                        <Select allowClear placeholder="Select Status">
                                            <Option value="All">All</Option>
                                            <Option value="Pending">Pending</Option>
                                            <Option value="Approved">Approved</Option>
                                            <Option value="Rejected">Rejected</Option>
                                            <Option value="Revoked">Revoked</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                                            Search
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>

                        <div className="table-responsive table-desi">
                            <Table 
                                columns={columns} 
                                dataSource={deposits} 
                                size="small" 
                                scroll={{ x: 'max-content' }} 
                                rowKey="depositId"
                                pagination={{ pageSize: 10 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Status Modal */}
            <Modal
                open={statusModalVisible}
                onCancel={() => setStatusModalVisible(false)}
                footer={null}
                closable={false}
                centered
            >
                <div className="card mb-0">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">{`Update Status for Deposit #${selectedDeposit?.depositId}`}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setStatusModalVisible(false)}
                        ></button>
                    </div>
                    <div className="card-body">
                        <Form form={modalForm} layout="vertical" onFinish={handleStatusSubmit}>
                    <Form.Item
                        name="approvalStatus"
                        label="Status"
                        rules={[{ required: true, message: 'Please select a status' }]}
                    >
                        <Select>
                            <Option value="Approved">Approve</Option>
                            <Option value="Rejected">Reject</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item 
                        name="remarks" 
                        label="Remarks" 
                        dependencies={['approvalStatus']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (getFieldValue('approvalStatus') === 'Rejected' && !value) {
                                        return Promise.reject(new Error('Remarks are required when rejecting a deposit'));
                                    }
                                    return Promise.resolve();
                                },
                            })
                        ]}
                    >
                        <TextArea rows={4} placeholder="Enter your remarks here..." />
                    </Form.Item>
                    <Form.Item className="text-end mb-0">
                        <Space>
                            <Button onClick={() => setStatusModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={modalLoading}>
                                Submit
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
                </div>
                </div>
            </Modal>

            {/* Create Deposit Modal */}
            <Modal
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                footer={null}
                closable={false}
                centered
            >
                <div className="card mb-0">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Create New Deposit</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setCreateModalVisible(false)}
                        ></button>
                    </div>
                    <div className="card-body">
                        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Required' }]}>
                                <Input type="number" prefix="₹" min={0} onWheel={(e) => e.target.blur()} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="depositDate" label="Deposit Date" rules={[{ required: true, message: 'Required' }]}>
                                <DatePicker style={{ width: '100%' }} showTime />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="paymentMode" label="Payment Mode">
                                <Select>
                                    <Option value="0">Cash</Option>
                                    <Option value="1">Bank Transfer</Option>
                                    <Option value="2">UPI</Option>
                                    <Option value="3">Cheque</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="referenceNumber" label="Reference Number">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="transactionId" label="Transaction ID">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="remarks" label="Remarks">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item className="text-end mb-0">
                        <Space>
                            <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={modalLoading}>Submit</Button>
                        </Space>
                    </Form.Item>
                </Form>
                </div>
                </div>
            </Modal>

            {/* Add / Revoke Balance Modal */}
            <Modal
                open={balanceModalVisible}
                onCancel={() => setBalanceModalVisible(false)}
                footer={null}
                closable={false}
                centered
            >
                <div className="card mb-0">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">{selectedDeposit ? `Add or Revoke Balance (Deposit #${selectedDeposit.depositId})` : `Add or Revoke Balance`}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setBalanceModalVisible(false)}
                        ></button>
                    </div>
                    <div className="card-body">
                        <Form form={modalForm} layout="vertical" onFinish={handleBalanceSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="userId" label="User / Company" rules={[{ required: true, message: 'Required' }]}>
                                <Select 
                                    showSearch 
                                    placeholder="Select a company"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {usersList.map(u => (
                                        <Option key={u.id} value={u.id}>{u.companyName} ({u.userName})</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="action" label="Action" rules={[{ required: true, message: 'Required' }]}>
                                <Select>
                                    <Option value="Add">Add Balance</Option>
                                    <Option value="Revoke">Revoke Balance</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Required' }]}>
                                <Input type="number" prefix="₹" min={0} onWheel={(e) => e.target.blur()} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="depositDate" label="Deposit Date">
                                <DatePicker style={{ width: '100%' }} showTime />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="paymentMode" label="Payment Mode">
                                <Select>
                                    <Option value="0">Cash</Option>
                                    <Option value="1">Bank Transfer</Option>
                                    <Option value="2">UPI</Option>
                                    <Option value="3">Cheque</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="referenceNumber" label="Reference Number">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="transactionId" label="Transaction ID">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="remarks" label="Remarks">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="adminRemarks" label="Admin Remarks">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item className="text-end mb-0">
                        <Space>
                            <Button onClick={() => setBalanceModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={modalLoading}>
                                Submit
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
                </div>
                </div>
            </Modal>
        </div>
    );
};

export default Deposits;
