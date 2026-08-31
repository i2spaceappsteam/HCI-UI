import React, { useState, useRef, useCallback } from 'react';
import { Layout, Typography, Button, theme, Menu, Dropdown } from 'antd';
import { LogoutOutlined, DashboardOutlined, UserOutlined, SettingOutlined, MailOutlined, ProfileOutlined, SearchOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, Link, useLocation} from "react-router";

import Footer from './Footer';
import ChangePassword from './ChangePassword';
import { useEffect } from "react";
import ApiClient from '../Helpers/ApiClient';
import feather from 'feather-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

import HCILogo from "../assets/images/FCI_logo.png";

import "../assets/css/font-awesome.css";
import "../assets/css/vendors/themify.css";
import "../assets/css/ratio.css";
import "../assets/css/vendors/feather-icon.css";
import "../assets/css/vendors/scrollbar.css";
import "../assets/css/vendors/animate.css";
import "../assets/css/vendors/date-picker.css";
import "../assets/css/vendors/bootstrap.css";
import "../assets/css/vector-map.css";
import "../assets/css/slick.css";
import "../assets/css/slick-theme.css";
import "../assets/css/style.css";
import "../assets/css/responsive.css";
import "../assets/css/custom-sidebar.css";
import "../assets/css/sidebar-redesign.css";
import "../assets/css/sidebar-modern-redesign.css";
import "../assets/css/page-body-overflow-fix.css";
import "../assets/css/overflow-fix.css";


