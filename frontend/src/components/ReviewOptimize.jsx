import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Button, Tag, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import Antigravity from './Antigravity';

const { Title, Text } = Typography;

const ReviewOptimize = ({ diffs = [], onApply }) => {
    const [diffView, setDiffView] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    // Initialize state when props change
    useEffect(() => {
        if (diffs.length > 0) {
            setSuggestions(diffs.map((d, i) => ({ ...d, id: i, status: 'pending' })));
        } else {
            // Keep mock data if empty for visualization
            setSuggestions([
                {
                    id: 1,
                    original: "Managed a team of 5 developers to build a new CRM system. Successfully delivered the project on time.",
                    improved: "Led a cross-functional team of 5 developers to architect and deploy a scalable CRM system, achieving 100% on-time delivery and increasing operational efficiency by 20%.",
                    type: 'Experience',
                    status: 'pending'
                },
                {
                    id: 2,
                    original: "Responsible for data analysis and reporting.",
                    improved: "Conducted in-depth data analysis using Python and SQL, generating actionable insights that influenced key strategic decisions.",
                    type: 'Skills',
                    status: 'pending'
                },
                {
                    id: 3,
                    original: "Wrote code for the backend.",
                    improved: "Engineered robust backend microservices using Python FastAPI, reducing API latency by 40%.",
                    type: 'Skills',
                    status: 'pending'
                }
            ]);
        }
    }, [diffs]);

    const activeSuggestions = suggestions.filter(s => s.status === 'pending');

    const handleAccept = (id) => {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'accepted' } : s));
        message.success("Suggestion Accepted");
    };

    const handleReject = (id) => {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
        message.info("Suggestion Rejected");
    };

    const handleApplyAll = () => {
        const newSuggestions = suggestions.map(s => s.status === 'pending' ? { ...s, status: 'accepted' } : s);
        setSuggestions(newSuggestions);
        message.loading("Generating optimized resume...", 1);

        const acceptedForGenerate = newSuggestions.filter(s => s.status === 'accepted');
        if (onApply) onApply(acceptedForGenerate);
    };

    return (
        <Card
            className="glass-panel h-full border-none"
            styles={{ body: { padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' } }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Title level={3} style={{ margin: 0, color: '#F5F5F5' }}>Review & Optimize</Title>
                <div className="flex items-center gap-2">
                    <Text className="text-[#D0C0B0]">Diff View</Text>
                    <Switch checked={diffView} onChange={setDiffView} />
                </div>
            </div>

            <div className="flex justify-between text-[#D0C0B0] text-sm mb-2 px-2">
                <span>ORIGINAL</span>
                <span>AI SUGGESTED OPTIMIZATIONS</span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {activeSuggestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#D0C0B0] opacity-50">
                        <CheckOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                        <Text>No pending suggestions</Text>
                    </div>
                ) : (
                    activeSuggestions.map((item) => (
                        <div key={item.id} className="grid grid-cols-2 gap-4">
                            {/* Original - Dimmed */}
                            <div className="p-4 bg-[#381004]/50 rounded-xl border border-white/5 text-[#D0C0B0]">
                                <Text className="text-[#D0C0B0] text-sm leading-relaxed">{item.original}</Text>
                            </div>

                            {/* Improved - Glowing Gold */}
                            <Antigravity hoverLift>
                                <div className={`p-4 bg-[#1E0903] rounded-xl border ${diffView ? 'border-[#4ADE80] bg-[#4ADE80]/5' : 'border-[#D17D08]'} relative group overflow-hidden h-full flex flex-col`}>
                                    {/* Glow Effect */}
                                    <div className={`absolute inset-0 pointer-events-none ${diffView ? 'bg-[#4ADE80]/5' : 'bg-[#D17D08]/5'}`} />

                                    <div className="mb-4">
                                        {diffView ? (
                                            <div className="text-sm leading-relaxed text-[#F5F5F5]">
                                                {/* Simple logic: Highlight the whole block as 'New' for now, or use mapped words if possible. */}
                                                {/* To truly be dynamic, we'd need a diff lib. For now, visual distinction. */}
                                                <span className="bg-[#2A4A35] text-[#4ADE80] px-1 rounded mx-1 font-mono text-xs">NEW</span>
                                                {item.suggested || item.improved}
                                            </div>
                                        ) : (
                                            <Text className="text-[#F5F5F5] text-sm leading-relaxed block">
                                                {item.suggested || item.improved}
                                            </Text>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<CheckOutlined />}
                                            className="bg-[#2A4A35] border-[#4ADE80] text-[#4ADE80] hover:!bg-[#4ADE80] hover:!text-[#1E0903] flex-1"
                                            onClick={() => handleAccept(item.id)}
                                        >
                                            ACCEPT
                                        </Button>
                                        <Button
                                            size="small"
                                            icon={<CloseOutlined />}
                                            className="bg-[#481A1A] border-[#F87171] text-[#F87171] hover:!bg-[#F87171] hover:!text-[#1E0903] flex-1"
                                            onClick={() => handleReject(item.id)}
                                        >
                                            REJECT
                                        </Button>
                                    </div>
                                </div>
                            </Antigravity>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="pt-6 mt-4 border-t border-white/10 text-center">
                <Text className="block text-[#D0C0B0] mb-3">{activeSuggestions.length} Suggestions Remaining</Text>
                <Button
                    type="primary"
                    size="large"
                    block
                    className="h-12 text-lg font-bold"
                    onClick={handleApplyAll}
                    disabled={activeSuggestions.length === 0}
                >
                    APPLY ALL CHANGES
                </Button>
            </div>
        </Card>
    );
};

export default ReviewOptimize;
