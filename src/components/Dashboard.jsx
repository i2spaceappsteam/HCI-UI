import React, { useEffect, useState } from 'react';
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
  Empty
} from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  DollarOutlined,
  RiseOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import './Dashboard.css';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 1240,
    totalRevenue: 45230,
    totalOrders: 8532,
    activeBookings: 342
  });
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      name: 'Hemanth Lakka',
      action: 'Booked Flight',
      status: 'completed',
      date: '2026-08-19',
      amount: '$450'
    },
    {
      id: 2,
      name: 'John Smith',
      action: 'Cancelled Booking',
      status: 'cancelled',
      date: '2026-08-18',
      amount: '$320'
    },
    {
      id: 3,
      name: 'Sarah Wilson',
      action: 'Pending Payment',
      status: 'pending',
      date: '2026-08-18',
      amount: '$680'
    },
    {
      id: 4,
      name: 'Michael Brown',
      action: 'Payment Confirmed',
      status: 'completed',
      date: '2026-08-17',
      amount: '$890'
    },
  ]);

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: '#52c41a', text: 'Completed' },
          pending: { color: '#faad14', text: 'Pending' },
          cancelled: { color: '#f5222d', text: 'Cancelled' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => <Text type="secondary">{date}</Text>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>{amount}</Text>,
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
        <Space>
          <Button type="primary">Generate Report</Button>
          <Button>Download</Button>
        </Space>
      </div>

      {/* Key Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
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

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined className="stat-icon" />}
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
              title="Total Orders"
              value={stats.totalOrders}
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
              title="Active Bookings"
              value={stats.activeBookings}
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
              rowKey="id"
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
                  <Text>Completed</Text>
                </div>
                <Text strong style={{ fontSize: '16px' }}>1,245</Text>
              </div>

              <div className="quick-stat-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClockCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />
                  <Text>Pending</Text>
                </div>
                <Text strong style={{ fontSize: '16px' }}>342</Text>
              </div>

              <div className="quick-stat-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '20px' }} />
                  <Text>Cancelled</Text>
                </div>
                <Text strong style={{ fontSize: '16px' }}>89</Text>
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
      <Row gutter={[16, 16]} className="action-row">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="action-card">
            <div className="action-icon" style={{ background: '#e6f7ff' }}>
              <ShoppingOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            </div>
            <Title level={5} style={{ marginTop: '12px' }}>Manage Bookings</Title>
            <Text type="secondary">View and manage all bookings</Text>
            <Button type="link" style={{ marginTop: '12px' }}>
              Go to Bookings →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="action-card">
            <div className="action-icon" style={{ background: '#f6ffed' }}>
              <TeamOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
            </div>
            <Title level={5} style={{ marginTop: '12px' }}>Manage Users</Title>
            <Text type="secondary">Add and manage users</Text>
            <Button type="link" style={{ marginTop: '12px' }}>
              Go to Users →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="action-card">
            <div className="action-icon" style={{ background: '#fff1f0' }}>
              <DollarOutlined style={{ fontSize: '32px', color: '#f5222d' }} />
            </div>
            <Title level={5} style={{ marginTop: '12px' }}>Revenue Reports</Title>
            <Text type="secondary">Check revenue analytics</Text>
            <Button type="link" style={{ marginTop: '12px' }}>
              View Reports →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="action-card">
            <div className="action-icon" style={{ background: '#fef3f0' }}>
              <RiseOutlined style={{ fontSize: '32px', color: '#faad14' }} />
            </div>
            <Title level={5} style={{ marginTop: '12px' }}>Performance</Title>
            <Text type="secondary">View performance metrics</Text>
            <Button type="link" style={{ marginTop: '12px' }}>
              View Metrics →
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
