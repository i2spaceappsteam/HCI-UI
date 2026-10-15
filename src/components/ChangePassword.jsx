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
            title={
                <span className="d-flex align-items-center gap-2">
                    <LockOutlined /> Change Password
                </span>
            }
            open={isOpen}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            okText="Update Password"
            confirmLoading={loading}
            cancelText="Cancel"
            centered
            width={420}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
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
                        prefix={<LockOutlined />}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ChangePassword;
