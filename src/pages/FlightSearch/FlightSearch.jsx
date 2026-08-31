import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Select, DatePicker, InputNumber, Card, Row, Col, Checkbox, Empty, Table, Tag, Space } from 'antd';
import { SwapOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './FlightSearch.css';
import {
  setOrigin,
  setDestination,
  setDepartureDate,
  setReturnDate,
  setTripType,
  setPassengerCount,
  setFareTypeFilter,
  setPriceFilter,
  resetFlightFilters,
  setFlightAirSearchResp,
} from '../../store/slices/flightSlice';

// Mock flight data for demonstration
const MOCK_FLIGHTS = [
  {
    id: 1,
    airline: 'Emirates',
    airlineCode: 'EK',
    flightNumber: 'EK 101',
    departure: '08:00',
    arrival: '14:30',
    duration: '6h 30m',
    from: 'DXB',
    to: 'LHR',
    price: 450,
    refundable: true,
    seats: 120,
    stops: 0,
  },
  {
    id: 2,
    airline: 'British Airways',
    airlineCode: 'BA',
    flightNumber: 'BA 112',
    departure: '10:15',
    arrival: '16:45',
    duration: '6h 30m',
    from: 'DXB',
    to: 'LHR',
    price: 380,
    refundable: false,
    seats: 85,
    stops: 0,
  },
  {
    id: 3,
    airline: 'Lufthansa',
    airlineCode: 'LH',
    flightNumber: 'LH 234',
    departure: '14:30',
    arrival: '21:00',
    duration: '6h 30m',
    from: 'DXB',
    to: 'LHR',
    price: 420,
    refundable: true,
    seats: 95,
    stops: 1,
  },
  {
    id: 4,
    airline: 'Air France',
    airlineCode: 'AF',
    flightNumber: 'AF 456',
    departure: '12:00',
    arrival: '18:30',
    duration: '6h 30m',
    from: 'DXB',
    to: 'LHR',
    price: 350,
    refundable: false,
    seats: 120,
    stops: 0,
  },
  {
    id: 5,
    airline: 'Swiss International',
    airlineCode: 'SR',
    flightNumber: 'SR 789',
    departure: '16:45',
    arrival: '23:15',
    duration: '6h 30m',
    from: 'DXB',
    to: 'LHR',
    price: 480,
    refundable: true,
    seats: 110,
    stops: 0,
  },
];

const AIRPORT_OPTIONS = [
  { label: 'Dubai (DXB)', value: 'DXB' },
  { label: 'London Heathrow (LHR)', value: 'LHR' },
  { label: 'Paris (CDG)', value: 'CDG' },
  { label: 'New York (JFK)', value: 'JFK' },
  { label: 'Singapore (SIN)', value: 'SIN' },
  { label: 'Tokyo (NRT)', value: 'NRT' },
];

const FlightSearch = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRefundable, setSelectedRefundable] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const flightState = useSelector((state) => state.flight);
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    tripType,
    passengers,
    flightAirSearchResp,
    flightFilters,
  } = flightState;

  // Initialize form with Redux state
  useEffect(() => {
    form.setFieldsValue({
      tripType: tripType || 'oneWay',
      origin: origin || undefined,
      destination: destination || undefined,
      departureDate: departureDate ? dayjs(departureDate) : dayjs().add(1, 'day'),
      returnDate: returnDate ? dayjs(returnDate) : undefined,
      adults: passengers.adults || 1,
      children: passengers.children || 0,
      infants: passengers.infants || 0,
    });
  }, [form, tripType, origin, destination, departureDate, returnDate, passengers]);

  // Apply filters whenever flights or filters change
  useEffect(() => {
    applyFilters();
  }, [flightAirSearchResp, flightFilters, selectedRefundable, priceRange]);

  const handleSearch = (values) => {
    // Update Redux state with search parameters
    dispatch(setOrigin(values.origin));
    dispatch(setDestination(values.destination));
    dispatch(setDepartureDate(values.departureDate.toISOString()));
    if (values.returnDate) {
      dispatch(setReturnDate(values.returnDate.toISOString()));
    }
    dispatch(setPassengerCount({ type: 'adults', count: values.adults }));
    dispatch(setPassengerCount({ type: 'children', count: values.children }));
    dispatch(setPassengerCount({ type: 'infants', count: values.infants }));
    dispatch(setTripType(values.tripType));

    // Simulate API call - in real app, would fetch from backend
    dispatch(setFlightAirSearchResp(MOCK_FLIGHTS));
    setFilteredFlights(MOCK_FLIGHTS);
  };

  const applyFilters = () => {
    let filtered = flightAirSearchResp.length > 0 ? flightAirSearchResp : [];

    // Filter by fare type (refundable/non-refundable)
    if (selectedRefundable.length > 0) {
      filtered = filtered.filter((flight) => {
        const isRefundable = flight.refundable ? 'refundable' : 'non-refundable';
        return selectedRefundable.includes(isRefundable);
      });
    }

    // Filter by price range
    filtered = filtered.filter((flight) => flight.price >= priceRange[0] && flight.price <= priceRange[1]);

    setFilteredFlights(filtered);
  };

  const handleRefundableFilterChange = (checkedValues) => {
    setSelectedRefundable(checkedValues);
    dispatch(setFareTypeFilter(checkedValues));
  };

  const handlePriceRangeChange = (type, value) => {
    const newRange = [...priceRange];
    if (type === 'min') {
      newRange[0] = value || 0;
    } else {
      newRange[1] = value || 1000;
    }
    setPriceRange(newRange);
    dispatch(setPriceFilter({ min: newRange[0], max: newRange[1] }));
  };

  const handleResetFilters = () => {
    setSelectedRefundable([]);
    setPriceRange([0, 1000]);
    dispatch(resetFlightFilters());
  };

  const columns = [
    {
      title: 'Flight',
      dataIndex: 'flightNumber',
      key: 'flightNumber',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span className="flight-number">{text}</span>
          <span className="airline-name">{record.airline}</span>
        </Space>
      ),
      width: 120,
    },
    {
      title: 'Departure',
      dataIndex: 'departure',
      key: 'departure',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span className="time">{text}</span>
          <span className="airport">{record.from}</span>
        </Space>
      ),
      width: 110,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
    },
    {
      title: 'Arrival',
      dataIndex: 'arrival',
      key: 'arrival',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span className="time">{text}</span>
          <span className="airport">{record.to}</span>
        </Space>
      ),
      width: 110,
    },
    {
      title: 'Fare Type',
      dataIndex: 'refundable',
      key: 'refundable',
      render: (refundable) => (
        <Tag color={refundable ? 'green' : 'red'}>
          {refundable ? 'Refundable' : 'Non-Refundable'}
        </Tag>
      ),
      width: 130,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="price">AED {price}</span>,
      width: 100,
    },
    {
      title: 'Seats',
      dataIndex: 'seats',
      key: 'seats',
      width: 80,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small">
          Select
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <div className="flight-search-container">
      <Card className="search-card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '20px' }}>Flight Search</h2>
        <Form form={form} layout="vertical" onFinish={handleSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Trip Type"
                name="tripType"
                rules={[{ required: true, message: 'Please select trip type' }]}
              >
                <Select placeholder="Select trip type">
                  <Select.Option value="oneWay">One Way</Select.Option>
                  <Select.Option value="roundTrip">Round Trip</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="From"
                name="origin"
                rules={[{ required: true, message: 'Please select origin' }]}
              >
                <Select placeholder="Select departure city" options={AIRPORT_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="To"
                name="destination"
                rules={[{ required: true, message: 'Please select destination' }]}
              >
                <Select placeholder="Select destination city" options={AIRPORT_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Departure Date"
                name="departureDate"
                rules={[{ required: true, message: 'Please select departure date' }]}
              >
                <DatePicker style={{ width: '100%' }} disabledDate={(d) => d && d < dayjs().startOf('day')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Return Date"
                name="returnDate"
                noStyle
              >
                <DatePicker style={{ width: '100%' }} disabledDate={(d) => d && d < dayjs().startOf('day')} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Adults" name="adults">
                <InputNumber min={1} max={9} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Children" name="children">
                <InputNumber min={0} max={8} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Infants" name="infants">
                <InputNumber min={0} max={9} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="large" block>
                Search Flights
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {filteredFlights.length > 0 && (
        <Card>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>
              Flight Results ({filteredFlights.length} flights found)
            </h3>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              type={showFilters ? 'primary' : 'default'}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {showFilters && (
            <Card style={{ marginBottom: '20px', backgroundColor: '#f5f5f5' }}>
              <h4 style={{ marginBottom: '16px' }}>Filter Flights</h4>

              <div style={{ marginBottom: '20px' }}>
                <h5>Fare Type</h5>
                <Checkbox.Group
                  value={selectedRefundable}
                  onChange={handleRefundableFilterChange}
                  options={[
                    { label: 'Refundable', value: 'refundable' },
                    { label: 'Non-Refundable', value: 'non-refundable' },
                  ]}
                  style={{ display: 'flex', gap: '20px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h5>Price Range (AED)</h5>
                <Row gutter={16}>
                  <Col xs={12} sm={6}>
                    <InputNumber
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(value) => handlePriceRangeChange('min', value)}
                      min={0}
                      max={priceRange[1]}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <InputNumber
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(value) => handlePriceRangeChange('max', value)}
                      min={priceRange[0]}
                      max={10000}
                      style={{ width: '100%' }}
                    />
                  </Col>
                </Row>
              </div>

              <Button onClick={handleResetFilters} danger>
                Reset Filters
              </Button>
            </Card>
          )}

          <Table
            columns={columns}
            dataSource={filteredFlights}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        </Card>
      )}

      {flightAirSearchResp.length > 0 && filteredFlights.length === 0 && (
        <Card>
          <Empty description="No flights match your filter criteria" />
        </Card>
      )}
    </div>
  );
};

export default FlightSearch;
