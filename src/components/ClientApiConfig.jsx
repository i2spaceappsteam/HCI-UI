import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Row, Col, Select, Table } from 'antd';

import ApiClient from '../Helpers/ApiClient';
import { Form, Modal, Input } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { notifySuccess, notifyError, notifyWarning }
  from "../../public/js/notify/notify";


const ClientApiConfig = () => {
  const [form] = Form.useForm();
  const [usersList, setUsersList] = useState([]);
  const [supplierList, setSuppliers] = useState([]);
  const [isUser, setIsUser] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [configList, setConfigList] = useState([]);
  const [id, setId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };
  const handleSupplierChange = (supplierId, checked) => {
    setSelectedSuppliers((prev) => {
      if (checked) {
        return [...prev, supplierId]; // add
      } else {
        return prev.filter((id) => id !== supplierId); // remove
      }
    });
  };
  function GetSuppliers() {
    ApiClient.get("Supplier/GetSuppliers")
      .then((res) => {
        console.log("Res : ", res)
        if (res.success === true) {
          setSuppliers(res.data);
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
      console.log("req", values);

      const request = {
        Id: id == null ? null : id,
        UserId: values.userId,
        ServiceType: values.services,
        SuppliersId: selectedSuppliers
      };
      console.log("Req:", request);
      const res = await ApiClient.post("ClientApiConfig/AddConfig", request);

      console.log("Res:", res);

      if (res.success === true) {
        notifySuccess("success", res.message);    // refresh list
        setOpen(false);         // close modal
        form.resetFields();
        GetConfigs();
        setId(null) // reset form
      }
      else if (res.status === 409) {
        notifyWarning("warning", res.message || "Already record exist");
      }
      else {
        notifyError("danger", res.Message || "Something went wrong");
      }

    } catch (err) {
      console.log("Validation Failed:", err);
    }
  };
  function GetUsers() {
    ApiClient.get("Users/GetUsers")
      .then((res) => {
        console.log("Res : ", res)
        if (res.success === true) {
          setUsersList(res.data);
        } else if (res.status == 409) {
          message.error(res.message);
        } else {
          message.error(res.message);
        }
      })
      .catch((e) => { });

  }
  function GetConfigs() {
    ApiClient.get("ClientApiConfig/GetClientConfigs")
      .then((res) => {
        console.log("Res : ", res)
        if (res.success === true) {
          setConfigList(res.data);
        } else if (res.status == 409) {
          message.error(res.message);
        } else {
          message.error(res.message);
        }
      })
      .catch((e) => { });

  }


  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setId(null)
  };
  useEffect(() => {
    GetConfigs();
    GetUsers();
    GetSuppliers();
  }, []);

  function editConfig(record) {
    form.setFieldsValue({
      usertype: record.userId ? 2 : 1,
      userId: record.userId,
      services: record.serviceType
    });
    setSelectedSuppliers(record.suppliersId || []);
    setIsUser(record.userId == 1 ? false : true);
    setId(record.id)
    setOpen(true);
  }
  function handleDelete() {
    ApiClient.put(`ClientApiConfig/DeleteConfig/${deleteId}`)
      .then((res) => {
        console.log("Res : ", res)
        if (res.success === true) {
          setDeleteId(null);
          setDeleteOpen(false);
          GetConfigs();
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
      title: <span style={{ whiteSpace: 'nowrap' }}>Actions</span>,
      key: 'actions',
      render: (_, config) => (
        <div className="d-flex align-items-center gap-3">
          <i
            className="fa fa-pencil-square-o text-warning"
            style={{ cursor: "pointer" }}
            title="Edit"
            onClick={() => editConfig(config)}
          ></i>
          <i
            className="fa fa-trash-o text-danger"
            style={{ cursor: "pointer" }}
            title="Delete"
            onClick={() => openDeleteModal(config.id)}
          ></i>
        </div>
      ),
    },
    { title: <span style={{ whiteSpace: 'nowrap' }}>Company Name</span>, dataIndex: 'companyName', key: 'companyName' },
    { title: <span style={{ whiteSpace: 'nowrap' }}>Suppliers</span>, dataIndex: 'suppliers', key: 'suppliers' },
    { title: <span style={{ whiteSpace: 'nowrap' }}>Services</span>, dataIndex: 'serviceTypesList', key: 'serviceTypesList' },
    { title: <span style={{ whiteSpace: 'nowrap' }}>Created By</span>, dataIndex: 'createdBy', key: 'createdBy' },
    { title: <span style={{ whiteSpace: 'nowrap' }}>Created Date</span>, dataIndex: 'createdDate', key: 'createdDate' },
    { title: <span style={{ whiteSpace: 'nowrap' }}>Modified By</span>, dataIndex: 'modifiedBy', key: 'modifiedBy' },
    { title: <span style={{ whiteSpace: 'nowrap' }}>Modified Date</span>, dataIndex: 'modifiedDate', key: 'modifiedDate' },
  ];

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="card">

          <div className="card-header card-header--2 d-flex justify-content-between align-items-center" style={{ paddingTop: '5px', paddingBottom: '5px' }}>
            <h5 className="mb-0">All Client Api Configuration</h5>

            <button
              type="button"
              className="btn btn-theme m-0"
              onClick={() => setOpen(true)}
            >
              <i data-feather="plus-square"></i> Add New
            </button>
          </div>


          <div className="card-body">
            <div className="table-responsive table-desi">
              <Table
                columns={columns}
                dataSource={configList}
                size="small"
                scroll={{ x: 'max-content' }}
                rowKey={(record) => record.id || record.companyName}
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
          <h6 className="mb-1">Are you sure you want to delete this configuration?</h6>
          <small className="text-muted">
            This action cannot be undone.
          </small>
        </div>
      </Modal>

      {/* Add / Update Configuration Modal */}
      <Modal
        title={id == null ? "Add Configuration" : "Update Configuration"}
        open={open}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={id == null ? "Submit" : "Update"}
        cancelText="Cancel"
        width={720}
        centered
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={isUser ? 8 : 12}>
              <Form.Item
                label="Role"
                name="usertype"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select
                  placeholder="Select role"
                  onChange={(val) => {
                    if (val === 2) setIsUser(true);
                    else setIsUser(false);
                  }}
                >
                  <Select.Option key={1} value={1}>
                    Admin
                  </Select.Option>
                  <Select.Option key={2} value={2}>
                    Site Admin
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {isUser && (
              <Col span={8}>
                <Form.Item
                  label="Company Name"
                  name="userId"
                  rules={[{ required: true, message: "Please select company" }]}
                >
                  <Select placeholder="Select company">
                    {usersList.map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.companyName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            <Col span={isUser ? 8 : 12}>
              <Form.Item
                label="Services"
                name="services"
                rules={[{ required: true, message: "Please select service" }]}
              >
                <Select
                  placeholder="Select service"
                  maxTagCount="responsive"
                  mode="multiple"
                >
                  <Select.Option key={1} value={1}>
                    Domestic Hotels
                  </Select.Option>
                  <Select.Option key={2} value={2}>
                    International Hotels
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <div className="mt-2">
                <label className="form-label-title mb-2">
                  <span className="text-danger">*</span> Suppliers
                </label>

                <div className="row g-2 p-3 bg-light rounded-3 border">
                  {supplierList.map((supplier, index) => (
                    <div className="col-md-3 col-sm-6" key={supplier.id || index}>
                      <div className="form-check d-flex align-items-center gap-2">
                        <input
                          className="form-check-input mt-0"
                          type="checkbox"
                          id={`supplier-${supplier.id || index}`}
                          checked={selectedSuppliers.includes(supplier.id)}
                          onChange={(e) =>
                            handleSupplierChange(supplier.id, e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label text-dark fw-medium"
                          htmlFor={`supplier-${supplier.id || index}`}
                          style={{ cursor: "pointer", fontSize: "13px" }}
                        >
                          {supplier.supplierName}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>


    </div>

  );
};

export default ClientApiConfig;
