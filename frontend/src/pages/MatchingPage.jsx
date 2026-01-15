import React from 'react';
import { Card, Typography } from 'antd';
import { NodeIndexOutlined } from '@ant-design/icons';
import Antigravity from '../components/Antigravity';

const { Title, Text } = Typography;

const MatchingPage = () => {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <Antigravity hoverScale={1.02} hoverLift={true}>
                <Card className="glass-panel border-0 w-full max-w-xl text-center py-12">
                    <div className="text-[64px] text-[#D17D08] mb-4">
                        <NodeIndexOutlined />
                    </div>
                    <Title level={2} style={{ color: '#F5F5F5' }}>Job Matching Content</Title>
                    <Text className="text-[#D0C0B0]">
                        (Job description analysis content will be migrated here)
                    </Text>
                </Card>
            </Antigravity>
        </div>
    );
};
export default MatchingPage;
