import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Card, Progress, Space, Button, message, Spin } from 'antd';
import { CheckCircleOutlined, WarningOutlined, RiseOutlined, FireOutlined, ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Antigravity from '../components/Antigravity';
import ReviewOptimize from '../components/ReviewOptimize';
import api from '../lib/api';

const { Content } = Layout;
const { Title, Text } = Typography;

const AnalysisResult = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!id) return;
            try {
                const response = await api.get(`/analyses/${id}`);
                setAnalysis(response.data);
            } catch (error) {
                console.error("Failed to fetch analysis:", error);
                message.error("Could not load analysis results.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [id, navigate]);


    const matchScore = analysis?.match_score || 0;
    const swotData = analysis?.swot_data || {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
    };
    const diffs = analysis?.recommendations || []; // Assuming recommendations map to diffs eventually

    const SWOTCard = ({ title, items, type, icon }) => {
        const isPositive = type === 'positive';
        const glowClass = isPositive ? 'glow-green' : 'glow-red';
        const IconComp = icon;
        const color = isPositive ? '#4ADE80' : '#F87171'; // Green-400 : Red-400

        return (
            <Antigravity hoverScale={1.02} hoverLift className="h-full">
                <Card
                    className={`glass-panel h-full ${glowClass} border-0`}
                    styles={{ body: { padding: '16px', height: '100%' } }}
                >
                    <Space className="mb-3">
                        <IconComp style={{ color: color, fontSize: '18px' }} />
                        <Text strong style={{ color: '#F5F5F5', fontSize: '16px' }}>{title.toUpperCase()}</Text>
                    </Space>
                    <ul className="list-none p-0 m-0 space-y-2">
                        {items && items.length > 0 ? (
                            items.map((item, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                    <IconComp style={{ color: color, fontSize: '12px', marginTop: '4px' }} />
                                    <Text className="text-[#D0C0B0] text-sm leading-snug">{item}</Text>
                                </li>
                            ))
                        ) : (
                            <li className="text-[#D0C0B0] opacity-50 italic">No items found</li>
                        )}
                    </ul>
                </Card>
            </Antigravity>
        );
    };

    const handleApply = async (acceptedSuggestions) => {
        try {
            message.loading({ content: 'Generating PDF...', key: 'pdfGen' });
            const response = await api.post('/generate-pdf', {
                analysis_id: id,
                accepted_suggestions: acceptedSuggestions
            }, {
                responseType: 'blob'
            });

            // Trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Optimized_Resume_${id.slice(0, 8)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            message.success({ content: 'Resume downloaded!', key: 'pdfGen' });
        } catch (error) {
            console.error("PDF Gen Error:", error);
            message.error({ content: 'Failed to generate PDF', key: 'pdfGen' });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#1E0903]">
                <div className="text-center">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#D17D08' }} spin />} />
                    <p className="mt-4 text-[#D0C0B0] text-lg">Retrieving Analysis...</p>
                </div>
            </div>
        );
    }

    if (!analysis) return null;

    return (
        <Layout className="bg-transparent h-[calc(100vh-72px)] overflow-hidden">
            <Content className="p-6 h-full flex flex-col">
                <div className="mb-4">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        className="text-[#D0C0B0] hover:text-[#D17D08]"
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </Button>
                </div>
                <Row gutter={24} className="h-full flex-1">
                    {/* LEFT COLUMN (60%) */}
                    <Col span={14} className="h-full flex flex-col gap-6">

                        {/* 1. Hero / Match Score Section */}
                        <div className="flex-1 glass-panel relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#D17D08]/10 to-transparent pointer-events-none" />

                            <div className="relative z-10 text-center">
                                {/* Glowing Ring Container */}
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-[#D17D08] blur-[40px] opacity-20 rounded-full" />
                                    <Progress
                                        type="circle"
                                        percent={matchScore}
                                        size={280}
                                        strokeColor="#D17D08"
                                        trailColor="rgba(255,255,255,0.05)"
                                        strokeWidth={8}
                                        format={() => (
                                            <div className="flex flex-col items-center mt-[-10px]">
                                                <span className="text-[64px] font-bold text-[#F5F5F5] leading-none mb-2 text-shadow-lg">
                                                    {matchScore}%
                                                </span>
                                                <span className="text-[#D17D08] text-xl font-medium tracking-wide Uppercase">
                                                    Match Score
                                                </span>
                                                <span className="text-[#D0C0B0] text-xs mt-2 opacity-60">
                                                    Analysis ID: {id.slice(0, 8)}
                                                </span>
                                            </div>
                                        )}
                                    />
                                </div>
                                {/* Decorative Wave (CSS Art or SVG) */}
                                <div className="absolute bottom-10 left-0 right-0 h-12 opacity-30">
                                    {/* Placeholder for wave */}
                                    <svg viewBox="0 0 100 20" className="w-full h-full fill-none stroke-[#D17D08]" preserveAspectRatio="none">
                                        <path d="M0 10 Q 25 20 50 10 T 100 10" strokeWidth="0.5" />
                                        <path d="M0 15 Q 25 5 50 15 T 100 15" strokeWidth="0.5" opacity="0.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 2. SWOT Analysis Grid */}
                        <div className="h-[45%]">
                            <div className="text-center mb-2">
                                <Text className="text-[#F5F5F5] uppercase tracking-widest text-sm font-semibold">SWOT Analysis</Text>
                            </div>
                            <div className="grid grid-cols-2 gap-4 h-[calc(100%-24px)] overflow-y-auto custom-scrollbar pr-2">
                                <SWOTCard title="Strengths" items={swotData.strengths} type="positive" icon={CheckCircleOutlined} />
                                <SWOTCard title="Weaknesses" items={swotData.weaknesses} type="negative" icon={WarningOutlined} />
                                <SWOTCard title="Opportunities" items={swotData.opportunities} type="positive" icon={RiseOutlined} />
                                <SWOTCard title="Threats" items={swotData.threats} type="negative" icon={FireOutlined} />
                            </div>
                        </div>

                    </Col>

                    {/* RIGHT COLUMN (40%) */}
                    <Col span={10} className="h-full">
                        <ReviewOptimize diffs={diffs} onApply={handleApply} />
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default AnalysisResult;
