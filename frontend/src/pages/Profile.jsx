import React, { useState } from 'react';
import { Card, Typography, Upload, Button, message, Space, Avatar } from 'antd';
import { CloudUploadOutlined, FileTextOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import Antigravity from '../components/Antigravity';
import api from '../lib/api';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const Profile = () => {
    const [masterResume, setMasterResume] = useState(null);

    const props = {
        name: 'file',
        multiple: false,
        customRequest: async ({ file, onSuccess, onError }) => {
            const formData = new FormData();
            formData.append('file', file);
            try {
                // Upload with is_master=true
                await api.post('/upload?is_master=true', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSuccess("ok");
            } catch (err) {
                console.error("Upload failed", err);
                onError(err);
            }
        },
        onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
                message.success(`${info.file.name} uploaded successfully as Master Resume.`);
                setMasterResume(info.file);
            } else if (status === 'error') {
                message.error(`${info.file.name} upload failed.`);
                // If it was the specific 1MB error, we could try to extract it, but standard error message is fine for now
                if (info.file.response && info.file.response.detail) {
                    message.error(`Error: ${info.file.response.detail}`);
                } else if (info.file.error && info.file.error.response && info.file.error.response.data && info.file.error.response.data.detail) {
                    message.error(`Error: ${info.file.error.response.data.detail}`);
                }
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-4">
                <div className="p-1 rounded-full bg-gradient-to-tr from-[#D17D08] to-[#F8B24F]">
                    <div className="bg-[#1E0903] rounded-full p-1">
                        <Avatar size={64} icon={<UserOutlined />} className="bg-[#381004] text-[#D17D08]" />
                    </div>
                </div>
                <div>
                    <Title level={2} style={{ color: '#F5F5F5', margin: 0 }}>My Profile</Title>
                    <Text className="text-[#D0C0B0]">Manage your account settings and master resume.</Text>
                </div>
            </div>

            <Antigravity hoverLift={false}>
                <Card
                    className="glass-panel border-0"
                    styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 32px' }, body: { padding: '32px' } }}
                    title={
                        <Space>
                            <FileTextOutlined className="text-[#D17D08]" />
                            <span className="text-[#F5F5F5] text-lg">Master Resume</span>
                        </Space>
                    }
                    bordered={false}
                >
                    <div className="flex gap-12">
                        {/* Left: Instructions & Upload */}
                        <div className="flex-1">
                            <Text className="text-[#D0C0B0] block mb-6 leading-relaxed">
                                Upload your "Master Resume" here. This specific resume will be used as the base for all your job applications if you choose the <span className="text-[#D17D08] font-semibold">"Use Master Resume"</span> option on the dashboard.
                            </Text>

                            <Dragger {...props} className="bg-[#2d0a0a] border-[#D17D08]/30 hover:border-[#D17D08] group h-auto py-12 rounded-xl overflow-hidden">
                                <p className="ant-upload-drag-icon transition-transform group-hover:scale-110 duration-300">
                                    <CloudUploadOutlined style={{ color: '#D17D08', fontSize: '36px' }} />
                                </p>
                                <p className="ant-upload-text text-[#F5F5F5] font-medium text-lg mt-2">
                                    Click or drag file to upload
                                </p>
                                <p className="ant-upload-hint text-[#D0C0B0]/60 px-4">
                                    Supports PDF or DOCX formats
                                </p>
                            </Dragger>
                        </div>

                        {/* Right: Active Resume Status */}
                        {masterResume && (
                            <div className="w-1/3 flex flex-col items-center justify-center p-6 bg-[#2A4A35]/10 border border-[#4ADE80]/20 rounded-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[#4ADE80]/5 blur-xl"></div>
                                <div className="z-10 text-center">
                                    <FileTextOutlined style={{ fontSize: '56px', color: '#4ADE80', marginBottom: '16px' }} />
                                    <Text className="text-[#F5F5F5] font-bold block text-lg mb-1">{masterResume.name}</Text>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4ADE80]/20 rounded-full">
                                        <CheckCircleOutlined className="text-[#4ADE80]" />
                                        <span className="text-[#4ADE80] text-xs font-bold uppercase tracking-wider">Active</span>
                                    </div>
                                    <Button type="text" danger className="mt-6 hover:bg-red-500/10">Remove Resume</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </Antigravity>
        </div>
    );
};

export default Profile;
