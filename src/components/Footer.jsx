import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter style={{ textAlign: 'center', background: '#fff' }}>
      © 2026 HCI. All rights reserved. | HCI powered by i2space
    </AntFooter>
  );
};

export default Footer;
