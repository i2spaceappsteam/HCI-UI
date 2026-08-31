import React, { useState, useEffect } from 'react';
import { Button, InputNumber } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './FlightDatePicker.css';

const FlightDatePicker = ({ 
    type, // 'depart' or 'return'
    departureDate, 
    returnDate, 
    onDateSelect, 
    onClose 
}) => {
    // State for navigation (which month is visible first)
    // Default to displaying the month of the selected date (or current month)
    const initialMonth = type === 'return' && returnDate 
        ? dayjs(returnDate).startOf('month') 
        : (departureDate ? dayjs(departureDate).startOf('month') : dayjs().startOf('month'));
    
    const [currentMonth, setCurrentMonth] = useState(initialMonth);
    const [activeTab, setActiveTab] = useState(type); // 'depart' | 'return'
    const [returnDays, setReturnDays] = useState(1); // Default days for return duration calculation

    useEffect(() => {
        // Sync internal tab with prop type if needed, or just let user switch tabs
        setActiveTab(type);
    }, [type]);

    useEffect(() => {
        // If switching to return tab and no return date, maybe set one based on days? 
        // Or just let user pick.
    }, [activeTab]);

    const handleMonthChange = (direction) => {
        setCurrentMonth(prev => direction === 'next' ? prev.add(1, 'month') : prev.subtract(1, 'month'));
    };

    const handleDateClick = (date) => {
        if (activeTab === 'depart') {
            onDateSelect('depart', date);
            // If selecting departure, usually we might auto-switch to return if round trip?
            // For now, just select.
             setActiveTab('return');
        } else {
            // Validate return date must be >= departure date
            if (departureDate && date.isBefore(dayjs(departureDate), 'day')) {
                // Invalid
                return;
            }
            onDateSelect('return', date);
            onClose();
        }
    };

    const isSelected = (date) => {
        if (activeTab === 'depart') {
            return departureDate && date.isSame(dayjs(departureDate), 'day');
        } else {
            return returnDate && date.isSame(dayjs(returnDate), 'day');
        }
    };
    
    const isInRange = (date) => {
        if (departureDate && returnDate) {
            const start = dayjs(departureDate);
            const end = dayjs(returnDate);
            return date.isAfter(start, 'day') && date.isBefore(end, 'day');
        }
        return false;
    };

    const renderMonth = (monthDate) => {
        const startOfMonth = monthDate.startOf('month');
        const daysInMonth = monthDate.daysInMonth();
        const startDay = startOfMonth.day(); // 0 (Sun) - 6 (Sat)
        
        const days = [];
        // Empty slots for prev month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = monthDate.date(i);
            const isPast = date.isBefore(dayjs(), 'day');
            const selected = isSelected(date);
            const inRange = isInRange(date);
            const isDep = departureDate && date.isSame(dayjs(departureDate), 'day');
            const isRet = returnDate && date.isSame(dayjs(returnDate), 'day');
            
            let className = `calendar-day ${isPast ? 'disabled' : ''} ${selected ? 'selected' : ''}`;
            if (inRange) className += ' in-range';
            if (isDep) className += ' is-dep';
            if (isRet) className += ' is-ret';

            days.push(
                <div 
                    key={date.format('YYYY-MM-DD')} 
                    className={className}
                    onClick={() => !isPast && handleDateClick(date)}
                >
                    <span className="day-num">{i}</span>
                </div>
            );
        }

        return (
            <div className="calendar-month">
                <div className="month-header">
                    {monthDate.format('MMMM YYYY').toUpperCase()}
                </div>
                <div className="weekdays-row">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>
                <div className="days-grid">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="flight-datepicker-container">
            {/* Tabs Header */}
            <div className="datepicker-header">
                <div 
                    className={`date-tab ${activeTab === 'depart' ? 'active' : ''}`}
                    onClick={() => setActiveTab('depart')}
                >
                    <span className="tab-label">DEPARTURE</span>
                    <span className="tab-date">
                        {departureDate ? dayjs(departureDate).format('MMM DD, YYYY') : 'Select Date'}
                    </span>
                </div>
                
                <div 
                    className={`date-tab ${activeTab === 'return' ? 'active' : ''}`}
                    onClick={() => setActiveTab('return')}
                >
                    <span className="tab-label">
                        RETURN 
                        {activeTab === 'return' && (
                             <span className="days-selector">
                                <small>NUMBER OF DAYS</small>
                                <InputNumber 
                                    size="small" 
                                    min={1} 
                                    max={30} 
                                    value={returnDays}
                                    onChange={(val) => {
                                        setReturnDays(val);
                                        // Auto-update return date based on departure + days
                                        if (departureDate && val) {
                                            onDateSelect('return', dayjs(departureDate).add(val, 'day'));
                                        }
                                    }}
                                    className="dni-input"
                                />
                             </span>
                        )}
                    </span>
                    <span className="tab-date">
                        {returnDate ? dayjs(returnDate).format('MMM DD, YYYY') : (activeTab === 'return' ? 'Select Date' : '- - -')}
                    </span>
                    {activeTab === 'return' && !returnDate && (
                         <span className="tab-close" onClick={(e) => { e.stopPropagation(); onDateSelect('return', null); }}>×</span>
                    )}
                </div>
            </div>

            {/* Helper Bar */}
            <div className="date-helper-bar">
                {activeTab === 'depart' 
                    ? <span className="helper-text">Book round trip for great savings !!</span>
                    : <span className="helper-text">Select return date</span>
                }
            </div>

            {/* Calendars */}
            <div className="calendars-wrapper">
                <div className="nav-btn prev" onClick={() => handleMonthChange('prev')}>
                    <LeftOutlined />
                </div>
                
                <div className="months-container">
                    {renderMonth(currentMonth)}
                    <div className="month-divider"></div>
                    {renderMonth(currentMonth.add(1, 'month'))}
                </div>

                <div className="nav-btn next" onClick={() => handleMonthChange('next')}>
                    <RightOutlined />
                </div>
            </div>
        </div>
    );
};

export default FlightDatePicker;
