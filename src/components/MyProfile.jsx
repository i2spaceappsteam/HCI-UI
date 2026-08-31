import React, { useEffect, useState } from 'react';
import { Card, Spin, Tag, Row, Col } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  IdcardOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ApiClient from '../Helpers/ApiClient';

const MyProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || user?.UserID || user?.userId;

  useEffect(() => {
    if (userId) {
      setLoading(true);
      ApiClient.get(`Users/GetUserById/${userId}`)
        .then((res) => {
          if (res?.success === true) {
            setProfile(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
        <UserOutlined style={{ fontSize: 48, marginBottom: 16 }} />
        <h3>Unable to load profile</h3>
      </div>
    );
  }

  const fullName = [profile.title, profile.firstName, profile.lastName].filter(Boolean).join(' ');

  const InfoItem = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {React.cloneElement(icon, { style: { fontSize: 16, color: '#0284c7' } })}
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500, marginTop: 2 }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-header card-header--2">
            <h5>My Profile</h5>
          </div>
          <div className="card-body">

            {/* Profile Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0369a1, #0ea5e9, #38bdf8)',
              borderRadius: 16,
              padding: '32px 40px',
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              marginBottom: 28,
              boxShadow: '0 8px 32px rgba(3, 105, 161, 0.18)',
            }}>
              {/* Avatar */}
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                border: '3px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 34, fontWeight: 700, color: '#fff' }}>
                  {(profile.firstName?.[0] || profile.userName?.[0] || 'U').toUpperCase()}
                </span>
              </div>
              {/* Name & Meta */}
              <div style={{ flex: 1 }}>
                <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 700 }}>
                  {fullName || profile.userName}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 10px', fontSize: 14 }}>
                  @{profile.userName}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {/* {profile.roleName && (
                    <Tag color="blue" style={{ borderRadius: 12, fontSize: 12, padding: '2px 12px' }}>
                      {profile.roleName}
                    </Tag>
                  )}
                  {profile.memberShipName && (
                    <Tag color="gold" style={{ borderRadius: 12, fontSize: 12, padding: '2px 12px' }}>
                      {profile.memberShipName}
                    </Tag>
                  )} */}
                  <Tag
                    color={profile.isActive ? 'green' : 'red'}
                    style={{ borderRadius: 12, fontSize: 12, padding: '2px 12px' }}
                  >
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <Row gutter={[24, 0]}>
              {/* Personal Information */}
              <Col xs={24} md={12}>
                <Card
                  title={<span style={{ fontSize: 15, fontWeight: 600 }}><IdcardOutlined style={{ marginRight: 8, color: '#0284c7' }} />Personal Information</span>}
                  bordered={false}
                  style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 20 }}
                  styles={{ header: { borderBottom: '2px solid #e0f2fe' } }}
                >
                  <InfoItem icon={<UserOutlined />} label="Full Name" value={fullName} />
                  <InfoItem icon={<UserOutlined />} label="Gender" value={profile.gender} />
                  <InfoItem icon={<UserOutlined />} label="Username" value={profile.userName} />
                  <InfoItem icon={<MailOutlined />} label="Email Address" value={profile.emailId} />
                  <InfoItem icon={<PhoneOutlined />} label="Phone Number" value={profile.phoneNumber} />
                </Card>
              </Col>

              {/* Address & Location */}
              <Col xs={24} md={12}>
                <Card
                  title={<span style={{ fontSize: 15, fontWeight: 600 }}><HomeOutlined style={{ marginRight: 8, color: '#0284c7' }} />Address & Location</span>}
                  bordered={false}
                  style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 20 }}
                  styles={{ header: { borderBottom: '2px solid #e0f2fe' } }}
                >
                  <InfoItem icon={<HomeOutlined />} label="Address" value={profile.address} />
                  <InfoItem icon={<HomeOutlined />} label="City" value={profile.city} />
                  <InfoItem icon={<GlobalOutlined />} label="State" value={profile.state} />
                  <InfoItem icon={<GlobalOutlined />} label="Country" value={profile.country} />
                </Card>
              </Col>

              {/* Account Details */}
              {/* <Col xs={24} md={12}>
                <Card
                  title={<span style={{ fontSize: 15, fontWeight: 600 }}><SafetyCertificateOutlined style={{ marginRight: 8, color: '#0284c7' }} />Account Details</span>}
                  bordered={false}
                  style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 20 }}
                  styles={{ header: { borderBottom: '2px solid #e0f2fe' } }}
                >
                  <InfoItem icon={<SafetyCertificateOutlined />} label="Role" value={profile.roleName} />
                  <InfoItem icon={<IdcardOutlined />} label="Membership" value={profile.memberShipName} />
                  <InfoItem
                    icon={<SafetyCertificateOutlined />}
                    label="Status"
                    value={
                      <Tag color={profile.isActive ? 'green' : 'red'} style={{ borderRadius: 10 }}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </Tag>
                    }
                  />
                </Card>
              </Col> */}

              {/* Audit Info */}
              {/* <Col xs={24} md={12}>
                <Card
                  title={<span style={{ fontSize: 15, fontWeight: 600 }}><CalendarOutlined style={{ marginRight: 8, color: '#0284c7' }} />Audit Information</span>}
                  bordered={false}
                  style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 20 }}
                  styles={{ header: { borderBottom: '2px solid #e0f2fe' } }}
                >
                  <InfoItem icon={<CalendarOutlined />} label="Created By" value={profile.createdBy} />
                  <InfoItem icon={<CalendarOutlined />} label="Created Date" value={profile.createdDate} />
                  <InfoItem icon={<CalendarOutlined />} label="Modified By" value={profile.modifiedBy} />
                  <InfoItem icon={<CalendarOutlined />} label="Modified Date" value={profile.modifiedDate} />
                </Card>
              </Col> */}
            </Row>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
