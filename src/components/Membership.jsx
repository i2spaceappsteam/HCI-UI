// Membership component — reinserted to refresh editor view
import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Table } from 'antd';
import ApiClient from '../Helpers/ApiClient';
import { Form, Modal, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { notifySuccess, notifyError, notifyWarning } from "../../public/js/notify/notify";

const Membership = () => {
  const [form] = Form.useForm();
  const [memberships, setMemberships] = useState([]);
  const [id, setId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const request = id == null ? { membershipName: values.membershipname } : { Id: id, membershipName: values.membershipname };

      const res = await ApiClient.post("Membership/AddMembership", request);

      if (res?.success === true) {
        notifySuccess("success", res.message);
        setOpen(false);
        form.resetFields();
        GetMemberships();
        setId(null);
      } else if (res?.status === 409) {
        notifyWarning("warning", res.message || "Duplicate Membership");
      } else {
        notifyError("danger", res.message || "Something went wrong");
      }
    } catch (err) {
      console.log("Validation Failed:", err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setId(null);
  };

  useEffect(() => {
    GetMemberships();
  }, []);

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
      .catch((e) => {});
  }

  function editMembership(record) {
    form.setFieldsValue({
      membershipname: record.membership,
    });
    setId(record.id);
    setOpen(true);
  }

  function handleDelete() {
    ApiClient.put(`Membership/DeleteMembership/${deleteId}`)
      .then((res) => {
        if (res?.success === true) {
          setDeleteId(null);
          setDeleteOpen(false);
          GetMemberships();
          notifySuccess("success", res.message);
        } else if (res?.status == 409) {
          message.error(res.message);
        } else {
          message.error(res.message);
        }
      })
      .catch((e) => {});
  }

  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      render: (_, m) => (
        <div className="d-flex align-items-center gap-3">
          <i
            className="fa fa-pencil-square-o text-warning"
            style={{ cursor: "pointer" }}
            title="Edit"
            onClick={() => editMembership(m)}
          ></i>
          <i
            className="fa fa-trash-o text-danger"
            style={{ cursor: "pointer" }}
            title="Delete"
            onClick={() => openDeleteModal(m.id)}
          ></i>
        </div>
      ),
    },
    { title: 'Membership', dataIndex: 'membership', key: 'membership' },
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
            <h5>All Memberships</h5>
            <button type="button" className="btn btn-theme" onClick={() => setOpen(true)}>
              <i data-feather="plus-square"></i> Add New
            </button>
          </div>

          <div className="card-body">
            <div className="table-responsive table-desi">
              <Table 
                columns={columns} 
                dataSource={memberships} 
                size="small" 
                scroll={{ x: 'max-content' }} 
                rowKey={(record) => record.id || record.membership}
                pagination={{ pageSize: 10 }}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal open={deleteOpen} footer={null} closable={false} width={420} centered>
        <div className="card mb-0">
          <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between">
            <h6 className="mb-0">Confirm Delete</h6>
            <i className="fa fa-times cursor-pointer" style={{ fontSize: "16px" }} onClick={() => setDeleteOpen(false)}></i>
          </div>

          <div className="card-body text-center py-4">
            <i className="fa fa-trash text-danger fs-2 mb-2"></i>

            <h6 className="mb-1">Are you sure you want to delete?</h6>
            <small className="text-muted">This action cannot be undone.</small>
          </div>

          <div className="card-footer text-center py-2">
            <button className="btn btn-danger me-2 px-4" onClick={handleDelete}>
              Delete
            </button>
            <button className="btn btn-outline-secondary px-4" onClick={() => setDeleteOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={open} footer={null} closable={false} centered width={600} onCancel={handleCancel}>
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>{id == null ? "Add Membership" : "Update Membership"}</h5>
            <button type="button" className="btn-close" onClick={handleCancel}></button>
          </div>

          <div className="card-body">
            <Form layout="vertical" form={form} className="theme-form mega-form">
              <div className="mb-3">
                <label className="form-label-title">Membership Name</label>
                <Form.Item name="membershipname" rules={[{ required: true, message: "Membership Name is required" }]}> 
                  <Input className="form-control" placeholder="Membership Name" />
                </Form.Item>
              </div>
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

export default Membership;