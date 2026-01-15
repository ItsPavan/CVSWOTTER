import React from 'react';
import { Card, Typography, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Antigravity from '../components/Antigravity';

const { Title, Text } = Typography;

const InterviewPrep = () => {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <Antigravity hoverScale={1.02} hoverLift={true}>
                <Card
                    className="glass-panel border-0 w-full max-w-2xl text-center py-12"
                    styles={{ body: { padding: '3rem' } }}
                >
                    <Space direction="vertical" size="large">
                        <div className="text-[64px] text-[#D17D08] mb-4">
                            <CalendarOutlined />
                        </div>

                        <Title level={1} style={{ color: '#F5F5F5', margin: 0 }}>
                            Create Portfolio
                        </Title>

                        <Text className="text-[#D0C0B0] text-lg block max-w-md mx-auto">
                            Our AI-powered portfolio creation system is currently under development.
                            Check back soon for personalized portfolio tools!
                        </Text>

                        <div className="mt-8 p-4 bg-[#381004] rounded-xl inline-flex items-center gap-2 text-[#D17D08]">
                            <ClockCircleOutlined />
                            <span className="font-semibold">Feature Coming Soon</span>
                        </div>
                    </Space>
                </Card>
            </Antigravity>
        </div>
    );
};

export default InterviewPrep;
