import React, { useState } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import ApiClient from '../Helpers/ApiClient';
import { notifySuccess, notifyError } from '../../public/js/notify/notify';

const ChangePassword = ({ isOpen, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            notifyError("danger", "New password and confirm password do not match");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            };

            console.log('Submitting password change:', payload);

            const response = await ApiClient.post('Users/ChangePassword', payload);

            if (response && response.success) {
                notifySuccess("success", response.message || "Password changed successfully!");
                form.resetFields();
                onClose();
            } else {
                notifyError("danger", response.message || "Failed to change password");
            }
        } catch (error) {
            console.error('Error changing password:', error);
            notifyError("danger", "An error occurred while changing password");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            footer={null}
            closable={false}
            centered
            destroyOnHidden
            width={500}
        >
            <div className="card mb-0">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                        <LockOutlined />
                        Change Password
                    </h5>
                    <button type="button" className="btn-close" onClick={handleCancel}></button>
                </div>
                <div className="card-body">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                        className="theme-form"
                    >
                        <Form.Item
                            name="oldPassword"
                            label="Current Password"
                            rules={[
                                { required: true, message: "Current password is required" },
                                { min: 6, message: "Password must be at least 6 characters" }
                            ]}
                        >
                            <Input.Password
                                placeholder="Enter your current password"
                                size="large"
                                prefix={<LockOutlined />}
                            />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                                { required: true, message: "New password is required" },
                                { min: 6, message: "Password must be at least 6 characters" },
                                { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Password must contain uppercase, lowercase, and numbers" }
                            ]}
                        >
                            <Input.Password
                                placeholder="Enter your new password"
                                size="large"
                                prefix={<LockOutlined />}
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Confirm Password"
                            rules={[
                                { required: true, message: "Please confirm your password" }
                            ]}
                            dependencies={['newPassword']}
                        >
                            <Input.Password
                                placeholder="Confirm your new password"
                                size="large"
                                prefix={<LockOutlined />}
                            />
                        </Form.Item>

                        <div className="card-footer text-end py-2 px-0 mb-0 mt-3 border-top-0 pb-0">
                            <Space>
                                <button type="button" className="btn btn-outline-secondary px-4" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-theme px-4"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </Space>
                        </div>
                    </Form>
                </div>
            </div>
        </Modal>
    );
};

export default ChangePassword;
