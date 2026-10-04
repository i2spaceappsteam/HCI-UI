import React from "react";
import { Button, Result } from "antd";

const Error404 = () => {
  return (
    <div className="error-404">
      <Result
        subTitle="Sorry, the page you visited does not exist."
        status="404"
        title="404"
        extra={<Button type="primary">Back Home</Button>}
      />
    </div>
  );
};

export default Error404;
