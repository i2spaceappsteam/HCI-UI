import React from "react";
import { Button, Result } from "antd";
import * as ANTD from "antd";
import "./unauth.scss";
import nores from "../../assets/images/no-res.jpg";
const ImBUrl = import.meta.env.VITE_Image_URL;
const NoResultFound = () => {
    const handleBackHome = () => {
        window.location.href = "/admin/hotels";
    };
    return (
        <div className="errr-404">

            <div className="ht-err">
                <div className="ht-err-2">
                    <div className="hdr-err">Hotels Not Found</div>
                    <img
                        className="no-results-img"
                        src={nores}
                        alt="search-img"

                    />
                    <div className="info-err">
                        <p>Sorry, we could not find any hotels that match your request. This can be due to non-availability of rooms. You can try doing another search by changing the dates. Hotel inventory changes continously and its possible that you might find availability hotels for your preferred dates at later time</p>
                        <div className="btn-err">
                            <ANTD.Button className="backo-homebtn" type="primary" onClick={handleBackHome}>
                                Back Home
                            </ANTD.Button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default NoResultFound;
