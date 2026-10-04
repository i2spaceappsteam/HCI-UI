import React from "react";
import { Col, Divider, Row, Skeleton } from "antd";
import "./FilterSkeleton.scss";

const FilterSkeleton = () => {
  return (
    <div className="filter-skeleton-layout-container">
      <Skeleton active={true} paragraph={{ rows: 0 }} />
      <div>
        <Row className="filter-header">
          <Col md={12}>
            <Skeleton active={true} paragraph={{ rows: 0 }} />
          </Col>
          <Col md={12} className="clear-all-text">
            <Skeleton active={true} paragraph={{ rows: 0 }} />
          </Col>
        </Row>
      </div>
      <div className="filter-blocks">
        <div>
          <Row className="filter-types-header">
            <Col md={12} className="filter-type-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="clear-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="collpase-icon">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
          </Row>
        </div>
        <Divider />
        <div className="filter-type-content">
          <Skeleton active={true} paragraph={{ rows: 2 }} />
        </div>
      </div>
      <div className="filter-blocks">
        <div>
          <Row className="filter-types-header">
            <Col md={12} className="filter-type-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="clear-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="collpase-icon">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
          </Row>
        </div>
        <Divider />
        <div className="filter-slider">
          <Skeleton active={true} paragraph={{ rows: 0 }} />
        </div>
      </div>
      <div className="filter-blocks">
        <div>
          <Row className="filter-types-header">
            <Col md={12} className="filter-type-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="clear-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="collpase-icon">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
          </Row>
        </div>
        <Divider />
        <div className="filter-type-content">
          <Skeleton active={true} paragraph={{ rows: 2 }} />
        </div>
      </div>
      <div className="filter-blocks">
        <div>
          <Row className="filter-types-header">
            <Col md={12} className="filter-type-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="clear-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="collpase-icon">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
          </Row>
        </div>
        <Divider />
        <div className="filter-type-content">
          <Skeleton active={true} paragraph={{ rows: 2 }} />
        </div>
      </div>
      <div className="filter-blocks">
        <div>
          <Row className="filter-types-header">
            <Col md={12} className="filter-type-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="clear-text">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
            <Col md={6} className="collpase-icon">
              <Skeleton active={true} paragraph={{ rows: 0 }} />
            </Col>
          </Row>
        </div>
        <Divider />
        <div className="filter-type-content">
          <Skeleton active={true} paragraph={{ rows: 0 }} />
        </div>
      </div>
    </div>
  );
};

export default FilterSkeleton;
