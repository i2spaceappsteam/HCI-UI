import React from "react";
import { Button, Result } from "antd";
// import notFound from "../../assets/images/error/notfound.png";
import { Link } from "react-router";
import "./unauth.scss";
const notFound = import.meta.env.VITE_Image_URL + "images/error/notfound.png";
const NoResultFound = () => {
  return (
    <div className="unauthorized">
      <Result
        icon={<img src={notFound} alt="404" />}
        title="404"
        subTitle={
          <div>
            <p className="dec">
              Sorry the page you
              <br /> visited does not exist
            </p>
          </div>
        }
        extra={
          <Link to="/">
            <Button type="primary">Back Home</Button>
          </Link>
        }
      />
    </div>
  );
};

export default NoResultFound;
