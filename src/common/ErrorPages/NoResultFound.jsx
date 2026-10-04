import React from "react";
import { Button, Result } from "antd";
import { Link } from "react-router";
import * as ANTD from "antd";
import "./unauth.scss";
import nores from "../../assets/images/no-res.jpg";
const ImBUrl = import.meta.env.VITE_Image_URL;
const NoResultFound = () => {
  return (
    <div className="error-404">
    
      <img
        className="no-results-img"
        // src={ImBUrl+"images/no-image.png"}
        src={nores}
        alt="search-img"
       
      />
      <p className="text-results-found">No Results Found</p>
      <Link to="/">
        <ANTD.Button className="backto-homebtn" type="primary">
          Back Home
        </ANTD.Button>
      </Link>
      
    </div>
  );
};

export default NoResultFound;
