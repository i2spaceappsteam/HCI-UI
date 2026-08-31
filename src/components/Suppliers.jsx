import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Row, Col, Space, Table } from 'antd';

import ApiClient from '../Helpers/ApiClient';
import { Form, Modal, Input } from "antd";
import { CloseOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { notifySuccess, notifyError, notifyWarning }
  from "../../public/js/notify/notify";


const Suppliers = () => {
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [id, setId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };
  const handleSubmit = async (va) => {
    try {
      const values = await form.validateFields();
      
      if (id !== null) {
          values.id = id;
      } else {
          values.id = 0;
      }

      if (values.configurations && Array.isArray(values.configurations)) {
        const configObj = {};
        values.configurations.forEach(item => {
          if (item && item.key) {
            configObj[item.key] = item.value;
          }
        });
        values.configurations = configObj;
      }

      const res = await ApiClient.post("Supplier/AddSupplier", values);

      console.log("Res:", res);

      if (res.success === true) {
        notifySuccess("success", res.message);
        //setSuppliers(res.data);     // refresh list
        setOpen(false);         // close modal
        form.resetFields();
        GetSuppliers();
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



  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setId(null)
  };
  useEffect(() => {
    GetSuppliers();
  }, []);

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
  function editSupplier(record) {
    let configArray = [];
    if (record.configurations && typeof record.configurations === 'object') {
      configArray = Object.keys(record.configurations).map(k => ({
        key: k,
        value: record.configurations[k]
      }));
    }

    form.setFieldsValue({
      ...record,
      configurations: configArray
    });
    setId(record.id)
    setOpen(true);
  }
  function handleDelete() {
    ApiClient.put(`Supplier/DeleteSupplier/${deleteId}`)
      .then((res) => {
        console.log("Res : ", res)
        if (res.success === true) {
          setDeleteId(null);
          setDeleteOpen(false);
          GetSuppliers();
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
      render: (_, supplier) => (
        <div className="d-flex align-items-center gap-3">
          <i
            className="fa fa-pencil-square-o text-warning"
            style={{ cursor: "pointer" }}
            title="Edit"
            onClick={() => editSupplier(supplier)}
          ></i>
          <i
            className="fa fa-trash-o text-danger"
            style={{ cursor: "pointer" }}
            title="Delete"
            onClick={() => openDeleteModal(supplier.id)}
          ></i>
        </div>
      ),
    },
    { title: 'Supplier Name', dataIndex: 'supplierName', key: 'supplierName' },
    { title: 'User Name', dataIndex: 'userName', key: 'userName' },
    { title: 'Base Url', dataIndex: 'baseUrl', key: 'baseUrl' },
    { title: 'Api Key', dataIndex: 'apiKey', key: 'apiKey' },
    { title: 'Minimum Balance', dataIndex: 'minimumBalance', key: 'minimumBalance' },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
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
            <h5>All Suppliers</h5>

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
                dataSource={suppliers} 
                size="small" 
                scroll={{ x: 'max-content' }} 
                rowKey={(record) => record.id || record.supplierName}
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
        width={900}
        onCancel={handleCancel}
      >
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>{id == null ? "Add Supplier" : "Update Supplier"}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCancel}
            ></button>
          </div>

          <div className="card-body">
            <Form layout="vertical" form={form} className="theme-form mega-form">

              <Row gutter={16}>

                <Col span={8}>
                  <Form.Item
                    label="Supplier Name"
                    name="supplierName"
                    rules={[{ required: true, message: "Supplier Name is required" }]}
                  >
                    <Input placeholder="Supplier Name" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Base Url"
                    name="baseUrl"
                    rules={[{ required: true, message: "Base Url is required" }]}
                  >
                    <Input placeholder="Base Url" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="User Name"
                    name="userName"
                    rules={[{ required: true, message: "User Name is required" }]}
                  >
                    <Input placeholder="User Name" />
                  </Form.Item>
                </Col>



              </Row>
              <Row gutter={16}>

                <Col span={8}>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Password is required" }]}
                  >
                    <Input placeholder="Password Name" />
                  </Form.Item>
                </Col>


                <Col span={8}>
                  <Form.Item
                    label="ApiKey"
                    name="apiKey"
                    rules={[{ required: true, message: "ApiKey is required" }]}
                  >
                    <Input placeholder="ApiKey" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Minimum Balance"
                    name="minimumBalance"
                    rules={[{ required: true, message: "Minimum Balance is required" }]}
                  >
                    <Input placeholder="Base Url" />
                  </Form.Item>
                </Col>



              </Row>
              <Row gutter={16}>

                <Col span={8}>
                  <Form.Item
                    label="Remarks"
                    name="remarks"
                  >
                    <Input placeholder="Remarks" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <h6 className="mb-3 mt-2">Configurations</h6>
                  <Form.List name="configurations">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item
                              {...restField}
                              name={[name, 'key']}
                              rules={[{ required: true, message: 'Missing key' }]}
                            >
                              <Input placeholder="Configuration Key" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'value']}
                              rules={[{ required: true, message: 'Missing value' }]}
                            >
                              <Input placeholder="Configuration Value" />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', cursor: 'pointer' }} />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Add Configuration
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
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

export default Suppliers;