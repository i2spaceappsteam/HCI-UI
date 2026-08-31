import {React ,useEffect, useState}from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import bgImage from '../assets/flight_bg.png';
import ApiClient from "../Helpers/ApiClient";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logout } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
   
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
                                        </div><a className="link" href="forget-password.html">Forgot password?</a> 
                                        <div className="text-end mt-3">
                                            <button className="btn btn-primary btn-block w-100"  type="submit">Sign in</button>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
