import React, { useState, useEffect } from 'react';
import { Table, Form, Input, DatePicker, Select, Button, Row, Col, Card, Space, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import ApiClient from '../../Helpers/ApiClient';
import { useSelector } from 'react-redux';
import './LedgerStatement.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;

const LedgerStatement = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchType, setSearchType] = useState('LastOneHour');
    const [reportFor, setReportFor] = useState('Self');
    const [usersList, setUsersList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const navigate = useNavigate();

    // Get logged-in user from Redux
    const { user } = useSelector((state) => state.auth);

    // Fetch users list for "Specific Company" option
    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await ApiClient.get('Users/GetUsers');
            if (res && res.success) {
                setUsersList(res.data || []);
            } else {
                message.error('Failed to fetch users');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchLedgerStatements();
    }, []);

    const handleViewTicket = (referenceNumber) => {
        if (referenceNumber) {
            navigate(`/admin/flight/ticket?ref=${referenceNumber}`);
        }
    };

    const fetchLedgerStatements = async (values = {}, page = 1) => {
        setLoading(true);
        try {
            // Determine userId based on report type
            let userId = null;
            if (values.reportFor === 'Self' || !values.reportFor) {
                userId = 0 || null;
            } else if (values.reportFor === 'Specific' && values.companyUserId) {
                userId = values.companyUserId;
            }

            const payload = {
                userId: userId,
                searchType: values.searchType || 'LastOneHour',
                fromDate: (values.searchType === 'Custom' && values.dateRange)
                    ? values.dateRange[0].format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
                    : null,
                toDate: (values.searchType === 'Custom' && values.dateRange)
                    ? values.dateRange[1].format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
                    : null,
                referenceNumber: values.referenceNumber || null,
                bookingStatus: values.bookingStatus || null,
                transactionType: values.transactionType || null,
                isDebit: true,
                page: page - 1,
            };

            console.log('Fetching with payload:', payload);
            const response = await ApiClient.post('Deposits/LedgerStatements', payload);

            if (response && (response.success || response.statusCode === 200)) {
                const results = response.data?.results || (Array.isArray(response.data) ? response.data : []);
                setData(results);
                setPagination({
                    ...pagination,
                    current: (response.data?.page || 0) + 1,
                    total: response.data?.totalRecords || results.length,
                });
            } else {
                message.error(response?.message || 'Failed to fetch ledger statements');
            }
        } catch (error) {
            console.error('Failed to fetch ledger statements', error);
            message.error('An error occurred while fetching ledger statements');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = (values) => {
        fetchLedgerStatements(values, 1);
    };

    const handleTableChange = (newPagination) => {
        fetchLedgerStatements(form.getFieldsValue(), newPagination.current);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Reference Number',
            dataIndex: 'referenceNumber',
            key: 'referenceNumber',
            render: (text) =>
                text ? (
                    <a
                        href="#!"
                        onClick={(e) => { e.preventDefault(); handleViewTicket(text); }}
                        style={{ color: '#1890ff', fontWeight: 500 }}
                    >
                        {text}
                    </a>
                ) : 'N/A',
        },
        { title: 'User ID', dataIndex: 'userId', key: 'userId' },
        { title: 'Company Name', dataIndex: 'companyName', key: 'companyName' },
        { title: 'Booking Status', dataIndex: 'bookingStatus', key: 'bookingStatus' },
        { title: 'Transaction Type', dataIndex: 'transactionType', key: 'transactionType' },
        { title: 'Is Debit', dataIndex: 'isDebit', key: 'isDebit', render: (val) => (val ? 'Yes' : 'No') },
        { title: 'Before Balance', dataIndex: 'beforeBalance', key: 'beforeBalance' },
    ];

    return (
        <div className="ledger-statement-container">
            <Card
                title="Ledger Statement"
                className="ledger-statement-card"
                extra={
                    <button type="button" className="btn btn-theme" onClick={() => alert('Consolidation Ledger coming soon')}>
                        Consolidation Ledger
                    </button>
                }
            >
                <Form
                    form={form}
                    name="ledger-filters"
                    onFinish={onFinish}
                    onValuesChange={(changedValues) => {
                        if (changedValues.searchType) {
                            setSearchType(changedValues.searchType);
                        }
                        if (changedValues.reportFor) {
                            setReportFor(changedValues.reportFor);
                            // Clear company selection when switching type
                            form.setFieldsValue({ companyUserId: undefined });
                        }
                    }}
                    layout="vertical"
                    className="filter-form"
                    initialValues={{ searchType: 'LastOneHour', reportFor: 'Self' }}
                >
                    <Row gutter={16}>
                        {/* Report For */}
                        <Col span={6}>
                            <Form.Item name="reportFor" label="Report For">
                                <Select>
                                    <Option value="Self">Self</Option>
                                    <Option value="Specific">Specific Company</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Company dropdown — only when "Specific" is selected */}
                        {reportFor === 'Specific' && (
                            <Col span={6}>
                                <Form.Item name="companyUserId" label="Select Company">
                                    <Select
                                        showSearch
                                        allowClear
                                        loading={usersLoading}
                                        placeholder="Select company..."
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={usersList.map((u) => ({
                                            value: u.id,
                                            label: u.companyName || u.userName || `User #${u.id}`,
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                        )}

                        {/* Search Type */}
                        <Col span={6}>
                            <Form.Item name="searchType" label="Search Type">
                                <Select placeholder="Select Search Type">
                                    <Option value="LastOneHour">Last One Hour</Option>
                                    <Option value="Today">Today</Option>
                                    <Option value="Yesterday">Yesterday</Option>
                                    <Option value="LastWeek">Last Week</Option>
                                    <Option value="Custom">Custom Dates</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Date Range — only when Custom */}
                        {searchType === 'Custom' && (
                            <Col span={6}>
                                <Form.Item name="dateRange" label="Date Range">
                                    <RangePicker 
                                        style={{ width: '100%' }} 
                                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                                    />
                                </Form.Item>
                            </Col>
                        )}

                        {/* Reference Number */}
                        <Col span={6}>
                            <Form.Item name="referenceNumber" label="Reference Number">
                                <Input placeholder="Enter Ref Number" />
                            </Form.Item>
                        </Col>

                        {/* Booking Status */}
                        <Col span={6}>
                            <Form.Item name="bookingStatus" label="Booking Status">
                                <Select allowClear placeholder="Select Status">
                                    <Option value="Pending">Pending</Option>
                                    <Option value="Confirmed">Confirmed</Option>
                                    <Option value="Failed">Failed</Option>
                                    <Option value="Hold">Hold</Option>
                                    <Option value="CancelPending">CancelPending</Option>
                                    <Option value="CancelConfirmed">CancelConfirmed</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row justify="end">
                        <Col>
                            <Space>
                                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                                    Search
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        form.resetFields();
                                        setReportFor('Self');
                                        setSearchType('LastOneHour');
                                        fetchLedgerStatements({}, 1);
                                    }}
                                >
                                    Reset
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>

                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    style={{ marginTop: '20px' }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </div>
    );
};

export default LedgerStatement;
