import { React, useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Modal } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  RedoOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import bgImage from '../assets/flight_bg.png';
import ApiClient from "../Helpers/ApiClient";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logout } from '../store/slices/authSlice';
import './Login.scss';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [forgotForm] = Form.useForm();

  useEffect(() => {
    // Clear any previous session
    dispatch(logout());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onFinish = (data) => {
    console.log("Req: ", data)
    data = {
      username: data.username,
      password: data.password,
      ipAddress: "",
      loginType: "Web"
    };

    dispatch(loginUser(data))
      .unwrap()
      .then((res) => {
        navigate("/");
      })
      .catch((e) => {
        // Error is handled by state.error, but can also be caught here
      });
  };

  const closeForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotSuccess(false);
    setSentEmail('');
    setSuccessMsg('');
    forgotForm.resetFields();
  };

  const handleForgotPasswordSubmit = async (values) => {
    const emailVal = values.email?.trim() || "";
    setForgotLoading(true);
    try {
      const res = await ApiClient.post("Users/ForgotPassword", { email: emailVal });
      if (res?.success) {
        setSentEmail(emailVal);
        setSuccessMsg(res?.message || "Password sent to your email successfully!");
        setForgotSuccess(true);
        message.success(res?.message || "Password sent to your email!");
      } else {
        message.error(res?.message || "Failed to process request. Please check the email and try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      message.error("An error occurred while submitting the request. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row m-0">
        <div className="col-12 p-0">
          <div className="login-card">
            <div>
              <div className="login-main">
                <Form className="theme-form" onFinish={onFinish}>
                  <h4>Sign in to account</h4>
                  <p>Enter your username & password to login</p>
                  <div className="form-group">
                    <label className="col-form-label form-label-title ">User Name</label>
                    <Form.Item
                      name="username"
                      rules={[{ required: true, message: 'Please enter username' }]}
                    >
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Username"
                      />
                    </Form.Item>
                  </div>
                  <div className="form-group">
                    <label className="col-form-label form-label-title ">Password</label>
                    <div className="form-input position-relative">
                      <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please enter password' }]}
                      >
                        <input
                          className="form-control"
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                        />
                      </Form.Item>

                      <div className="show-hide" onClick={() => setShowPassword(!showPassword)}>
                        <span className={showPassword ? "hide" : "show"}> </span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group mb-0">
                    <div className="checkbox p-0">
                      <input id="checkbox1" type="checkbox" />
                      {/* <label className="text-muted" for="checkbox1">Remember password</label>*/}
                    </div>
                    <a
                      className="link"
                      href="#!"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsForgotModalOpen(true);
                      }}
                    >
                      Forgot password?
                    </a>
                    <div className="text-end mt-3">
                      <button className="btn btn-primary btn-block w-100" type="submit">Sign in</button>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={isForgotModalOpen}
        onCancel={closeForgotModal}
        footer={null}
        destroyOnClose
        centered
        width={450}
        className="fci-forgot-modal"
        title={null}
        styles={{
          content: { padding: 0, overflow: 'hidden' },
          body: { padding: 0 }
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div className={`fci-modal-top-accent ${forgotSuccess ? "success" : ""}`}></div>
        <div className="fci-modal-inner">
          {forgotSuccess ? (
            <div>
              <div className="fci-forgot-header">
                <div className="fci-success-icon-wrap">
                  <div className="fci-success-icon-inner">
                    <CheckCircleOutlined />
                  </div>
                </div>
                <h3 className="fci-forgot-title">
                  Password Sent to Your Email!
                </h3>
                <p className="fci-forgot-subtitle">
                  {successMsg || "Your password details or reset instructions have been sent successfully."}
                </p>
              </div>

              <div className="fci-success-email-box">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10b981",
                    fontSize: "18px",
                    flexShrink: 0
                  }}
                >
                  <MailOutlined />
                </div>
                <div style={{ overflow: "hidden", textAlign: "left" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Sent to email
                  </div>
                  <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 600, wordBreak: "break-all" }}>
                    {sentEmail}
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                className="fci-submit-btn btn-success-done"
                onClick={closeForgotModal}
              >
                <span>Back to Sign In</span>
                <ArrowRightOutlined />
              </Button>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  type="button"
                  className="fci-back-btn"
                  onClick={() => setForgotSuccess(false)}
                >
                  <RedoOutlined /> Didn't receive the email? Try again
                </button>
              </div>

              <div className="fci-trust-note">
                <SafetyCertificateOutlined style={{ color: "#10b981", fontSize: "14px" }} />
                <span>Check your spam or junk folder if not found in inbox</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="fci-forgot-header">
                <div className="fci-badge-outer">
                  <div className="fci-badge-inner">
                    <LockOutlined />
                  </div>
                </div>
                <h3 className="fci-forgot-title">
                  Forgot Password?
                </h3>
                <p className="fci-forgot-subtitle">
                  Enter your registered email address and we'll send you your password details.
                </p>
              </div>

              <Form
                form={forgotForm}
                layout="vertical"
                onFinish={handleForgotPasswordSubmit}
                requiredMark={false}
              >
                <Form.Item
                  name="email"
                  label={
                    <span style={{ fontWeight: "600", fontSize: "13px", color: "#334155" }}>
                      Registered Email Address
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please enter your email address" },
                    { type: "email", message: "Please enter a valid email address" }
                  ]}
                  style={{ marginBottom: "22px" }}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: "#94a3b8", fontSize: "16px", marginRight: "8px" }} />}
                    placeholder="name@company.com"
                    className="fci-forgot-input"
                    autoComplete="email"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={forgotLoading}
                  className="fci-submit-btn"
                >
                  <span>Send Password</span>
                  {!forgotLoading && <ArrowRightOutlined />}
                </Button>

                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <button
                    type="button"
                    className="fci-back-btn"
                    onClick={closeForgotModal}
                  >
                    <ArrowLeftOutlined /> Back to Sign in
                  </button>
                </div>

                <div className="fci-trust-note">
                  <SafetyCertificateOutlined style={{ color: "#10b981", fontSize: "14px" }} />
                  <span>Protected by 256-bit secure encryption</span>
                </div>
              </Form>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Login;
