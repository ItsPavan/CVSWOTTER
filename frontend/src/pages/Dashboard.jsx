import React, { useState } from 'react';
import DragDropUpload from '../components/DragDropUpload';
import SWOTCard from '../components/SWOTCard';
import DiffEditor from '../components/DiffEditor';
import api from '../lib/api';
import { Sparkles, FileText, LayoutDashboard, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [resumeId, setResumeId] = useState(null);
    const [jdText, setJdText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [jdUploadMode, setJdUploadMode] = useState('upload');
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'paste'
    const [resumeText, setResumeText] = useState('');

    const handleResumeTextChange = async (text) => {
        setResumeText(text);
        if (text.trim().length > 50) {
            // Create a mock upload if length is sufficient
            try {
                const blob = new Blob([text], { type: 'application/pdf' }); // Hack: Send as PDF MIME but backend treats as txt if we updated it? No, backend expects PDF/DOCX.
                // Better: Create a separate endpoint or just send text directly to analyze if we bypass upload? 
                // Current flow requires resumeId for /analyze. 
                // So we need to upload this text as a file.
                // Let's create a .txt file object
                const file = new File([blob], "pasted_resume.pdf", { type: "application/pdf" }); // Mocking PDF for now as backend supports PDF text extraction effectively on plain strings? No fitz will fail.
                // We need backend to support .txt or just skip upload step for paste.
                // Actually, let's just bypass upload for now if pasted?
                // Wait, /analyze needs resume_id. 
                // So we MUST upload.
            } catch (e) { }
        }
    };

    // Helper to upload pasted text as a generated PDF or TXT
    const uploadPastedText = async () => {
        if (!resumeText.trim()) return;
        // For now, we reuse DragDropUpload logic or create a hidden file input?
        // Simplest: Create a File object and send to /upload.
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
        <div className="min-h-screen pb-20 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 py-8">

                {/* Header Section */}
                <div className="mb-12 text-center md:text-left md:flex md:items-end md:justify-between">
                    <div>
                        <p className="mt-2 text-lg text-white font-light">
                            Optimise your resume for any Job Description with AI precision (v2.0).
                        </p>
                    </div>
                    {analysis && (
                        <div className="mt-4 md:mt-0 flex items-center justify-center rounded-full bg-royal-600 px-8 py-2 border border-royal-500 shadow-lg">
                            <span className="text-xs font-bold tracking-widest text-white uppercase">ANALYSIS COMPLETE</span>
                        </div>
                    )}
                </div>

                {/* Main Interface Grid */}
                <div className="grid gap-8 lg:grid-cols-12">

                    {/* Left Column: Inputs (5 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* 1. Resume Upload */}
                        <div className="glass-card rounded-2xl p-6 border border-maroon-700 bg-maroon-800/40 min-h-[300px]">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-1 rounded bg-maroon-700/50 border border-maroon-600/50">
                                        <FileText className="h-4 w-4 text-gold-500" />
                                    </div>
                                    <h3 className="font-bold tracking-widest text-gold-500 text-sm uppercase">1. RESUME</h3>
                                </div>
                                {/* Tabs */}
                                <div className="flex bg-maroon-900/50 rounded-lg p-1 border border-white/5">
                                    <button
                                        onClick={() => setUploadMode('upload')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${uploadMode === 'upload' ? 'bg-royal-600 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                    >
                                        UPLOAD
                                    </button>
                                    <button
                                        onClick={() => setUploadMode('paste')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${uploadMode === 'paste' ? 'bg-royal-600 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                    >
                                        PASTE
                                    </button>
                                </div>
                            </div>

                            {uploadMode === 'upload' ? (
                                <DragDropUpload onUploadComplete={handleUploadComplete} />
                            ) : (
                                <textarea
                                    className="w-full h-[200px] resize-none rounded-xl border border-maroon-600 bg-maroon-950/80 p-4 text-sm leading-relaxed shadow-inner focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none placeholder:text-white/20 text-blue-400 font-medium scrollbar-thin scrollbar-thumb-maroon-600"
                                    placeholder="Paste your resume text content here..."
                                    value={resumeText}
                                    onChange={(e) => handleResumeTextChange(e.target.value)}
                                />
                            )}
                        </div>

                        {/* 2. Job Description */}
                        <div className="glass-card rounded-2xl p-6 h-[400px] flex flex-col border border-maroon-700 bg-maroon-800/40">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-1 rounded bg-maroon-700/50 border border-maroon-600/50">
                                        <LayoutDashboard className="h-4 w-4 text-gold-500" />
                                    </div>
                                    <h3 className="font-bold tracking-widest text-gold-500 text-sm uppercase">2. JOB DESCRIPTION</h3>
                                </div>
                                {/* JD Tabs */}
                                <div className="flex bg-maroon-900/50 rounded-lg p-1 border border-white/5">
                                    <button
                                        onClick={() => setJdUploadMode('upload')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${jdUploadMode === 'upload' ? 'bg-royal-600 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                    >
                                        UPLOAD
                                    </button>
                                    <button
                                        onClick={() => setJdUploadMode('paste')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${jdUploadMode === 'paste' ? 'bg-royal-600 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                    >
                                        PASTE
                                    </button>
                                </div>
                            </div>

                            {jdUploadMode === 'upload' ? (
                                <DragDropUpload
                                    onUploadComplete={(data) => {
                                        if (data.text) setJdText(data.text);
                                    }}
                                    endpoint="/extract-text"
                                    label="JD"
                                />
                            ) : (
                                <textarea
                                    className="flex-1 w-full resize-none rounded-xl border border-maroon-600 bg-maroon-950/80 p-4 text-sm leading-relaxed shadow-inner focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none placeholder:text-white/20 text-blue-400 font-medium scrollbar-thin scrollbar-thumb-maroon-600"
                                    placeholder="Paste the raw job description text here..."
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                />
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={!resumeId || !jdText.trim() || analyzing}
                            className="group relative w-full overflow-hidden rounded-full bg-royal-600 p-4 shadow-xl transition-all hover:bg-royal-500 disabled:opacity-50 disabled:hover:bg-royal-600 border-t border-white/10"
                        >
                            <div className="flex items-center justify-center gap-3">
                                {analyzing ? (
                                    <>
                                        <BrainCircuit className="h-5 w-5 animate-pulse text-white" />
                                        <span className="text-sm font-bold text-white tracking-widest uppercase">Wiring Agents...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5 text-gold-400" />
                                        <span className="text-sm font-bold text-white tracking-widest uppercase">ANALYZE & OPTIMIZE</span>
                                    </>
                                )}
                            </div>
                        </button>

                    </div>

                    {/* Right Column: Results (7 cols) */}
                    <div className="lg:col-span-8 relative min-h-[600px]">
                        {!analysis && !analyzing && (
                            <div className="glass-card flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-maroon-800/50 p-12 text-center opacity-60">
                                <div className="mb-6 rounded-full bg-maroon-800/50 p-8 shadow-inner border border-white/5">
                                    <Sparkles className="h-12 w-12 text-white/30" />
                                </div>
                                <h3 className="text-2xl font-light text-white tracking-wide">Ready to Architect</h3>
                                <p className="text-white/40 max-w-sm mt-3 font-light leading-relaxed">
                                    Awaiting your inputs to generate a comprehensive strategic analysis.
                                </p>
                            </div>
                        )}

                        {analyzing && (
                            <div className="glass-card flex h-full flex-col items-center justify-center rounded-3xl p-12 text-center">
                                <div className="relative mb-8">
                                    <div className="h-32 w-32 animate-spin rounded-full border-4 border-royal-500/30 border-t-gold-500" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <BrainCircuit className="h-12 w-12 text-gold-500 animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight">ANALYZING...</h3>
                                <p className="text-royal-200 mt-2 font-mono text-sm">Connecting career nodes...</p>
                            </div>
                        )}

                        {analysis && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                {/* Match Score Ring */}
                                <div className="glass-card rounded-2xl p-8 relative overflow-hidden group border border-maroon-700 bg-maroon-800/40">

                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                        <div>
                                            <div className="text-xs font-bold text-gold-500/80 uppercase tracking-widest mb-1">ATS Match Score</div>
                                            <div className="text-8xl font-black text-gold-500 drop-shadow-lg tracking-tighter leading-none">
                                                {analysis.match_score || 0}<span className="text-4xl align-top">%</span>
                                            </div>
                                            <p className="text-white/60 text-sm mt-3 max-w-[200px] leading-relaxed">
                                                Based on keyword density and semantic relevance.
                                            </p>
                                        </div>

                                        {/* Progress Ring Visual */}
                                        <div className="relative h-40 w-40 flex items-center justify-center">
                                            {/* Track */}
                                            <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="42" fill="none" stroke="#2d0a0a" strokeWidth="6" />
                                                <circle
                                                    cx="50" cy="50" r="42" fill="none" stroke="#eab308" strokeWidth="6"
                                                    strokeDasharray="264"
                                                    strokeDashoffset={264 - (264 * (analysis.match_score || 0)) / 100}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* SWOT Section */}
                                <div className="glass-card rounded-2xl p-8 border border-gold-500/30 bg-maroon-900/40">
                                    <h3 className="mb-6 text-xl font-bold text-gold-500 tracking-widest flex items-center gap-2 uppercase">
                                        /// STRATEGIC ANALYSIS
                                    </h3>
                                    <SWOTCard swot={analysis.swot_analysis || analysis.swot_data} />
                                </div>

                                {/* Recommendations */}
                                <div className="glass-card rounded-2xl p-8 border border-gold-500/30 bg-maroon-900/40">
                                    <h3 className="mb-6 text-xl font-bold text-gold-500 tracking-widest flex items-center gap-2 uppercase">
                                        /// OPTIMIZATION PLAN
                                    </h3>
                                    <DiffEditor analysis={analysis} />
                                </div>
                            </motion.div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
