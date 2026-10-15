import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Table } from 'antd';

import ApiClient from '../Helpers/ApiClient';
import { Form,Modal ,Input} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { notifySuccess,notifyError,notifyWarning } 
from "../../public/js/notify/notify";


const Role = () => {
    const [form] = Form.useForm();
    const [roles, setRoles] = useState([]);
    const [id, setId]= useState(null);
const [deleteId, setDeleteId] = useState(null);
const [open, setOpen] = useState(false);
const [deleteOpen,setDeleteOpen] = useState(false);
const openDeleteModal = (id) => {
  setDeleteId(id);
  setDeleteOpen(true);
};
const handleSubmit = async () => {
  try {
    const values = await form.validateFields();

    const request = {
      Id : id == null ? null : id,
      RoleName: values.rolename
    };
 console.log("Req:", values);
    const res = await ApiClient.post("Role/AddRole", request);

    console.log("Res:", res);

    if (res.success === true) {
    notifySuccess("success", res.message);
      //setRoles(res.data);     // refresh list
      setOpen(false);         // close modal
      form.resetFields();  
        GetRoles();  
        setId(null) // reset form
    } 
    else if (res.status === 409) {
      notifyWarning("warning",res.message || "Duplicate Role");
    } 
    else {
      notifyError("danger",res.Message || "Something went wrong");
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
   GetRoles();
},[]);

function GetRoles(){
  ApiClient.get("Role/GetRoles")
      .then((res) => {
        console.log("Res : ", res)
        if (res.success === true) {
            setRoles(res.data);
        } else if (res.status == 409) {
          message.error(res.message);
        } else {
          message.error(res.message);
        }
      })
      .catch((e) => { });
    
}
function editRole(record){
   form.setFieldsValue({
      rolename: record.roleName,
    });
  setId(record.id)
setOpen(true);
}
function handleDelete(){
 ApiClient.put(`Role/DeleteRole/${deleteId}`)
      .then((res) => {
        console.log("Res : ", res)
        if (res.success === true) {
          setDeleteId(null);
  setDeleteOpen(false);
  GetRoles();
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
      render: (_, role) => (
        <div className="d-flex align-items-center gap-3">
          <i
            className="fa fa-pencil-square-o text-warning"
            style={{ cursor: "pointer" }}
            title="Edit"
            onClick={() => editRole(role)}
          ></i>
          <i
            className="fa fa-trash-o text-danger"
            style={{ cursor: "pointer" }}
            title="Delete"
            onClick={() => openDeleteModal(role.id)}
          ></i>
        </div>
      ),
    },
    { title: 'Role Name', dataIndex: 'roleName', key: 'roleName' },
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
  <h5>All Roles</h5>

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
                dataSource={roles} 
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
          <h6 className="mb-1">Are you sure you want to delete this role?</h6>
          <small className="text-muted">This action cannot be undone.</small>
        </div>
      </Modal>

      {/* Add / Update Role Modal */}
      <Modal
        title={id == null ? "Add Role" : "Update Role"}
        open={open}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={id == null ? "Submit" : "Update"}
        cancelText="Cancel"
        width={460}
        centered
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
        >
          <Form.Item
            label="Role Name"
            name="rolename"
            rules={[{ required: true, message: "Role Name is required" }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>
        </Form>
      </Modal>


    </div>
    
  );
};

export default Role;
