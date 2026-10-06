import React from "react";


const PassengerDetails = (props) => {
  
  return (
    <div className="passenger-details-container">
      <div className="passenger-details-card">
        {props.passengersInfo.length > 0 ? (
          <div>
            {props.passengersInfo.map((paxInRoomObj, roomIndex) => (
              <div className="rm-pax-det">
                <h5 className="rm-info">Room {roomIndex + 1}</h5>
                <div className="passenger-info">
                  <table className="table table-responsive">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Name</th>
                        <th>Type</th>
                         <th>Age</th> 
                         {paxInRoomObj.paxInfoList.some(
                          (paxObj) => paxObj.pan && paxObj.pan.trim() !== ""
                        ) && <th>PAN</th>}
                        {paxInRoomObj.paxInfoList.some(
                          (paxObj) => paxObj.passportNo && paxObj.passportNo.trim() !== ""
                        ) && <th>Passport</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paxInRoomObj.paxInfoList.map((paxObj, pIdx) => (
                        <tr key={pIdx}>
                          <td>{paxObj.title} </td>
                          <td>
                            {paxObj.firstName?.toUpperCase()} {paxObj.lastName}
                          </td>
                          <td>
                            {paxObj.guestType === "Adult" ? "Adult" : "Child"}
                          </td>
                          <td>{paxObj.age} </td> 
                          {paxInRoomObj.paxInfoList.some(
                            (pax) => pax.pan && pax.pan.trim() !== ""
                          ) && <td>{paxObj.pan}</td>}
                          {paxInRoomObj.paxInfoList.some(
                            (pax) => pax.passportNo && pax.passportNo.trim() !== ""
                          ) && <td>{paxObj.passportNo}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No Passengers Info available</p>
        )}
      </div>
    </div>
  );
};
export default PassengerDetails;
