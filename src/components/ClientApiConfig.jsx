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
      title: 'Actions',
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
    { title: 'Company Name', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Suppliers', dataIndex: 'suppliers', key: 'suppliers' },
    { title: 'Services', dataIndex: 'serviceTypesList', key: 'serviceTypesList' },
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
            <h5>All Client Api Configuration</h5>

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
        open={open}
        footer={null}
        closable={false}
        centered
        width={800}
        onCancel={handleCancel}
      >
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>{id == null ? "Add Config" : "Update Config"}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCancel}
            ></button>
          </div>

          <div className="card-body">
            <Form form={form}>
              <Row gutter={16}>
                <Col span={8}>
                  <div className="mb-3">
                    <label className="form-label-title">Role</label>

                    <Form.Item
                      name="usertype"
                      rules={[{ required: true, message: "Please select role" }]}
                    >
                      <Select placeholder="Please select role" onChange={(val) => {
                        if (val == 2)
                          setIsUser(true)
                        else
                          setIsUser(false)
                      }
                      } style={{ height: "50px" }} >

                        <Select.Option key={1} value={1} >
                          Admin
                        </Select.Option>
                        <Select.Option key={2} value={2} >
                          Site Admin
                        </Select.Option>

                      </Select>
                    </Form.Item>
                  </div>
                </Col>{isUser &&
                  <Col span={8}>
                    <div className="mb-3">
                      <label className="form-label-title">Company Name</label>

                      <Form.Item
                        name="userId"
                        rules={[{ required: true, message: "Please select company" }]}
                      >
                        <Select placeholder="Please select company" style={{ height: "50px" }}>
                          {usersList.map(item => (
                            <Select.Option key={item.id} value={item.id}>
                              {item.companyName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                  </Col>
                }
                <Col span={8}>
                  <div className="mb-3">
                    <label className="form-label-title">Services</label>

                    <Form.Item
                      name="services"
                      rules={[{ required: true, message: "Please select servivce" }]}
                    >
                      <Select placeholder="Please select Service" style={{ height: "50px" }} maxTagCount="responsive" mode='multiple'>

                        <Select.Option key={1} value={1} >
                          Domestic Flights
                        </Select.Option>
                        <Select.Option key={2} value={2} >
                          International Flights
                        </Select.Option>

                      </Select>
                    </Form.Item>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <div class="row mt-3">
                    <div class="col-md-12">
                      <label><span class="text-danger">*</span> Supplier</label>

                      <div class="row">
                        {supplierList.map((supplier, index) => (
                          <div className="col-md-3" key={supplier.id || index}>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`supplier-${supplier.id || index}`}
                                checked={selectedSuppliers.includes(supplier.id)}
                                onChange={(e) =>
                                  handleSupplierChange(supplier.id, e.target.checked)
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`supplier-${supplier.id || index}`}
                              >
                                {supplier.supplierName}
                              </label>
                            </div>
                          </div>
                        ))}



                      </div>
                    </div>
                  </div>
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

export default ClientApiConfig;
