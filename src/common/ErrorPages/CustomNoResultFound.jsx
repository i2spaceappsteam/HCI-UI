import React from "react";
import { Result } from "antd";
import "./unauth.scss";
import { Link } from "react-router";
import * as ANTD from "antd";
// import nores from "../../assets/images/no-res.avif";

const ImBUrl = import.meta.env.VITE_Image_URL;
const CustomNoResultFound = ({ title }) => {
  return (
    <div className="error-404">
     
      {/* <img
        className="no-results-img"
        src={nores}
       
        alt="search-img"
       
      /> */}
      <p className="text-results-found">{title}</p>
      <Link to="/">
        <ANTD.Button className="backto-homebtn" type="primary">
          Back Home
        </ANTD.Button>
      </Link>
      
    </div>
  );
};

export default CustomNoResultFound;
