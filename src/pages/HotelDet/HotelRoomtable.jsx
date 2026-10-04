// import { useEffect, useState } from "react";
// import { Button, Col, Row, Skeleton, message } from "antd";
// import { useAuthContext } from "../../../common/providers/AuthProvider";
// import { useActivitiesContext } from "../../../common/providers/Activities/ActivitiesProvider";
// import Table from "react-bootstrap/Table";
// import Form from "react-bootstrap/Form";
// import ApiClient from "../../helpers/ApiClient";

// import "./hotelRoomTable.scss";

// const HotelRoomtable = ({ hotelCardProps, hotelTraceId, isfrompackage }) => {
//   const { user } = useAuthContext();
//   const {
//     state: { selectedBuildHotel },
//     setSelectedBuildHotel,
//   } = useActivitiesContext();

//   const [roomsList, setRoomsList] = useState({});
//   const [roomLoading, setRoomLoading] = useState(true);
//   const [rooms, setRooms] = useState([]);
//   const [selectedHotel, setSelectedHotel] = useState([]);

//   const onSelectHotel = (roomsArr, index, value) => {
//     if (value) {
//       let roomsId = roomsArr.map((item) => {
//         return item.roomId;
//       });

//       let obj = {
//         checkedId: index,
//         fixedFormat: roomsList.fixedFormat,
//         guestRequiredFields: roomsList.guestRequiredFields,
//         hotelCode: roomsList.hotelCode,
//         hotelName: roomsList.hotelName,
//         isAmendmentAllowed: roomsList.isAmendmentAllowed,
//         isFlightDetailsMandatory: roomsList.isFlightDetailsMandatory,
//         roomCombination: roomsId,
//         rooms: roomsArr,
//         roomsId: roomsList.roomsId,
//         traceId: roomsList.traceId,
//       };

//       setSelectedHotel([obj]);
//     } else {
//       setSelectedHotel([]);
//     }
//   };

//   const fetrooms = async (params) => {
//     setRoomLoading(true);
//     await ApiClient.post("hotels-v2/hotelrooms", params)
//       .then((res) => res)
//       .then((res) => {
//         if (res.status === 200) {
//           if (res.data.errors.length < 1) {
//             let combinedrooms = [];
//             setRoomsList(res.data);

//             if (res.data?.roomCombination?.length > 0) {
//               combinedrooms = res.data?.roomCombination.map((x) => {
//                 let roomSet = [];
//                 x.roomId.forEach((roomId) => {
//                   let room = res.data.rooms.filter((y) => y.roomId == roomId);
//                   roomSet.push(room[0]);
//                 });

//                 return roomSet;
//               });
//             }

//             setRooms(combinedrooms);
//           } else {
//             setRoomsList([]);
//           }
//         }
//         setRoomLoading(false);
//       })
//       .catch((err) => {
//         console.log(err);
//         setRoomsList([]);
//         setRoomLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetrooms({
//       traceId: hotelTraceId,
//       hotelCode: hotelCardProps.hotelCode,
//       userId: user?.UserID ?? 1,
//       roleType: user?.Role?.RoleId ?? 4,
//       membership: user?.Membership ?? 1,
//     });
//   }, []);

//   const addHotelToQuotation = () => {
//     if (selectedHotel.length > 0) {
//       setSelectedBuildHotel([...selectedBuildHotel, ...selectedHotel]);
//     } else {
//       message.error("Please Select Hotel Room", 3);
//     }
//   };

//   return (
//     <>
//       {roomLoading ? (
//         <Skeleton active />
//       ) : rooms.length > 0 ? (
//         <div>
//           <Table responsive="lg" className="groupfrom " striped bordered hover>
//             <thead>
//               <tr>
//                 <th>Select Your Room</th>

//                 <th>Price</th>
//               </tr>
//             </thead>

//             {roomsList.fixedFormat === "Fixed" ||
//             roomsList.fixedFormat === "fixed" ? (
//               <tbody>
//                 {rooms.map((roomsArr, index) => (
//                   <tr key={index + "fixed"}>
//                     <td className="option_Name crossmark-option">
//                       <Row gutter={[4, 16]}>
//                         <Col md={1} sm={1} xs={1}>
//                           <Form.Check
//                             type="checkbox"
//                             id={"hotel" + index}
//                             checked={selectedHotel[0]?.checkedId === index}
//                             onClick={(e) => {
//                               onSelectHotel(roomsArr, index, e.target.checked);
//                             }}
//                           />
//                         </Col>
//                         <Col md={23} sm={23} xs={23}>
//                           {roomsArr.map((roomInfo, roomIndex) => (
//                             <Row gutter={[16, 16]} className="mb-2">
//                               <Col md={20} sm={20} xs={20}>
//                                 <span className="room-number-span">
//                                   Room {roomIndex + 1}
//                                 </span>
//                                 <h6 className="title mb-0">
//                                   {roomInfo.roomName}
//                                 </h6>
//                               </Col>
//                             </Row>
//                           ))}
//                         </Col>
//                       </Row>
//                     </td>

//                     <td className="build-pkg-td-last">
//                       {roomsArr.map((roomInfo) => (
//                         <p> INR: {roomInfo.ratePlans[0].price.total} </p>
//                       ))}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             ) : (
//               rooms.map((roomsArr) => (
//                 <tbody>
//                   {roomsArr.map((roomInfo, index) => (
//                     <tr key={index + "fixed"}>
//                       <td className="option_Name crossmark-option">
//                         <Row gutter={[4, 16]}>
//                           <Col md={1} sm={1} xs={1}>
//                             <Form.Check
//                               type="checkbox"
//                               id={"hotel" + index}
//                               checked={selectedHotel[0]?.checkedId === index}
//                               onClick={(e) => {
//                                 onSelectHotel(
//                                   [roomInfo],
//                                   index,
//                                   e.target.checked
//                                 );
//                               }}
//                             />
//                           </Col>
//                           <Col md={23} sm={23} xs={23}>
//                             <Row gutter={[16, 16]} className="mb-2">
//                               <Col md={20} sm={20} xs={20}>
//                                 <h6 className="title">{roomInfo.roomName}</h6>
//                               </Col>
//                             </Row>
//                           </Col>
//                         </Row>
//                       </td>

//                       <td className="build-pkg-td-last">
//                         INR: {roomInfo.ratePlans[0].price.total}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               ))
//             )}
//           </Table>
//           {isfrompackage ? (
//             <div>
//               <Button
//                 className="add-h-panel"
//                 data-toggle="modal"
//                 data-target={`${
//                   selectedHotel.length > 0 ? "#myBuildActivitiesModal" : ""
//                 }`}
//                 onClick={() => addHotelToQuotation()}
//               >
//                 Add Hotel To Package
//               </Button>
//             </div>
//           ) : null}
//         </div>
//       ) : (
//         <p>Rooms are not available</p>
//       )}
//     </>
//   );
// };

// export default HotelRoomtable;
