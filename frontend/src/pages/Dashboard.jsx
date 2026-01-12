import React, { useState } from 'react';
import DragDropUpload from '../components/DragDropUpload';
import SWOTCard from '../components/SWOTCard';
import DiffEditor from '../components/DiffEditor';
import api from '../lib/api';
import { Sparkles, FileText, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout, Typography, Row, Col, Card, Button, Input, Progress, Space, Divider, Steps, theme } from 'antd';
import Antigravity from '../components/Antigravity';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function Dashboard() {
    const { token } = theme.useToken();
    const [resumeId, setResumeId] = useState(null);
    const [jdText, setJdText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [jdUploadMode, setJdUploadMode] = useState('upload');
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadMode, setUploadMode] = useState('upload');
    const [resumeText, setResumeText] = useState('');

    const handleResumeTextChange = async (text) => {
        setResumeText(text);
        if (text.trim().length > 50) {
            try {
                const blob = new Blob([text], { type: 'application/pdf' });
                const file = new File([blob], "pasted_resume.pdf", { type: "application/pdf" });
            } catch (e) { }
        }
    };

    const handleUploadComplete = (id) => {
        setResumeId(id);
    };

    const handleAnalyze = async () => {
        if (!jdText.trim() || !resumeId) return;
        setAnalyzing(true);
        setAnalysis(null);

        try {
            const response = await api.post('/analyze', {
                resume_id: resumeId,
                jd_text: jdText
            });
            console.log("Analysis Result:", response.data);
            setAnalysis(response.data);
        } catch (err) {
            console.error(err);
            alert("Analysis failed. Please check your inputs.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="pb-20 relative overflow-hidden">
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>

                {/* Header Section */}
                <div className="text-center md:text-left">
                    <Title level={2} style={{ margin: 0 }}>
                        <span style={{ color: token.colorTextBase }}>Strategic</span> <span style={{ color: token.colorPrimary }}>Optimization</span>
                    </Title>
                    <Text type="secondary" className="text-lg">
                        Architect your career with AI precision (v2.0).
                    </Text>
                </div>

                {/* Main Interface */}
                <Row gutter={[24, 24]}>

                    {/* Left Column: Inputs */}
                    <Col xs={24} lg={8}>
                        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>

                            {/* 1. Resume Input */}
                            <Antigravity>
                                <Card
                                    title={<Space><FileText style={{ color: token.colorPrimary }} size={16} /><Text strong style={{ color: token.colorPrimary }}>RESUME</Text></Space>}
                                    bordered={false}
                                    extra={
                                        <Space>
                                            <Button size="small" type={uploadMode === 'upload' ? 'primary' : 'text'} onClick={() => setUploadMode('upload')}>UPLOAD</Button>
                                            <Button size="small" type={uploadMode === 'paste' ? 'primary' : 'text'} onClick={() => setUploadMode('paste')}>PASTE</Button>
                                        </Space>
                                    }
                                    className="glass-panel"
                                >
                                    {uploadMode === 'upload' ? (
                                        <DragDropUpload onUploadComplete={handleUploadComplete} />
                                    ) : (
                                        <TextArea
                                            rows={8}
                                            placeholder="Paste your resume text content here..."
                                            value={resumeText}
                                            onChange={(e) => handleResumeTextChange(e.target.value)}
                                            style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: token.colorTextBase, border: 'none' }}
                                        />
                                    )}
                                </Card>
                            </Antigravity>

                            {/* 2. Job Description Input */}
                            <Antigravity>
                                <Card
                                    title={<Space><LayoutDashboard style={{ color: token.colorPrimary }} size={16} /><Text strong style={{ color: token.colorPrimary }}>JOB DESCRIPTION</Text></Space>}
                                    bordered={false}
                                    extra={
                                        <Space>
                                            <Button size="small" type={jdUploadMode === 'upload' ? 'primary' : 'text'} onClick={() => setJdUploadMode('upload')}>UPLOAD</Button>
                                            <Button size="small" type={jdUploadMode === 'paste' ? 'primary' : 'text'} onClick={() => setJdUploadMode('paste')}>PASTE</Button>
                                        </Space>
                                    }
                                    className="glass-panel"
                                >
                                    {jdUploadMode === 'upload' ? (
                                        <DragDropUpload
                                            onUploadComplete={(data) => { if (data.text) setJdText(data.text); }}
                                            endpoint="/extract-text"
                                            label="JD"
                                        />
                                    ) : (
                                        <TextArea
                                            rows={8}
                                            placeholder="Paste the raw job description text here..."
                                            value={jdText}
                                            onChange={(e) => setJdText(e.target.value)}
                                            style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: token.colorTextBase, border: 'none' }}
                                        />
                                    )}
                                </Card>
                            </Antigravity>

                            {/* Action Button */}
                            <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    onClick={handleAnalyze}
                                    disabled={!resumeId || !jdText.trim() || analyzing}
                                    icon={analyzing ? <BrainCircuit className="animate-pulse" /> : <Sparkles />}
                                    style={{ height: '60px', fontSize: '16px', letterSpacing: '2px', fontWeight: 'bold' }}
                                >
                                    {analyzing ? 'WIRING AGENTS...' : 'ANALYZE STRATEGY'}
                                </Button>
                            </motion.div>

                        </Space>
                    </Col>

                    {/* Right Column: Results */}
                    <Col xs={24} lg={16}>
                        {!analysis && !analyzing && (
                            <div className="flex flex-col items-center justify-center h-full opacity-50 min-h-[400px]">
                                <Antigravity>
                                    <div className="p-8 rounded-full bg-white/5 mb-6">
                                        <Sparkles size={48} className="text-white/30" />
                                    </div>
                                </Antigravity>
                                <Title level={3} type="secondary" style={{ fontWeight: 300 }}>Ready to Architect</Title>
                                <Text type="secondary">Awaiting inputs for strategic analysis.</Text>
                            </div>
                        )}

                        {analyzing && (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                                <Progress type="circle" percent={75} status="active" showInfo={false} strokeColor={token.colorPrimary} size={120} />
                                <Title level={2} style={{ marginTop: 24, color: token.colorTextBase }}>ANALYZING...</Title>
                                <Text className="animate-pulse" style={{ color: token.colorPrimary }}>Connecting career nodes</Text>
                            </div>
                        )}

                        {analysis && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                {/* Hero: Match Score */}
                                <Antigravity>
                                    <Card bordered={false} className="glass-panel" bodyStyle={{ padding: '40px' }}>
                                        <Row align="middle" justify="space-between">
                                            <Col>
                                                <Text strong style={{ letterSpacing: '2px', color: token.colorPrimary }}>ATS MATCH SCORE</Text>
                                                <Title level={1} style={{ fontSize: '5rem', margin: 0, lineHeight: 1, color: token.colorPrimary }}>
                                                    {analysis.match_score || 0}%
                                                </Title>
                                                <Paragraph type="secondary" style={{ maxWidth: 300, marginTop: 16 }}>
                                                    Semantic relevance calculation based on keyword density and context matching.
                                                </Paragraph>
                                            </Col>
                                            <Col>
                                                <Progress
                                                    type="circle"
                                                    percent={analysis.match_score || 0}
                                                    strokeColor={token.colorPrimary}
                                                    trailColor="#2d0a0a"
                                                    strokeWidth={8}
                                                    size={180}
                                                    format={() => <Sparkles size={48} color={token.colorPrimary} />}
                                                />
                                            </Col>
                                        </Row>
                                    </Card>
                                </Antigravity>

                                {/* Results Grid */}
                                <Antigravity>
                                    <Card title="STRATEGIC ANALYSIS" bordered={false} className="glass-panel">
                                        <SWOTCard swot={analysis.swot_analysis || analysis.swot_data} />
                                    </Card>
                                </Antigravity>

                                {/* Recommendations */}
                                <Antigravity>
                                    <Card title="OPTIMIZATION PLAN" bordered={false} className="glass-panel">
                                        <DiffEditor analysis={analysis} />
                                    </Card>
                                </Antigravity>

                            </motion.div>
                        )}
                    </Col>
                </Row>
            </Space>
        </div>
    );
}
