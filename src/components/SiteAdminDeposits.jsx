import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, DatePicker, Select, Space, Modal, message, Row, Col, Table } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ApiClient from '../Helpers/ApiClient';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const SiteAdminDeposits = () => {
    const { user } = useSelector((state) => state.auth);
    const [deposits, setDeposits] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    
    const [createForm] = Form.useForm();
    const [searchForm] = Form.useForm();

    const fetchDeposits = async (values = {}) => {
        setLoading(true);
        try {
            const payload = {
                fromDate: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : null,
                toDate: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : null,
                userId:  user?.UserID || user?.id || 0,
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

    const handleCreateSubmit = async (values) => {
        setModalLoading(true);
        try {
            const payload = {
                id: user?.UserID || user?.id || 0,
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
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' }
    ];

    return (
        <div className="row">
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-header card-header--2">
                        <h5>Deposits Management (Site Admin)</h5>
                        <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-theme"
                            onClick={() => { createForm.resetFields(); setCreateModalVisible(true); }}
                        >
                            <i data-feather="plus-square" className="me-2"></i> New Deposit
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

        </div>
    );
};

export default SiteAdminDeposits;
