import React, { useState, useEffect } from 'react';
import { Button, Form, Input, DatePicker, Select, Row, Col, Tag, Space, message, Tooltip, Table } from 'antd';
import { SearchOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import ApiClient from '../Helpers/ApiClient';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const BookingReports = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchType, setSearchType] = useState('LastOneHour');
    const [reportFor, setReportFor] = useState('Self');
    const [usersList, setUsersList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [searchForm] = Form.useForm();

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await ApiClient.get('Users/GetUsers');
            if (res && res.success) {
                setUsersList(res.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchBookings = async (values = {}, page = 0) => {
        setLoading(true);
        try {
            // Determine userId based on report type
            const rf = values.reportFor ?? reportFor;
            let userId = null;
            if (rf === 'Self') {
                userId = null;
            } else if (rf === 'Specific' && values.companyUserId) {
                userId = values.companyUserId;
            }

            const payload = {
                userId,
                searchType: values.searchType || 'LastOneHour',
                fromDate: (values.searchType === 'Custom' && values.dateRange) ? values.dateRange[0].format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null,
                toDate: (values.searchType === 'Custom' && values.dateRange) ? values.dateRange[1].format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null,
                referenceNumber: values.referenceNumber || null,
                pnr: values.pnr || null,
                bookingStatus: values.bookingStatus || null,
                page: page
            };

            const response = await ApiClient.post('HotelBooking/GetBookingReports', payload);
            if (response && (response.success || response.statusCode === 200)) {
                const results = response.data?.results || (Array.isArray(response.data) ? response.data : []);
                setBookings(results);
                setCurrentPage(page);
            } else {
                message.error(response?.message || 'Failed to fetch booking reports');
            }
        } catch (error) {
            console.error(error);
            message.error('An error occurred while fetching booking reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchBookings();
    }, []);

    const onSearch = (values) => {
        fetchBookings(values, 0);
    };

    const handleReset = () => {
        searchForm.resetFields();
        setReportFor('Self');
        setSearchType('LastOneHour');
        fetchBookings({}, 0);
    };

    const handleViewTicket = (bookingRef) => {
        if (bookingRef) {
            navigate(`/admin/hotel/ticket?ref=${bookingRef}`);
        }
    };

    const getStatusTag = (status) => {
        const statusStr = typeof status === 'string' ? status : '';
        const statusLower = statusStr.toLowerCase();

        if (statusLower === 'confirmed' || statusLower === 'booked') {
            return <Tag color="green">{statusStr}</Tag>;
        } else if (statusLower === 'pending' || statusLower === 'hold') {
            return <Tag color="orange">{statusStr}</Tag>;
        } else if (statusLower === 'cancelled' || statusLower === 'failed') {
            return <Tag color="red">{statusStr}</Tag>;
        } else if (statusLower === 'refunded') {
            return <Tag color="blue">{statusStr}</Tag>;
        }
        return <Tag>{statusStr || 'N/A'}</Tag>;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return dayjs(dateStr).format('DD-MM-YYYY HH:mm');
    };

    const columns = [
        {
            title: 'S.No',
            key: 'sNo',
            render: (text, record, index) => (currentPage * 25) + index + 1,
        },
        {
            title: 'Booking Ref',
            dataIndex: 'bookingRef',
            key: 'bookingRef',
            render: (text, record) => record.bookingRef ? (
                <a href="#!" onClick={(e) => { e.preventDefault(); handleViewTicket(record.bookingRef); }} style={{ color: '#1890ff', fontWeight: 500 }}>
                    {record.bookingRef}
                </a>
            ) : 'N/A'
        },
        {
            title: 'PNR',
            dataIndex: 'pnr',
            key: 'pnr',
            render: (text) => text || 'N/A'
        },
        {
            title: 'Company Name',
            dataIndex: 'companyName',
            key: 'companyName',
            render: (text) => text || 'N/A'
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            key: 'supplier',
            render: (text) => text || 'N/A'
        },
        {
            title: 'Amount',
            key: 'price',
            dataIndex: 'price',
            render: (_, record) => record.price != null ? `${record.currency || ''} ${Number(record.price).toFixed(2)}` : 'N/A'
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => getStatusTag(record.bookingStatus)
        },
        {
            title: 'Booked On',
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            render: (text) => formatDate(text)
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Tooltip title="View Ticket">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewTicket(record.bookingRef)}
                        disabled={!record.bookingRef}
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <div className="row">
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-header card-header--2">
                        <h5>Booking Reports</h5>
                    </div>

                    <div className="card-body">
                        <Form
                            form={searchForm}
                            layout="vertical"
                            onFinish={onSearch}
                            onValuesChange={(changedValues) => {
                                if (changedValues.searchType) {
                                    setSearchType(changedValues.searchType);
                                }
                                if (changedValues.reportFor) {
                                    setReportFor(changedValues.reportFor);
                                    searchForm.setFieldsValue({ companyUserId: undefined });
                                }
                            }}
                            className="mb-4"
                            initialValues={{ searchType: 'LastOneHour', reportFor: 'Self' }}
                        >
                            <Row gutter={16} align="bottom">
                                {/* Report For */}
                                <Col xs={24} sm={12} md={4}>
                                    <Form.Item name="reportFor" label="Report For">
                                        <Select>
                                            <Option value="Self">Self</Option>
                                            <Option value="Specific">Specific Company</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                {/* Company dropdown — only when Specific selected */}
                                {reportFor === 'Specific' && (
                                    <Col xs={24} sm={12} md={6}>
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

                                <Col xs={24} sm={12} md={6}>
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
                                    <Col xs={24} sm={12} md={6}>
                                        <Form.Item name="dateRange" label="Date Range">
                                            <RangePicker
                                                style={{ width: '100%' }}
                                                disabledDate={(current) => current && current > dayjs().endOf('day')}
                                            />
                                        </Form.Item>
                                    </Col>
                                )}
                                <Col xs={24} sm={12} md={4}>
                                    <Form.Item name="bookingStatus" label="Booking Status">
                                        <Select allowClear placeholder="Select Status">
                                            <Option value="Pending">Pending</Option>
                                            <Option value="Confirmed">Confirmed</Option>
                                            {/* <Option value="Cancelled">Cancelled</Option> */}
                                            <Option value="Failed">Failed</Option>
                                            <Option value="Hold">Hold</Option>
                                            {/* <Option value="Refunded">Refunded</Option> */}
                                            <Option value="CancelPending">CancelPending</Option>
                                            <Option value="CancelConfirmed">CancelConfirmed</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={4}>
                                    <Form.Item name="referenceNumber" label="Reference No.">
                                        <Input placeholder="Enter Ref No." allowClear />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={4}>
                                    <Form.Item name="pnr" label="PNR">
                                        <Input placeholder="Enter PNR" allowClear />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify="end">
                                <Col>
                                    <Space>
                                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                                            Search
                                        </Button>
                                        <Button onClick={handleReset} icon={<ReloadOutlined />}>
                                            Reset
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Form>

                        <div className="table-responsive table-desi">
                            <Table
                                columns={columns}
                                dataSource={bookings}
                                size="small"
                                scroll={{ x: 'max-content' }}
                                rowKey={(record) => record.bookingId || record.bookingRef}
                                pagination={false}
                                loading={loading}
                            />
                        </div>

                        {/* Pagination */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
                            <Button
                                disabled={currentPage === 0}
                                onClick={() => fetchBookings(searchForm.getFieldsValue(), currentPage - 1)}
                            >
                                Previous
                            </Button>
                            <Button type="text" disabled>
                                Page {currentPage + 1}
                            </Button>
                            <Button
                                disabled={bookings.length < 10}
                                onClick={() => fetchBookings(searchForm.getFieldsValue(), currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingReports;
