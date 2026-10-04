import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 40, color: '#da251c' }} spin />;

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
    <Spin indicator={antIcon} tip="Loading Hotels..." />
  </div>
);

export default PageLoader;
