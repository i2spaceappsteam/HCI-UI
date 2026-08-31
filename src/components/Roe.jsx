import React, { useEffect, useState } from 'react';
import { Card, message, Table } from 'antd';
import ApiClient from '../Helpers/ApiClient';

const Roe = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoes();
  }, []);

  const fetchRoes = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.get("ROE/GetRoes");
      if (res && res.success) {
        setData(res.data || []);
      } else {
        message.error(res?.message || 'Failed to fetch ROE data');
      }
    } catch (error) {
      console.error(error);
      message.error('An error occurred while fetching ROE data');
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    if (!data || data.length === 0) return [];
    
    const keys = Object.keys(data[0]);
    
    return keys.map(key => {
      let title = key.toUpperCase();
      if (key === 'currencyDate') title = 'Currency Date';
      else if (key === 'hours') title = 'Hours';
      
      return {
        title,
        dataIndex: key,
        key: key,
      };
    });
  };

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-header card-header--2">
            <h5>Rate of Exchange (ROE)</h5>
          </div>
          <div className="card-body p-3">
            <Table 
              columns={getColumns()} 
              dataSource={data.map((item, idx) => ({ ...item, key: idx }))} 
              loading={loading} 
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 15 }}
              size="middle"
              bordered
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roe;
