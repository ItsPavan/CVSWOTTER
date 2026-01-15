import React, { useState } from 'react';
import { Layout, Row, Col, Typography, Card, Upload, Input, Button, Tabs, Table, Tag, Switch, Space, message, Empty, Segmented } from 'antd';
import { CloudUploadOutlined, FileTextOutlined, RocketOutlined, HistoryOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Antigravity from '../components/Antigravity';
import api from '../lib/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

const Dashboard = () => {
    const navigate = useNavigate();
    const [useMaster, setUseMaster] = useState(false);
    const [jdMode, setJdMode] = useState('paste'); // 'paste' | 'upload'
    const [history, setHistory] = useState([]); // Empty history initially

    // Data State
    const [masterResumeId, setMasterResumeId] = useState(null);
    const [uploadedResumeId, setUploadedResumeId] = useState(null);
    const [jdText, setJdText] = useState(''); // Text Area Content
    const [uploadedJdText, setUploadedJdText] = useState(null); // Extracted text from uploaded JD

    const [loadingMasterCheck, setLoadingMasterCheck] = useState(false);
    const [masterError, setMasterError] = useState(null);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/analyses');
            if (response.data) {
                // Map API data to table format
                const mappedHistory = response.data.map(item => ({
                    key: item.id,
                    title: `Analysis ${item.id.slice(0, 6)}...`, // Placeholder, maybe extract from JD later
                    company: 'N/A', // Placeholder
                    date: new Date(item.created_at).toLocaleDateString(),
                    score: item.match_score || 0
                }));
                setHistory(mappedHistory);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    // Fetch history on mount
    React.useEffect(() => {
        fetchHistory();
    }, []);

    const handleMasterToggle = async (checked) => {
        setMasterError(null);
        if (!checked) {
            setUseMaster(false);
            setMasterResumeId(null);
            return;
        }

        setLoadingMasterCheck(true);
        try {
            const response = await api.get('/resumes/master');
            if (response.data.exists) {
                setUseMaster(true);
                setMasterResumeId(response.data.resume.id);
                message.success("Master Resume Selected");
            } else {
                setMasterError("Master resume not available in My profile, please upload to use this feature");
                setUseMaster(false);
            }
        } catch (error) {
            console.error("Error checking master resume:", error);
            if (error.response && error.response.status === 500) {
                setMasterError("Server Error: Please ensure database schema is updated (run update_schema.sql).");
            } else {
                setMasterError("Failed to verify Master Resume status");
            }
            setUseMaster(false);
        } finally {
            setLoadingMasterCheck(false);
        }
    };

    const handleAnalyze = async () => {
        // 1. Determine Resume ID
        const finalResumeId = useMaster ? masterResumeId : uploadedResumeId;
        if (!finalResumeId) {
            message.error("Please select a Master Resume or Upload a Resume first.");
            return;
        }

        // 2. Determine JD Text
        const finalJdText = jdMode === 'paste' ? jdText : uploadedJdText;
        if (!finalJdText || finalJdText.trim() === "") {
            message.error("Please provide a Job Description (Paste Text or Upload File).");
            return;
        }

        const hide = message.loading({ content: 'Analyzing Match... This may take a moment.', key: 'analyzing', duration: 0 });

        try {
            const response = await api.post('/analyze', {
                resume_id: finalResumeId,
                jd_text: finalJdText
            });

            if (response.data && response.data.analysis_id) {
                message.success({ content: 'Analysis Complete!', key: 'analyzing' });
                // Refresh history before navigating (optional, but good for back nav)
                fetchHistory();
                navigate(`/analysis/${response.data.analysis_id}`);
            } else {
                throw new Error("Invalid response from server");
            }

        } catch (error) {
            console.error("Analysis Failed:", error);
            message.error({ content: `Analysis Failed: ${error.message || 'Unknown error'}`, key: 'analyzing' });
        }
    };

    // Props for Resume Upload
    const resumeUploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false, // Cleaner look, or true if we want to show file name
        customRequest: async ({ file, onSuccess, onError }) => {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.data && response.data.resume_id) {
                    setUploadedResumeId(response.data.resume_id);
                    message.success(`${file.name} uploaded successfully.`);
                    onSuccess("ok");
                } else {
                    throw new Error("No resume ID returned");
                }
            } catch (err) {
                message.error(`${file.name} upload failed.`);
                onError(err);
            }
        },
    };

    // Props for JD Upload (Extract Text)
    const jdUploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        customRequest: async ({ file, onSuccess, onError }) => {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await api.post('/extract-text', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.data && response.data.text) {
                    setUploadedJdText(response.data.text);
                    message.success("Job Description extracted from file!");
                    onSuccess("ok");
                } else {
                    throw new Error("No text extracted");
                }
            } catch (err) {
                message.error("Failed to extract text from JD file.");
                onError(err);
            }
        }
    };

    // Columns for History Table
    const columns = [
        {
            title: 'Job Title',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <span className="font-semibold text-[#F5F5F5]">{text}</span>,
        },
        {
            title: 'Company',
            dataIndex: 'company',
            key: 'company',
            render: (text) => <span className="text-[#D0C0B0]">{text}</span>,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => <span className="text-[#D0C0B0] opacity-80">{text}</span>,
        },
        {
            title: 'Match Score',
            dataIndex: 'score',
            key: 'score',
            render: (score) => (
                <div className="w-24">
                    <div className="h-2 bg-[#381004] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#D17D08] glow-gold"
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <span className="text-xs text-[#D17D08] font-bold mt-1 block text-right">{score}%</span>
                </div>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button type="link" className="text-[#D17D08] p-0 hover:text-[#F8B24F]" onClick={() => navigate(`/analysis/${record.key}`)}>
                    View Results
                </Button>
            ),
        },
    ];

    return (
        <Layout className="bg-transparent min-h-full">
            <Content className="p-6 max-w-6xl mx-auto w-full flex flex-col gap-8">

                <div className="text-center mb-10">
                    <Title level={2} style={{ color: '#F5F5F5', margin: 0 }}>Start New Analysis</Title>
                    <Text className="text-[#D0C0B0]">Compare your resume against a job description to get AI-powered insights.</Text>
                </div>

                <Row gutter={24} className="items-stretch">
                    {/* Resume Section */}
                    <Col span={12}>
                        <Antigravity hoverLift={false} className="h-full">
                            <Card className="glass-panel border-0 h-full" styles={{ body: { padding: '32px' } }}>
                                {/* Header Area: Fixed Height */}
                                <div className="mb-2">
                                    <div className="h-10 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-[#F5F5F5] font-semibold">
                                            <FileTextOutlined className="text-[#D17D08]" /> RESUME
                                        </div>
                                        <div className="flex items-center h-full">
                                            <Space>
                                                <Text className="text-xs text-[#D0C0B0]">Use Master Resume</Text>
                                                <Switch size="small" checked={useMaster} loading={loadingMasterCheck} onChange={handleMasterToggle} />
                                            </Space>
                                        </div>
                                    </div>
                                    {/* Error Message Area: Fixed Height */}
                                    <div className="h-6 flex items-center justify-end">
                                        {masterError && (
                                            <Text className="text-red-500 text-xs truncate" title={masterError}>{masterError}</Text>
                                        )}
                                    </div>
                                </div>

                                {/* Content Area: Strict 250px Height */}
                                <div className="h-[250px] w-full">
                                    {useMaster ? (
                                        <div className="h-full w-full bg-[#2A4A35]/20 border border-[#4ADE80]/30 rounded-xl flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
                                            <CheckCircleOutlined style={{ fontSize: '32px', color: '#4ADE80', marginBottom: '12px' }} />
                                            <Text className="text-[#F5F5F5] font-bold">Master Resume Selected</Text>
                                            <Text className="text-[#D0C0B0] text-sm mt-2">Using your default profile resume for this analysis.</Text>
                                        </div>
                                    ) : (
                                        <div className="h-full w-full">
                                            <Dragger {...resumeUploadProps} className="bg-[#2d0a0a] border-[#D17D08]/30 hover:border-[#D17D08] group h-full block" style={{ height: '100%' }}>
                                                {uploadedResumeId ? (
                                                    <div className="h-full flex flex-col items-center justify-center pt-8">
                                                        <CheckCircleOutlined style={{ fontSize: '32px', color: '#4ADE80', marginBottom: '16px' }} />
                                                        <p className="ant-upload-text text-[#F5F5F5] mb-1">Resume Uploaded!</p>
                                                        <p className="ant-upload-hint text-[#D0C0B0] px-4">Ready to analyze</p>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center pt-8">
                                                        <p className="ant-upload-drag-icon transition-transform group-hover:scale-110 mb-4">
                                                            <CloudUploadOutlined style={{ color: '#D17D08', fontSize: '32px' }} />
                                                        </p>
                                                        <p className="ant-upload-text text-[#F5F5F5] mb-1">Upload Resume</p>
                                                        <p className="ant-upload-hint text-[#D0C0B0] px-4">Drag & drop or click to upload (PDF/DOCX)</p>
                                                    </div>
                                                )}
                                            </Dragger>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Antigravity>
                    </Col>

                    {/* JD Section */}
                    <Col span={12}>
                        <Antigravity hoverLift={false} className="h-full">
                            <Card className="glass-panel border-0 h-full" styles={{ body: { padding: '32px' } }}>
                                {/* Header Area: Fixed Height */}
                                <div className="mb-2">
                                    <div className="h-10 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-[#F5F5F5] font-semibold">
                                            <FileTextOutlined className="text-[#D17D08]" /> JOB DESCRIPTION
                                        </div>
                                        <div className="flex items-center h-full">
                                            <Segmented
                                                options={[
                                                    { label: 'Paste Text', value: 'paste' },
                                                    { label: 'Upload File', value: 'upload' }
                                                ]}
                                                value={jdMode}
                                                onChange={setJdMode}
                                                className="bg-[#381004] text-[#D0C0B0]"
                                                size="middle"
                                            />
                                        </div>
                                    </div>
                                    {/* Spacer Area: Fixed Height to match Resume section */}
                                    <div className="h-6"></div>
                                </div>

                                {/* Content Area: Strict 250px Height */}
                                <div className="h-[250px] w-full">
                                    {jdMode === 'paste' ? (
                                        <TextArea
                                            placeholder="Paste the job description here..."
                                            className="bg-[#2d0a0a] border-[#D17D08]/30 text-[#F5F5F5] hover:border-[#D17D08] focus:border-[#D17D08] resize-none custom-scrollbar w-full"
                                            style={{ borderRadius: '8px', height: '100%' }}
                                            value={jdText}
                                            onChange={(e) => setJdText(e.target.value)}
                                        />
                                    ) : (
                                        <div className="h-full w-full">
                                            <Dragger {...jdUploadProps} className="bg-[#2d0a0a] border-[#D17D08]/30 hover:border-[#D17D08] group h-full block" style={{ height: '100%' }}>
                                                {uploadedJdText ? (
                                                    <div className="h-full flex flex-col items-center justify-center pt-8">
                                                        <CheckCircleOutlined style={{ fontSize: '32px', color: '#4ADE80', marginBottom: '16px' }} />
                                                        <p className="ant-upload-text text-[#F5F5F5] mb-1">JD Validated!</p>
                                                        <p className="ant-upload-hint text-[#D0C0B0] px-4">Text extracted successfully</p>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center pt-8">
                                                        <p className="ant-upload-drag-icon transition-transform group-hover:scale-110 mb-4">
                                                            <CloudUploadOutlined style={{ color: '#D17D08', fontSize: '32px' }} />
                                                        </p>
                                                        <p className="ant-upload-text text-[#F5F5F5] mb-1">Upload JD</p>
                                                        <p className="ant-upload-hint text-[#D0C0B0] px-4">Drag & drop or click to upload</p>
                                                    </div>
                                                )}
                                            </Dragger>
                                        </div>
                                    )}
                                </div>

                            </Card>
                        </Antigravity>
                    </Col>
                </Row>

                <div className="mt-8 flex justify-center">
                    <Button
                        type="primary"
                        size="large"
                        icon={<RocketOutlined />}
                        className="h-14 px-12 text-lg font-bold shadow-[0_0_20px_rgba(209,125,8,0.4)] hover:shadow-[0_0_30px_rgba(209,125,8,0.6)] transform hover:-translate-y-0.5 transition-all"
                        onClick={handleAnalyze}
                    >
                        ANALYZE MATCH
                    </Button>
                </div>

                {/* 2. HISTORY TABLE */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <HistoryOutlined className="text-[#D17D08] text-xl" />
                        <Title level={4} style={{ color: '#F5F5F5', margin: 0 }}>Recent History</Title>
                    </div>
                    <Card className="glass-panel border-0" styles={{ body: { padding: '0' } }}>
                        <Table
                            columns={columns}
                            dataSource={history}
                            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-[#D0C0B0]">No recent analysis found</span>} /> }}
                            pagination={false}
                            rowClassName="hover:bg-white/5 transition-colors cursor-pointer"
                            onRow={(record) => ({
                                onClick: () => navigate(`/analysis/${record.key}`),
                            })}
                        />
                    </Card>
                </div>

            </Content>
        </Layout>
    );
};

export default Dashboard;
