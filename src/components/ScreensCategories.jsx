import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Table } from 'antd';

import ApiClient from '../Helpers/ApiClient';
import { Form,Modal ,Input} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { notifySuccess,notifyError,notifyWarning } 
from "../../public/js/notify/notify";


const ScreenCategories = () => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
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
      Name: values.name
    };
 console.log("Req:", values);
    const res = await ApiClient.post("Category/AddCategory", request);

    console.log("Res:", res);

    if (res.success === true) {
    notifySuccess("success", res.message);
      setOpen(false);         // close modal
      form.resetFields();  
        GetCategories();  
        setId(null) // reset form
    } 
    else if (res.status === 409) {
      notifyWarning("warning",res.message || "Duplicate Category");
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
   GetCategories();
},[]);

function GetCategories(){
  ApiClient.get("Category/GetCategory")
      .then((res) => {
        console.log("Res : ", res)
        if (res.success === true) {
            setCategories(res.data);
        } else if (res.status == 409) {
          message.error(res.message);
        } else {
          message.error(res.message);
        }
      })
      .catch((e) => { });
    
}
function editCategory(record){
   form.setFieldsValue({
      name: record.categoryName,
    });
  setId(record.id)
setOpen(true);
}
function handleDelete(){
 ApiClient.put(`Category/DeleteCategory/${deleteId}`)
      .then((res) => {
        console.log("Res : ", res)
        if (res.success === true) {
          setDeleteId(null);
  setDeleteOpen(false);
  GetCategories();
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
      render: (_, category) => (
        <div className="d-flex align-items-center gap-3">
          <i
            className="fa fa-pencil-square-o text-warning"
            style={{ cursor: "pointer" }}
            title="Edit"
            onClick={() => editCategory(category)}
          ></i>
          <i
            className="fa fa-trash-o text-danger"
            style={{ cursor: "pointer" }}
            title="Delete"
            onClick={() => openDeleteModal(category.id)}
          ></i>
        </div>
      ),
    },
    { title: 'Category Name', dataIndex: 'categoryName', key: 'categoryName' },
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
  <h5>All Categories</h5>

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
                dataSource={categories} 
                size="small" 
                scroll={{ x: 'max-content' }} 
                rowKey={(record) => record.id || record.categoryName}
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
          <h6 className="mb-1">Are you sure you want to delete this category?</h6>
          <small className="text-muted">
            This action cannot be undone.
          </small>
        </div>
      </Modal>

      {/* Add / Update Category Modal */}
      <Modal
        title={id == null ? "Add Category" : "Update Category"}
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
            label="Category Name"
            name="name"
            rules={[{ required: true, message: "Category Name is required" }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
        </Form>
      </Modal>


    </div>
    
  );
};

export default ScreenCategories;
