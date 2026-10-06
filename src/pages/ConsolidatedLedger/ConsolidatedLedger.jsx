import React, { useState, useEffect } from 'react';
import { Table, Form, Input, DatePicker, Select, Button, Row, Col, Card, message } from 'antd';
import moment from 'moment';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import ApiClient from '../../Helpers/ApiClient';
import './ConsolidatedLedger.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ConsolidatedLedger = () => {
    const user = useSelector(selectUser);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchType, setSearchType] = useState('LastOneHour');
    const navigate = useNavigate();

    const handleViewTicket = (referenceNumber) => {
        if (referenceNumber) {
            navigate(`/admin/hotel/ticket?ref=${referenceNumber}`);
        }
    };

    const fetchLedgerStatements = async (values = {}, page = 1) => {
        setLoading(true);
        try {
            const payload = {
                userId: user?.id || null,
                searchType: values.searchType || "LastOneHour",
                fromDate: (values.searchType === 'Custom' && values.dateRange) ? values.dateRange[0].format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null,
                toDate: (values.searchType === 'Custom' && values.dateRange) ? values.dateRange[1].format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null,
                referenceNumber: values.referenceNumber || null,
                bookingStatus: values.bookingStatus || null,
                transactionType: values.transactionType || null,
                isDebit: true,
                page: page - 1 // Assuming 0-indexed page in API
            };

            const response = await ApiClient.post('Deposits/LedgerStatements', payload);
            console.log("Fetching with payload:", payload);

            if (response && (response.success || response.statusCode === 200)) {
                const results = response.data?.results || (Array.isArray(response.data) ? response.data : []);
                setData(results);
                setPagination({
                    ...pagination,
                    current: (response.data?.page || 0) + 1,
                    total: response.data?.totalRecords || results.length
                });
            } else {
                message.error(response?.message || 'Failed to fetch ledger statements');
            }
            setLoading(false);

        } catch (error) {
            console.error("Failed to fetch ledger statements", error);
            message.error('An error occurred while fetching ledger statements');
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchLedgerStatements();
    }, []);

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
            render: (text) => text ? (
                <a href="#!" onClick={(e) => { e.preventDefault(); handleViewTicket(text); }} style={{ color: '#1890ff', fontWeight: 500 }}>
                    {text}
                </a>
            ) : 'N/A'
        },
        { title: 'User ID', dataIndex: 'userId', key: 'userId' },

        { title: 'Company Name', dataIndex: 'companyName', key: 'companyName' },
        { title: 'Booking Status', dataIndex: 'bookingStatus', key: 'bookingStatus' },
        { title: 'Transaction Type', dataIndex: 'transactionType', key: 'transactionType' },
        { title: 'Is Debit', dataIndex: 'isDebit', key: 'isDebit', render: (val) => val ? 'Yes' : 'No' },
        { title: 'Before Balance', dataIndex: 'beforeBalance', key: 'beforeBalance' }
    ];

    return (
        <div className="ledger-statement-container">
            <Card title="Ledger Statement" className="ledger-statement-card">
                <Form
                    form={form}
                    name="ledger-filters"
                    onFinish={onFinish}
                    onValuesChange={(changedValues) => {
                        if (changedValues.searchType) {
                            setSearchType(changedValues.searchType);
                        }
                    }}
                    layout="vertical"
                    className="filter-form"
                    initialValues={{ searchType: 'LastOneHour' }}
                >
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="searchType" label="Search Type">
                                <Select placeholder="Select Search Type">
                                    <Option value="LastOneHour">LastOneHour</Option>
                                    <Option value="Today">Today</Option>
                                    <Option value="Yesterday">Yesterday</Option>
                                    <Option value="LastWeek">Last Week</Option>
                                    <Option value="Custom">Custom Dates</Option>
                                </Select>
                            </Form.Item>
                        </Col>
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
                        <Col span={6}>
                            <Form.Item name="referenceNumber" label="Reference Number">
                                <Input placeholder="Enter Ref Number" />
                            </Form.Item>
                        </Col>
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
                        {/* <Col span={6}>
                            <Form.Item name="transactionType" label="Transaction Type">
                                <Select allowClear placeholder="Select Type">
                                    <Option value={0}>Type 0</Option>
                                    <Option value={1}>Type 1</Option>
                                </Select>
                            </Form.Item>
                        </Col> */}
                        {/* <Col span={6}>
                            <Form.Item name="isDebit" label="Is Debit">
                                <Select allowClear placeholder="Debit / Credit">
                                    <Option value={true}>Debit</Option>
                                    <Option value={false}>Credit</Option>
                                </Select>
                            </Form.Item>
                        </Col> */}
                    </Row>
                    <Row justify="end">
                        <Col>
                            <Button type="primary" htmlType="submit">
                                Search
                            </Button>
                            <Button
                                style={{ marginLeft: '8px' }}
                                onClick={() => {
                                    form.resetFields();
                                    fetchLedgerStatements({}, 1);
                                }}
                            >
                                Reset
                            </Button>
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
                />
            </Card>
        </div>
    );
};

export default ConsolidatedLedger;
