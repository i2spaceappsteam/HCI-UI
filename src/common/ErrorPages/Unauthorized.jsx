import React from "react";
import { Button, Result } from "antd";
// import Img403 from "../../assets/images/error/unauth403.png";
import { Link } from "react-router";
import "./unauth.scss";

import { useSelector } from "react-redux";
const Img403 = import.meta.env.VITE_Image_URL+"images/error/unauth403.png";
const Unauthorized = () => {
   const user = useSelector((state) => state.auth.user);
  return (
    <>
    { user?.UserID === 1 ? "" :
    <div style={{marginTop:"-3px"}}>
    
   </div>
}
    <div className="unauthorized">
      <Result
        icon={<img src={Img403} alt="403" />}
        title="403"
        subTitle={
          <div>
            <p className="dec">
              Sorry, you are not <br /> authorized to access this page
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
    </>
  );
};

export default Unauthorized;
