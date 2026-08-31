import React, { useEffect, useState } from 'react';

import { Typography, Card, Button, Row, Col, Select, Switch, Table } from 'antd';
import { Link } from "react-router";
import ApiClient from '../Helpers/ApiClient';
import { Form, Modal, Input } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { notifySuccess, notifyError, notifyWarning }
    from "../../public/js/notify/notify";
import { use } from 'react';


const Users = () => {
    const [form] = Form.useForm();
    const [users, setUsers] = useState([]);
    const [id, setId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [statusId, setStatusId] = useState(null);
    const [memberships, setMemberships] = useState([]);
    const [rolesList, setRolesList] = useState([]);
    const [currenciesList, setCurrenciesList] = useState([]);
   
    const openDeleteModal = (id) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };
    const openStatus = (status)=>{
        setStatusOpen(true);
        setStatusId(status);
    }
    function GetRoles() {
        ApiClient.get("Role/GetRoles")
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setRolesList(res.data);
                } else if (res.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });

    }
    const handleSubmit = async (va) => {
        try {
            const values = await form.validateFields();
            values.Id = id == null ? null : id;
            // Remove password from payload
            delete values.password;
            const res = await ApiClient.post("Users/CreateUser", values);

            console.log("Res:", res);

            if (res.success === true) {
                notifySuccess("success", res.message);  // refresh list
                setOpen(false);         // close modal
                form.resetFields();
                GetUsers();
                setId(null) // reset form
            }
            else if (res.status === 409) {
                notifyWarning("warning", res.message || "Duplicate Role");
            }
            else {
                notifyError("danger", res.Message || "Something went wrong");
            }

        } catch (err) {
            console.log("Validation Failed:", err);
        }
    };

    function GetMemberships() {
        ApiClient.get("Membership/GetMemberships")
            .then((res) => {
                if (res?.success === true) {
                    setMemberships(res.data || []);
                } else if (res?.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });
    }

    function GetCurrencies() {
        ApiClient.get("Currency/GetCurrencies")
            .then((res) => {
                console.log("Currencies Res:", res);
                if (res?.success === true) {
                    setCurrenciesList(res.data || []);
                } else if (res?.status == 409) {
                    notifyError("danger", res.message);
                } else {
                    notifyError("danger", res.message);
                }
            })
            .catch((e) => {
                console.error("Error fetching currencies:", e);
            });
    }

 

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
        setId(null)
        setStatusId(null)
    };
    useEffect(() => {
        GetUsers();
        GetRoles();
        GetMemberships();
        GetCurrencies();
    }, []);

    function GetUsers() {
        ApiClient.get("Users/GetUsers")
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setUsers(res.data);
                } else if (res.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });

    }
    function editUser(record) {
        console.log("re", record)
        form.setFieldsValue(record);
        setId(record.id)
        setOpen(true);
    }
    function handleDelete() {
        ApiClient.put(`Users/DeleteUser/${deleteId}`)
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setDeleteId(null);
                    setDeleteOpen(false);
                    GetUsers();
                    notifySuccess("success", res.message);
                } else if (res.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });
    }
      function handleStatus() {
console.log("gh",statusId)
        ApiClient.put(`Users/ChangeStatus/${statusId.id}/${!statusId.isActive}`)
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setStatusOpen(false);
                    setStatusId(null);
                    GetUsers();
                    notifySuccess("success", res.message);
                } else if (res.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });
    }
    const columns = [
        {
            title: 'Actions',
            key: 'actions',
            render: (_, user) => (
                <div className="d-flex align-items-center gap-3">
                    <i
                        className="fa fa-pencil-square-o text-warning"
                        style={{ cursor: "pointer" }}
                        title="Edit"
                        onClick={() => editUser(user)}
                    ></i>
                    <i
                        className="fa fa-trash-o text-danger"
                        style={{ cursor: "pointer" }}
                        title="Delete"
                        onClick={() => openDeleteModal(user.id)}
                    ></i>
                    <Switch
                        size={'small'}
                        onChange={() => { openStatus(user) }}
                        title={user.isActive ? 'Active' : 'InActive'}
                        defaultChecked={user.isActive}
                    />
                </div>
            ),
        },
        { title: 'Company Name', dataIndex: 'companyName', key: 'companyName' },
        { title: 'User Name', dataIndex: 'userName', key: 'userName' },
        { title: 'Email', dataIndex: 'emailId', key: 'emailId' },
        { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
        { title: 'Role', dataIndex: 'roleName', key: 'roleName' },
        { title: 'Membership', dataIndex: 'memberShipName', key: 'memberShipName' },
        { title: 'Balance', dataIndex: 'balance', key: 'balance' },
        { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
        { title: 'Created Date', dataIndex: 'createdDate', key: 'createdDate' },
        { title: 'Modified By', dataIndex: 'modifiedBy', key: 'modifiedBy' },
        { title: 'Modified Date', dataIndex: 'modifiedDate', key: 'modifiedDate' },
    ];

    return (
        <div className="row">
            <div className="col-sm-12">
                <div className="card">

                    <div className="card-header card-header--2">
                        <h5>All Users</h5>

                        <button
                            type="button"
                            className="btn btn-theme"
                            onClick={() => setOpen(true)}
                        >
                            <i data-feather="plus-square"></i> Add New
                        </button>
                    </div>


                    <div className="card-body">
                        <div className="table-responsive table-desi">
                            <Table 
                                columns={columns} 
                                dataSource={users} 
                                size="small" 
                                scroll={{ x: 'max-content' }} 
                                rowKey={(record) => record.id || record.userName}
                                pagination={{ pageSize: 10 }}
                            />
                        </div>
                    </div>

                </div>
            </div>
            <Modal
                open={deleteOpen}
                footer={null}
                closable={false}
                width={420}
                centered
            >
                <div className="card mb-0">
                    <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between">
                        <h6 className="mb-0">Confirm Delete</h6>
                        <i
                            className="fa fa-times cursor-pointer"
                            style={{ fontSize: "16px" }}
                            onClick={() => setDeleteOpen(false)}
                        ></i>
                    </div>


                    <div className="card-body text-center py-4">
                        <i className="fa fa-trash text-danger fs-2 mb-2"></i>

                        <h6 className="mb-1">Are you sure you want to delete?</h6>
                        <small className="text-muted">
                            This action cannot be undone.
                        </small>
                    </div>

                    <div className="card-footer text-center py-2">
                        <button
                            className="btn btn-danger me-2 px-4"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                        <button
                            className="btn btn-outline-secondary px-4"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

   <Modal
                open={statusOpen}
                footer={null}
                closable={false}
                width={420}
                centered
            >
                <div className="card mb-0">
                    <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between">
                        <h6 className="mb-0">Confirm Status Change</h6>
                        <i
                            className="fa fa-times cursor-pointer"
                            style={{ fontSize: "16px" }}
                            onClick={() => setStatusOpen(false)}
                        ></i>
                    </div>


                    <div className="card-body text-center py-4">
                        <i className="fa fa-trash text-danger fs-2 mb-2"></i>

                        <h6 className="mb-1">Are you sure you want to change status?</h6>
                    </div>

                    <div className="card-footer text-center py-2">
                        <button
                            className="btn btn-danger me-2 px-4"
                            onClick={handleStatus}
                        >
                            Change Status
                        </button>
                        <button
                            className="btn btn-outline-secondary px-4"
                            onClick={() => setStatusOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={open}
                footer={null}
                closable={false}
                centered
                width={900}
                onCancel={handleCancel}
            >
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5>{id == null ? "Add User" : "Update User"}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleCancel}
                        ></button>
                    </div>

                    <div className="card-body">
                        <Form form={form} layout="vertical">

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="userName"
                                        label="User Name"
                                        rules={[{ required: true, message: "User Name is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="User Name" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="firstName"
                                        label="First Name"
                                        rules={[{ required: true, message: "First Name is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="First Name" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="lastName"
                                        label="Last Name"
                                        rules={[{ required: true, message: "Last Name is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="Last Name" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="emailId"
                                        label="Email Id"
                                        rules={[
                                            { required: true, message: "Email is required" },
                                            { type: 'email', message: 'Please enter a valid email!' },
                                        ]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="Email" type="email" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="isd"
                                        label="ISD"
                                        rules={[{ required: true, message: "ISD is required" }]}
                                    >
                                        <Input type="number" min={1} max={999} style={{ height: "50px" }} placeholder="ISD" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Phone Number"
                                        rules={[{ required: true, message: "Phone Number is required" }]}
                                    >
                                        <Input type="number" maxLength={15} style={{ height: "50px" }} placeholder="Phone Number" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="memberShip"
                                        label="Membership Name"
                                        rules={[{ required: true, message: "Please select membership" }]}
                                    >
                                        <Select placeholder="Please select membership" style={{ height: "50px" }}>
                                            {memberships.map(item => (
                                                <Select.Option key={item.id} value={item.id}>
                                                    {item.membership}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="role"
                                        label="Role Name"
                                        rules={[{ required: true, message: "Please select role" }]}
                                    >
                                        <Select placeholder="Please select role" style={{ height: "50px" }}>
                                            {rolesList.map(item => (
                                                <Select.Option key={item.id} value={item.id}>
                                                    {item.roleName}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="gender"
                                        label="Gender"
                                        rules={[{ required: true, message: "Gender is required" }]}
                                    >
                                        <Select placeholder="Please select gender" style={{ height: "50px" }}>
                                            <Select.Option key={1} value="Male">Male</Select.Option>
                                            <Select.Option key={2} value="Female">Female</Select.Option>
                                            <Select.Option key={3} value="Others">Others</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="title"
                                        label="Title"
                                        rules={[{ required: true, message: "Title is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="Title" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="companyName"
                                        label="Company Name"
                                        rules={[{ required: true, message: "Company Name is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="Company Name" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="city"
                                        label="City"
                                        rules={[{ required: true, message: "City is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="City" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="state"
                                        label="State"
                                        rules={[{ required: true, message: "State is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="State" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="country"
                                        label="Country"
                                        rules={[{ required: true, message: "Country is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="Country" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="address"
                                        label="Address"
                                        rules={[{ required: true, message: "Address is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} placeholder="Address" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="pincode"
                                        label="Pincode"
                                        rules={[{ required: true, message: "Pincode is required" }]}
                                    >
                                        <Input style={{ height: "50px" }} type="number" placeholder="Pincode" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="currency"
                                        label="Currency"
                                        rules={[
                                            { required: true, message: "Currency is required" }
                                        ]}
                                    >
                                        <Select placeholder="Please select currency" style={{ height: "50px" }}>
                                            {currenciesList.map(item => (
                                                <Select.Option key={item.id} value={item.currencyName}>
                                                    {item.currencyName} - {item.countryName}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>

                    <div className="card-footer text-end">
                        <button className="btn btn-primary me-3" onClick={handleSubmit}>
                            {id == null ? "Submit" : "Update"}
                        </button>
                        <button className="btn btn-outline-primary" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

        </div>

    );
};

export default Users;