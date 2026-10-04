import React, { useState, useEffect } from "react";
import { Progress } from "antd";

const CustomProgressBar = (props) => {
  const [completed, setCompleted] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setCompleted((prev) => (prev < 90 ? prev + 10 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Progress percent={completed} {...props} />
  );
};

export default CustomProgressBar;
