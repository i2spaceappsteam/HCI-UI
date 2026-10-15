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
          <h6 className="mb-1">Are you sure you want to delete this membership?</h6>
          <small className="text-muted">This action cannot be undone.</small>
        </div>
      </Modal>

      {/* Add / Update Membership Modal */}
      <Modal
        title={id == null ? "Add Membership" : "Update Membership"}
        open={open}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={id == null ? "Submit" : "Update"}
        cancelText="Cancel"
        width={460}
        centered
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Membership Name"
            name="membershipname"
            rules={[{ required: true, message: "Membership Name is required" }]}
          >
            <Input placeholder="Enter membership name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Membership;