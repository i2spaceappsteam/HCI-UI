import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Row, Col, Select, Table } from 'antd';

import ApiClient from '../Helpers/ApiClient';
import { Form, Modal, Input } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { notifySuccess, notifyError, notifyWarning }
    from "../../public/js/notify/notify";


const Screens = () => {
    const [form] = Form.useForm();
    const [screens, setScreens] = useState([]);
    const [id, setId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [categoryList, setCategoryList] = useState([]);
    const openDeleteModal = (id) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const request = {
                Id: id == null ? null : id,
                ScreenName: values.screen,
                CategoryId:values.category,
                Path:values.url
            };
            console.log("Req:", values);
            const res = await ApiClient.post("Screens/AddScreen", request);

            console.log("Res:", res);

            if (res.success === true) {
                notifySuccess("success", res.message);
                setOpen(false);         // close modal
                form.resetFields();
                GetScreens();
                setId(null) // reset form
            }
            else if (res.status === 409) {
                notifyWarning("warning", res.message || "Duplicate Screen");
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
        GetScreens();
        CategoryList();
    }, []);

    function GetScreens() {
        ApiClient.get("Screens/GetScreens")
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setScreens(res.data);
                } else if (res.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });

    }
    function editScreen(record) {
        form.setFieldsValue({
            screen: record.screenName,
            url:record.path,
            category:record.categoryId
        });
        setId(record.id)
        setOpen(true);
    }
    function handleDelete() {
        ApiClient.put(`Screens/DeleteScreen/${deleteId}`)
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setDeleteId(null);
                    setDeleteOpen(false);
                    GetScreens();
                    notifySuccess("success", res.message);
                } else if (res.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });
    }
    function CategoryList() {
        ApiClient.get("Category/GetCategory")
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setCategoryList(res.data);
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
            render: (_, screen) => (
                <div className="d-flex align-items-center gap-3">
                    <i
                        className="fa fa-pencil-square-o text-warning"
                        style={{ cursor: "pointer" }}
                        title="Edit"
                        onClick={() => editScreen(screen)}
                    ></i>
                    <i
                        className="fa fa-trash-o text-danger"
                        style={{ cursor: "pointer" }}
                        title="Delete"
                        onClick={() => openDeleteModal(screen.id)}
                    ></i>
                </div>
            ),
        },
        { title: 'Screen Name', dataIndex: 'screenName', key: 'screenName' },
        { title: 'Category', dataIndex: 'categoryName', key: 'categoryName' },
        { title: 'Path', dataIndex: 'path', key: 'path' },
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
                        <h5>All Screens</h5>

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
                                dataSource={screens} 
                                size="small" 
                                scroll={{ x: 'max-content' }} 
                                rowKey={(record) => record.id || record.screenName}
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
                    <h6 className="mb-1">Are you sure you want to delete this screen?</h6>
                    <small className="text-muted">
                        This action cannot be undone.
                    </small>
                </div>
            </Modal>

            {/* Add / Update Screen Modal */}
            <Modal
                title={id == null ? "Add Screen" : "Update Screen"}
                open={open}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText={id == null ? "Submit" : "Update"}
                cancelText="Cancel"
                width={680}
                centered
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Category"
                                name="category"
                                rules={[{ required: true, message: "Please select category" }]}
                            >
                                <Select placeholder="Select category">
                                    {categoryList.map(item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.categoryName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Screen Name"
                                name="screen"
                                rules={[{ required: true, message: "Please enter screen name" }]}
                            >
                                <Input placeholder="Enter screen name" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Screen URL"
                                name="url"
                                rules={[{ required: true, message: "Please enter screen URL" }]}
                            >
                                <Input placeholder="e.g. /Admin/Screens" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>


        </div>

    );
};

export default Screens;
