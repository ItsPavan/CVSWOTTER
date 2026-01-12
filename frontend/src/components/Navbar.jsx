import React from 'react';
import { supabase } from '../lib/supabase';
import { Layout, Button, Typography, Space, theme } from 'antd';
import Antigravity from './Antigravity';

const { Header } = Layout;
const { Text, Title } = Typography;

export default function Navbar({ session }) {
    const { token } = theme.useToken();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <Header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(30, 9, 3, 0.8)', // Theme bg with opacity
                backdropFilter: 'blur(10px)',
                padding: '0 24px',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Antigravity>
                    <img src="/logo.png" alt="VitaeVantage Logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
                </Antigravity>
                <Title level={4} style={{ margin: 0, color: 'white', letterSpacing: '0.5px' }}>
                    Vitae<span style={{ color: token.colorPrimary }}>Vantage</span>
                </Title>
            </div>

            {session && (
                <Space size="large">
                    <Text type="secondary" style={{ fontSize: '14px' }}>{session.user.email}</Text>
                    <Antigravity>
                        <Button
                            ghost
                            onClick={handleLogout}
                            style={{
                                borderColor: token.colorPrimary,
                                color: token.colorPrimary,
                                borderRadius: '20px'
                            }}
                        >
                            Sign Out
                        </Button>
                    </Antigravity>
                </Space>
            )}
        </Header>
    );
}
