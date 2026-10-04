import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, Row, Col } from 'antd';
import ApiClient from '../Helpers/ApiClient';
import { notifySuccess, notifyError, notifyWarning } from "../../public/js/notify/notify";

const Currency = () => {
    const [form] = Form.useForm();
    const [currencies, setCurrencies] = useState([]);
    const [id, setId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const openDeleteModal = (id) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };

    useEffect(() => {
        GetCurrencies();
    }, []);

    // GET /api/Currency/GetCurrencies
    function GetCurrencies() {
        ApiClient.get("Currency/GetCurrencies")
            .then((res) => {
                console.log("Currencies Res:", res);
                if (res.success === true) {
                    setCurrencies(res.data);
                } else if (res.status === 409) {
                    notifyError("danger", res.message);
                } else {
                    notifyError("danger", res.message);
                }
            })
            .catch((e) => {
                console.error("Error fetching currencies:", e);
            });
    }

    // POST /api/Currency/AddOrUpdateCurrency
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            values.id = id == null ? null : id;

            const res = await ApiClient.post("Currency/AddOrUpdateCurrency", values);

            console.log("Res:", res);

            if (res.success === true) {
                notifySuccess("success", res.message);
                setOpen(false);
                form.resetFields();
                GetCurrencies();
                setId(null);
            } else if (res.status === 409) {
                notifyWarning("warning", res.message || "Duplicate Currency");
            } else {
                notifyError("danger", res.message || "Something went wrong");
            }
        } catch (err) {
            console.log("Validation Failed:", err);
        }
    };

    // PUT /api/Currency/DeleteCurrency/{id}
    function handleDelete() {
        ApiClient.put(`Currency/DeleteCurrency/${deleteId}`)
            .then((res) => {
                console.log("Delete Res:", res);
                if (res.success === true) {
                    setDeleteId(null);
                    setDeleteOpen(false);
                    GetCurrencies();
                    notifySuccess("success", res.message);
                } else if (res.status === 409) {
                    notifyError("danger", res.message);
                } else {
                    notifyError("danger", res.message);
                }
            })
            .catch((e) => {
                console.error("Error deleting currency:", e);
            });
    }

    function editCurrency(record) {
        console.log("Edit record:", record);
        form.setFieldsValue(record);
        setId(record.id);
        setOpen(true);
    }

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
        setId(null);
    };

    const columns = [
        {
            title: 'Actions',
            key: 'actions',
            render: (_, currency) => (
                <div className="d-flex align-items-center gap-3">
                    <i
                        className="fa fa-pencil-square-o text-warning"
                        style={{ cursor: "pointer" }}
                        title="Edit"
                        onClick={() => editCurrency(currency)}
                    ></i>
                    <i
                        className="fa fa-trash-o text-danger"
                        style={{ cursor: "pointer" }}
                        title="Delete"
                        onClick={() => openDeleteModal(currency.id)}
                    ></i>
                </div>
            ),
        },
        { title: 'Country Name', dataIndex: 'countryName', key: 'countryName' },
        { title: 'Currency Code', dataIndex: 'currencyName', key: 'currencyName' },
        { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
        { title: 'Created Date', dataIndex: 'createdDate', key: 'createdDate' },
        { title: 'Modified By', dataIndex: 'modifiedBy', key: 'modifiedBy' },
    ];

    return (
        <div className="row">
            <div className="col-sm-12">
                <div className="card">
                    <div className="card-header card-header--2">
                        <h5>All Currencies</h5>
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
                                dataSource={currencies}
                                size="small"
                                scroll={{ x: 'max-content' }}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
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

            {/* Add/Edit Modal */}
            <Modal
                open={open}
                footer={null}
                closable={false}
                centered
                width={600}
                onCancel={handleCancel}
            >
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5>{id == null ? "Add Currency" : "Update Currency"}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleCancel}
                        ></button>
                    </div>

                    <div className="card-body">
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="countryName"
                                label="Country Name"
                                rules={[{ required: true, message: "Country Name is required" }]}
                            >
                                <Input style={{ height: "50px" }} placeholder="Country Name" />
                            </Form.Item>

                            <Form.Item
                                name="currencyCode"
                                label="Currency Code"
                                rules={[{ required: true, message: "Currency Code is required" }]}
                            >
                                <Input style={{ height: "50px" }} placeholder="Currency Code (e.g., USD, INR)" maxLength={3} />
                            </Form.Item>
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

export default Currency;
