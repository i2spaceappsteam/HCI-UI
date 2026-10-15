import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Select, Row, Col, Table } from 'antd';

import ApiClient from '../Helpers/ApiClient';
import { Form, Modal, Input } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { notifySuccess, notifyError, notifyWarning }
    from "../../public/js/notify/notify";


const ScreenMapping = () => {
    const [form] = Form.useForm();
    const [mappings, setmappings] = useState([]);
    const [id, setId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [rolesList, setRolesList] = useState([]);
    const [screensList, setScreensList] = useState([]);
    const openDeleteModal = (id) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };
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
    function GetScreens() {
        ApiClient.get("Screens/GetScreens")
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setScreensList(res.data);
                } else if (res.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });

    }
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const request = {
                Id: id == null ? null : id,
                RoleId: values.role,
                Screens: values.screens
            };
            console.log("Req:", values);
            const res = await ApiClient.post("RoleScreenMappings/Add", request);

            console.log("Res:", res);

            if (res.success === true) {
                notifySuccess("success", res.message);
                setOpen(false);         // close modal
                form.resetFields();
                GetMappings();
                setId(null) // reset form
            }
            else if (res.status === 409) {
                notifyWarning("warning", res.message || "Duplicate Mappings");
            }
            else {
                notifyError("danger", res.Message || "Something went wrong");
            }

        } catch (err) {
            console.log("Validation Failed:", err);
        }
    };



    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
        setId(null)
    };
    useEffect(() => {
        GetMappings();
        GetRoles();
        GetScreens();
    }, []);

    function GetMappings() {
        ApiClient.get("RoleScreenMappings/GetAll")
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setmappings(res.data);
                } else if (res.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });

    }
    function editMapping(record) {
        form.setFieldsValue({
            role: record.roleId,
            screens: record.screensId
        });
        setId(record.id)
        setOpen(true);
    }
    function handleDelete() {
        ApiClient.put(`RoleScreenMappings/Delete/${deleteId}`)
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setDeleteId(null);
                    setDeleteOpen(false);
                    GetMappings();
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
            render: (_, mapping) => (
                <div className="d-flex align-items-center gap-3">
                    <i
                        className="fa fa-pencil-square-o text-warning"
                        style={{ cursor: "pointer" }}
                        title="Edit"
                        onClick={() => editMapping(mapping)}
                    ></i>
                    <i
                        className="fa fa-trash-o text-danger"
                        style={{ cursor: "pointer" }}
                        title="Delete"
                        onClick={() => openDeleteModal(mapping.id)}
                    ></i>
                </div>
            ),
        },
        { title: 'Role Name', dataIndex: 'roleName', key: 'roleName' },
        { title: 'Screens', dataIndex: 'screens', key: 'screens' },
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
                        <h5>All Screen Mappings</h5>

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
                                dataSource={mappings} 
                                size="small" 
                                scroll={{ x: 'max-content' }} 
                                rowKey={(record) => record.id || record.roleName}
                                pagination={{ pageSize: 10 }}
                            />
                        </div>
                    </div>

                </div>
            </div>
            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Confirmation"
                open={deleteOpen}
                onOk={handleDelete}
                onCancel={() => setDeleteOpen(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
                width={380}
                centered
            >
                <div className="text-center py-3">
                    <i className="fa fa-trash-o text-danger fs-1 mb-2 d-block"></i>
                    <h6 className="mb-1">Are you sure you want to delete this mapping?</h6>
                    <small className="text-muted">
                        This action cannot be undone.
                    </small>
                </div>
            </Modal>

            {/* Add / Update Mapping Modal */}
            <Modal
                title={id == null ? "Add Mapping" : "Update Mapping"}
                open={open}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText={id == null ? "Submit" : "Update"}
                cancelText="Cancel"
                width={580}
                centered
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Role Name"
                                name="role"
                                rules={[{ required: true, message: "Please select role" }]}
                            >
                                <Select placeholder="Select role">
                                    {rolesList.map(item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.roleName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Screens"
                                name="screens"
                                rules={[{ required: true, message: "Please select screen" }]}
                            >
                                <Select
                                    maxTagCount="responsive"
                                    placeholder="Select screens"
                                    mode="multiple"
                                >
                                    {screensList.map(item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.screenName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>


        </div>

    );
};

export default ScreenMapping;
