import React from 'react';
import { Card, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Antigravity from '../components/Antigravity';

const { Title, Text } = Typography;

const UploadPage = () => {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <Antigravity hoverScale={1.02} hoverLift={true}>
                <Card className="glass-panel border-0 w-full max-w-xl text-center py-12">
                    <div className="text-[64px] text-[#D17D08] mb-4">
                        <UploadOutlined />
                    </div>
                    <Title level={2} style={{ color: '#F5F5F5' }}>Resume Upload Content</Title>
                    <Text className="text-[#D0C0B0]">
                        (This content will be migrated from the main dashboard in the next step)
                    </Text>
                </Card>
            </Antigravity>
        </div>
    );
};
export default UploadPage;
