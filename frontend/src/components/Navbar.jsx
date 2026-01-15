import React from 'react';
import { Layout, Input, Tabs, Avatar, Dropdown, Space, theme } from 'antd';
import { SearchOutlined, UserOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const { Header } = Layout;

const Navbar = ({ session }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = theme.useToken();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const items = [
        {
            key: 'profile',
            label: 'My Profile',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile'),
        },
        {
            key: 'logout',
            label: 'Sign Out',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/profile') return 'profile'; // Non-existent tab key to deselect others
        if (path === '/' || path === '/dashboard' || path.startsWith('/analysis')) return 'dashboard';
        if (path === '/create-portfolio') return 'create-portfolio';
        return 'dashboard';
    };

    const onTabChange = (key) => {
        navigate(`/${key}`);
    };

    const navItems = [
        { label: 'Home', key: 'dashboard' },
        { label: 'Create Portfolio', key: 'create-portfolio' },
    ];

    return (
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: token.colorBgBase,
                borderBottom: `1px solid ${token.colorBgContainer}`,
                padding: '0 24px',
                height: '72px',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
            }}
        >
            {/* Left: Search (Visible only if logged in) */}
            <div className="flex-1 max-w-xs">
                {/* Search bar removed */}
            </div>

            {/* Center: Tabs (Visible only if logged in) */}
            <div className="flex-1 flex justify-center">
                {session && (
                    <Tabs
                        activeKey={getActiveTab()}
                        onChange={onTabChange}
                        onTabClick={onTabChange} // Ensure clicking correct tab also navigates
                        items={navItems}
                        centered
                        tabBarStyle={{ borderBottom: 'none', marginBottom: 0 }}
                        indicator={{ size: (origin) => origin - 20 }}
                    />
                )}
            </div>

            {/* Right: User Profile via Dropdown */}
            <div className="flex-1 flex justify-end">
                {session ? (
                    <Dropdown menu={{ items }} placement="bottomRight">
                        <Space className="cursor-pointer glass-panel px-3 py-1.5 rounded-full flex items-center border border-[#381004] hover:border-[#D17D08] transition-colors">
                            <Avatar
                                style={{ backgroundColor: token.colorPrimary }}
                                icon={<UserOutlined />}
                                size="small"
                            />
                            <DownOutlined style={{ fontSize: '10px', color: token.colorTextSecondary }} />
                        </Space>
                    </Dropdown>
                ) : (
                    <div className="w-8"></div> // Spacer
                )}
            </div>
        </Header>
    );
};

export default Navbar;
