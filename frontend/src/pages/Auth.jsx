import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, Form, Input, Button, Typography, message, theme } from 'antd';
import Antigravity from '../components/Antigravity';

const { Title, Text } = Typography;

export default function Auth() {
    const { token } = theme.useToken();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [form] = Form.useForm();

    const handleAuth = async (values) => {
        setLoading(true);
        const { email, password } = values;
        let error;
        if (isLogin) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            error = signInError;
        } else {
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            error = signUpError;
        }

        if (error) {
            message.error(error.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <Antigravity className="w-full max-w-md">
                <Card
                    bordered={false}
                    className="glass-panel"
                >
                    <div className="text-center mb-8">
                        <Title level={2} style={{ marginBottom: 8, color: token.colorTextHeading }}>
                            {isLogin ? 'Welcome Back' : 'Join VitaeVantage'}
                        </Title>
                        <Text type="secondary">
                            {isLogin ? 'Enter your credentials to analyze your resume' : 'Get started with VitaeVantage'}
                        </Text>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleAuth}
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            label={<Text strong style={{ color: token.colorTextBase }}>Email</Text>}
                            rules={[{ required: true, message: 'Please input your email!' }]}
                        >
                            <Input
                                placeholder="name@example.com"
                                style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<Text strong style={{ color: token.colorTextBase }}>Password</Text>}
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password
                                placeholder="••••••••"
                                style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                style={{ height: 48, fontWeight: 'bold', fontSize: 16 }}
                            >
                                {isLogin ? 'Sign In' : 'Sign Up'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center">
                        <Button
                            type="link"
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ color: token.colorPrimary }}
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </Button>
                    </div>
                </Card>
            </Antigravity>
        </div>
    );
}
