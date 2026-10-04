import React from "react";
import * as ANTD from "antd";
import "./Skeleton.scss";

const SkeletonLayout = () => {
  return (
    <div className="skeleton-layout-container">
      <div>
        <ANTD.Row>
          <ANTD.Col md={5} xs={24}>
            <ANTD.Skeleton
              active={true}
              avatar={{ size: 200, shape: "square" }}
            />
          </ANTD.Col>
          <ANTD.Col md={14} xs={24} className="hotel-details">
            <ANTD.Skeleton active={true} paragraph={{ rows: 4 }} />
          </ANTD.Col>
          <ANTD.Col md={5} xs={0} className="choose-block-container">
            <ANTD.Skeleton active={true} paragraph={{ rows: 2 }} />
          </ANTD.Col>
        </ANTD.Row>
      </div>
      {/* <ANTD.Skeleton active={true}
        avatar={{ size: 200, shape: "square"}}
      /> */}
    </div>
  );
};

export default SkeletonLayout;