const MainLayout = ({ children }) => {
    const dispatch = useDispatch();
    const { accessToken, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mappedScreens, setmappedScreens] = useState([]);
    const [balance, setBalance] = useState(null);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);

    const fetchBalance = useCallback(() => {
        setBalance("Loading...");
        ApiClient.get("Users/GetBalance")
            .then(res => {
                if (res?.success) {
                    setBalance(res.data);
                } else {
                    setBalance("Error");
                }
            })
            .catch(err => {
                console.error("Error fetching balance:", err);
                setBalance("Error");
            });
    }, []);

    useEffect(() => {
        if (accessToken) {
            fetchBalance();
        }
    }, [accessToken, fetchBalance]);

    useEffect(() => {
        feather.replace();
    }, [mappedScreens, collapsed]);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };
    function GetMappedScreens() {
        ApiClient.get("RoleScreenMappings/GetByRoleId")
            .then((res) => {
                console.log("Res : ", res)
                if (res.success === true) {
                    setmappedScreens(res.data);
                } else if (res.status == 409) {
                    message.error(res.message);
                } else {
                    message.error(res.message);
                }
            })
            .catch((e) => { });
    }
    useEffect(() => {
        GetMappedScreens();
    }, [accessToken]);

    // Breadcrumb Logic
    const pathSnippets = location.pathname.split('/').filter((i) => i);
    const breadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        const title = pathSnippets[index];
        return (
            <li key={url} className="breadcrumb-item">
                <Link to={url}>{title.charAt(0).toUpperCase() + title.slice(1)}</Link>
            </li>
        );
    });

    return (
        <div className={`page-wrapper compact-wrapper modern-type ${collapsed ? 'sidebar-close' : ''}`} id="pageWrapper">
            <ChangePassword isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
            <div className="page-header">
                <div className="header-wrapper row m-0">

                    <div className="header-logo-wrapper col-auto p-0">
                        <div className="logo-wrapper"><Link to="/"><img className="img-fluid main-logo"
                            src={HCILogo} alt="logo" style={{maxWidth:'120px' ,maxHeight: '70px'  }} />
                            <img className="img-fluid white-logo" src={HCILogo} alt="logo" style={{ maxWidth:'120px' ,maxHeight: '70px'  }} /></Link>
                        </div>
                        <div className="toggle-sidebar" onClick={toggleSidebar}>
                            <i className="status_toggle middle sidebar-toggle" data-feather="align-center"></i>
                        </div>
                    </div>

                    <form className="form-inline search-full col " action="#" method="get">
                        <div className="form-group w-100">
                            <div className="Typeahead Typeahead--twitterUsers">
                                <div className="u-posRelative">
                                    <input className="demo-input Typeahead-input form-control-plaintext w-100" type="text" style={{marginTop:10}}
                                        placeholder="Search .." name="q" title="" autoFocus />
                                    <i className="close-search" data-feather="x"></i>
                                    <div className="spinner-border Typeahead-spinner" role="status"><span
                                        className="sr-only">Loading...</span>
                                    </div>
                                </div>
                                <div className="Typeahead-menu"></div>
                            </div>
                        </div>
                    </form>
                    <div className="nav-right col-4 pull-right right-header p-0">
                        <ul className="nav-menus">

                            <li> <span className="header-search"><i data-feather="search"></i></span></li>
                            {/* <li className="onhover-dropdown">
                                <div className="notification-box"><i className="fa fa-bell-o"> </i><span
                                    className="badge rounded-pill badge-theme">4 </span></div>
                              
                            </li> */}

                            <li>
                                <div className="mode">
                                    <Link to="/Admin/FlightSearch">
                                        <i className="fa fa-plane" aria-hidden="true"></i>
                                    </Link>
                                </div>
                            </li>

                            {/* <li className="maximize"><a className="text-dark" href="#!" onClick={() => window.toggleFullScreen?.()}><i
                                data-feather="maximize"></i></a></li> */}

                            <li className="balance-nav">
                                <div className="d-flex align-items-center" style={{ backgroundColor: "#f3f3f3", padding: "5px 10px", borderRadius: "20px" }}>
                                    <span className="me-2 fw-bold" style={{ fontSize: "14px", color: "#333" }}>
                                        Balance: {balance}
                                    </span>
                                    <i 
                                        className="fa fa-refresh" 
                                        style={{ cursor: "pointer", color: "#1890ff", fontSize: "14px" }} 
                                        onClick={fetchBalance} 
                                        title="Reload Balance"
                                    ></i>
                                </div>
                            </li>

                            <li className="profile-nav pe-0 me-0">
                                <Dropdown 
                                    menu={{ items: [
                                        { key: '1', icon: <UserOutlined />, label: 'Account', onClick: () => navigate('/myprofile') },
                                        { key: '2', icon: <LockOutlined />, label: 'Change Password', onClick: () => setChangePasswordOpen(true) },
                                        { key: '3', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate('/') },
                                        { key: '4', icon: <SearchOutlined />, label: 'Hotel Booking', onClick: () => navigate('/Admin/FlightSearch') },
                                        { key: '5', icon: <LogoutOutlined />, label: 'Log out', onClick: handleLogout },
                                    ] }} 
                                    trigger={['click']}
                                    placement="bottomRight"
                                >
                                    <div className="media profile-media" style={{ cursor: 'pointer' }}>
                                        <div className="user-name-hide media-body"><span>HCI</span>
                                            <p className="mb-0 font-roboto">{user?.userName}<i className="middle fa fa-angle-down" style={{ marginLeft: 8 }}></i></p>
                                        </div>
                                    </div>
                                </Dropdown>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
            <div className="page-body-wrapper" >
                <div className={`sidebar-wrapper ${collapsed ? 'close_icon' : ''}`}>
                    <div>
                        <div className="logo-wrapper">
                             <Link to="/">
                                <img className="img-fluid for-light" src={HCILogo} alt="" style={{maxWidth:'120px' ,maxHeight: '70px' }} />
                                <img className="img-fluid for-dark" src={HCILogo} alt="" style={{ maxWidth:'120px' ,maxHeight: '70px'  }} />
                            </Link>
                            <div className="back-btn"><i className="fa fa-angle-left"></i></div>
                            <div className="toggle-sidebar" onClick={toggleSidebar}><i className="status_toggle middle sidebar-toggle" data-feather="grid">
                            </i></div>
                        </div>
                        <div className="logo-icon-wrapper"><a href="index.html"><img className="img-fluid"
                            src="../assets/images/logo/logo-icon.png" alt="" /></a></div>
                        <nav className="sidebar-main" style={{ paddingBottom: '20px' }}>
                            <div className="left-arrow" id="left-arrow"><i data-feather="arrow-left"></i></div>
                            <div id="sidebar-menu">
                                <Menu
                                    mode="inline"
                                    inlineCollapsed={collapsed}
                                    selectedKeys={[location.pathname]}
                                    defaultOpenKeys={
                                        mappedScreens
                                            .map((item, index) => item.mappedScreens?.some(s => s.path === location.pathname) ? `cat-${index}` : null)
                                            .filter(Boolean)
                                    }
                                    style={{ borderRight: 0, background: 'transparent' }}
                                    items={[
                                        {
                                            key: '/',
                                            icon: <DashboardOutlined />,
                                            label: <Link to="/">Dashboard</Link>,
                                        },
                                        ...mappedScreens.map((item, index) => ({
                                            key: `cat-${index}`,
                                            icon: <UserOutlined />,
                                            label: item.category,
                                            children: item.mappedScreens.map((screen) => ({
                                                key: screen.path,
                                                label: (
                                                    <Link 
                                                        to={screen.path}
                                                        onClick={() => {
                                                            if (window.innerWidth <= 991) {
                                                                setCollapsed(true);
                                                            }
                                                        }}
                                                    >
                                                        {screen.name}
                                                    </Link>
                                                ),
                                            })),
                                        }))
                                    ]}
                                />
                            </div>
                            <div className="right-arrow" id="right-arrow"><i data-feather="arrow-right"></i></div>
                        </nav>

                    </div>
                </div>
                <div className="page-body">
                   
                    <div className="container-fluid">
                        <Outlet />
                    </div>

                  
                        <footer className="footer">

                            <div className="row">
                                <div className="col-md-12 footer-copyright text-center">
                                    <p className="mb-0">© 2026 HCI. All rights reserved. | HCI powered by i2space </p>
                                </div>
                            </div>

                        </footer>
            
                </div>
            </div>
        </div>
    );
};
export default MainLayout;
