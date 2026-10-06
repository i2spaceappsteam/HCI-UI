import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Card,
  Button,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Progress,
  message
} from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  RiseOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import './Dashboard.css';
import ApiClient from '../Helpers/ApiClient';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalBookingCount: 0,
    thisMonthBookingCount: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [ticketCounts, setTicketCounts] = useState({
    confirmed: 0,
    cancelled: 0,
    pending: 0
  });
  const handleViewTicket = (referenceNumber) => {
    if (referenceNumber) {
      navigate(`/admin/flight/ticket?ref=${referenceNumber}`);
    }
  };

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchDashboardData();
  }, []);


  useEffect(() => {
    if (user) {
      const roleName = user?.Role?.RoleName || user?.roleName || user?.role || '';
      setRole(roleName.toString().toLowerCase());
    }
  }, [user]);

  const exportToCSV = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', stats.totalUsers],
      ['Total Revenue', stats.totalRevenue],
      ['Total Bookings', stats.totalBookingCount],
      ['This Month Bookings', stats.thisMonthBookingCount],
      ['Confirmed Tickets', ticketCounts.confirmed],
      ['Pending Tickets', ticketCounts.pending],
      ['Cancelled Tickets', ticketCounts.cancelled]
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "dashboard_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchDashboardData = async () => {
    try {
      const response = await ApiClient.get('Dashboard/GetDashboard');
      if (response && response.success) {
        const { data } = response;
        setStats({
          totalUsers: data.totalUsers || 0,
          totalRevenue: data.totalRevenue || 0,
          totalBookingCount: data.totalBookingCount || 0,
          thisMonthBookingCount: data.thisMonthBookingCount || 0
        });
        setRecentActivities(data.latestBookings || []);
        setTicketCounts(data.ticketCounts || { confirmed: 0, cancelled: 0, pending: 0 });
      } else {
        message.error(response?.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Error fetching dashboard data');
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => <Text strong>{text || 'N/A'}</Text>,
    },
    // {
    //   title: 'Supplier',
    //   dataIndex: 'supplier',
    //   key: 'supplier',
    //   render: (text) => <Text>{text || 'N/A'}</Text>,
    // },
    {
      title: "Ref.No",
      dataIndex: "bookingRef",
      key: "bookingRef",
      render: (text) => (
        text ?
          <a
            href="#!"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/admin/flight/ticket?ref=${text}`);
            }}
          >
            {text}
          </a> : 'N/A'
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: '#52c41a', text: 'Completed' },
          confirmed: { color: '#52c41a', text: 'Confirmed' },
          pending: { color: '#faad14', text: 'Pending' },
          cancelled: { color: '#f5222d', text: 'Cancelled' }
        };
        const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'bookedOn',
      key: 'bookedOn',
      render: (date) => <Text type="secondary">{date ? new Date(date).toLocaleDateString() : 'N/A'}</Text>,
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <Text strong>{amount != null ? `₹${amount}` : 'N/A'}</Text>,
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div>
          <Title level={2}>Welcome back! 👋</Title>
          <Paragraph type="secondary">
            Here's what's happening with your business today.
          </Paragraph>
        </div>
        {/* <Space>
          <Button type="primary" onClick={exportToCSV}>Generate Report</Button>
        </Space> */}
      </div>

      {/* Key Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        {(user?.role === 20 || user?.role === 1) && (
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                prefix={<UserOutlined className="stat-icon" />}
                suffix={<RiseOutlined style={{ color: '#52c41a' }} />}
              />
              <Progress percent={85} status="active" showInfo={false} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                +15% from last month
              </Text>
            </Card>
          </Col>
        )}

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<span className="stat-icon">₹</span>}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={72} status="active" showInfo={false} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              +8% from last month
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="Total Bookings"
              value={stats.totalBookingCount}
              prefix={<ShoppingOutlined className="stat-icon" />}
              suffix={<RiseOutlined style={{ color: '#52c41a' }} />}
            />
            <Progress percent={65} status="active" showInfo={false} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              +12% from last month
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="This Month Bookings"
              value={stats.thisMonthBookingCount}
              prefix={<TeamOutlined className="stat-icon" />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress percent={42} status="active" showInfo={false} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              In progress
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="summary-row">
        <Col xs={24} lg={16}>
          <Card
            title={<Title level={4}>Recent Activities</Title>}
            bordered={false}
            className="activity-card"
          >
            <Table
              dataSource={recentActivities}
              columns={columns}
              pagination={{ pageSize: 10 }}
              rowKey="bookingId"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<Title level={4}>Quick Stats</Title>}
            bordered={false}
            className="quick-stats-card"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div className="quick-stat-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                  <Text>Confirmed</Text>
                </div>
                <Text strong style={{ fontSize: '16px' }}>{ticketCounts.confirmed}</Text>
              </div>

              <div className="quick-stat-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClockCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />
                  <Text>Pending</Text>
                </div>
                <Text strong style={{ fontSize: '16px' }}>{ticketCounts.pending}</Text>
              </div>

              <div className="quick-stat-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '20px' }} />
                  <Text>Cancelled</Text>
                </div>
                <Text strong style={{ fontSize: '16px' }}>{ticketCounts.cancelled}</Text>
              </div>

              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid #f0f0f0',
                textAlign: 'center'
              }}>
                <Button type="primary" block>
                  View All Details
                </Button>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Action Cards */}
      {(user?.role === 20 || user?.role === 1) && (
        <Row gutter={[16, 16]} className="action-row">
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable className="action-card">
              <div className="action-icon" style={{ background: '#e6f7ff' }}>
                <ShoppingOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              </div>
              <Title level={5} style={{ marginTop: '12px' }}>Manage Bookings</Title>
              <Text type="secondary">View and manage all bookings</Text>
              <Button type="link" style={{ marginTop: '12px' }} onClick={() => navigate('/admin/bookingreports')}>
                Go to Bookings →
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card hoverable className="action-card">
              <div className="action-icon" style={{ background: '#f6ffed' }}>
                <TeamOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              </div>
              <Title level={5} style={{ marginTop: '12px' }}>Manage Users</Title>
              <Text type="secondary">Add and manage users</Text>
              <Button type="link" style={{ marginTop: '12px' }} onClick={() => navigate('/Admin/Users')}>
                Go to Users →
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card hoverable className="action-card">
              <div className="action-icon" style={{ background: '#fff1f0' }}>
                <span style={{ fontSize: '32px', color: '#f5222d', fontWeight: 'bold' }}>₹</span>
              </div>
              <Title level={5} style={{ marginTop: '12px' }}>Revenue Reports</Title>
              <Text type="secondary">Check revenue analytics</Text>
              <Button type="link" style={{ marginTop: '12px' }} onClick={() => navigate('/admin/ledgerstatement')}>
                View Reports →
              </Button>
            </Card>
          </Col>

          {/* <Col xs={24} sm={12} lg={6}>
            <Card hoverable className="action-card">
              <div className="action-icon" style={{ background: '#fef3f0' }}>
                <RiseOutlined style={{ fontSize: '32px', color: '#faad14' }} />
              </div>
              <Title level={5} style={{ marginTop: '12px' }}>Performance</Title>
              <Text type="secondary">View performance metrics</Text>
              <Button type="link" style={{ marginTop: '12px' }} onClick={() => navigate('/admin/performance')}>
                View Metrics →
              </Button>
            </Card>
          </Col> */}
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
