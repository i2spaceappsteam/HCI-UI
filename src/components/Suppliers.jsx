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
          <h6 className="mb-1">Are you sure you want to delete this supplier?</h6>
          <small className="text-muted">This action cannot be undone.</small>
        </div>
      </Modal>

      {/* Add / Update Supplier Modal */}
      <Modal
        title={id == null ? "Add Supplier" : "Update Supplier"}
        open={open}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={id == null ? "Submit" : "Update"}
        cancelText="Cancel"
        width={720}
        centered
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Supplier Name"
                name="supplierName"
                rules={[{ required: true, message: "Supplier Name is required" }]}
              >
                <Input placeholder="Enter supplier name" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Base URL"
                name="baseUrl"
                rules={[{ required: true, message: "Base URL is required" }]}
              >
                <Input placeholder="Enter base URL" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="User Name"
                name="userName"
                rules={[{ required: true, message: "User Name is required" }]}
              >
                <Input placeholder="Enter user name" />
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
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="API Key"
                name="apiKey"
                rules={[{ required: true, message: "API Key is required" }]}
              >
                <Input placeholder="Enter API key" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Minimum Balance"
                name="minimumBalance"
                rules={[{ required: true, message: "Minimum Balance is required" }]}
              >
                <Input type="number" placeholder="Enter minimum balance" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Remarks"
                name="remarks"
              >
                <Input placeholder="Enter remarks" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <h6 className="mb-3 mt-2 fw-bold text-dark">Configurations</h6>
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
                        <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444', cursor: 'pointer', fontSize: '16px' }} />
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
      </Modal>

    </div>

  );
};

export default Suppliers;