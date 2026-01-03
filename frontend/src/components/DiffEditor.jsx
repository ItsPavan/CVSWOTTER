import React, { useState } from 'react';
import { Check, X, Download, ArrowRight } from 'lucide-react';
import api from '../lib/api';

export default function DiffEditor({ analysis, onGenerate }) {
    const [recommendations, setRecommendations] = useState(
        (analysis.recommendations || []).map(r => ({ ...r, status: 'pending' }))
    );
    const [generating, setGenerating] = useState(false);

    const handleDecision = (index, status) => {
        const newRecs = [...recommendations];
        newRecs[index].status = status;
        setRecommendations(newRecs);
    };

    const handleGenerate = async () => {
        const accepted = recommendations.filter(r => r.status === 'accepted');
        setGenerating(true);
        try {
            const response = await api.post('/generate-pdf', {
                analysis_id: analysis.analysis_id || 'unknown',
                accepted_suggestions: accepted
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'optimized_resume.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (e) {
            console.error(e);
            alert("Failed to generate PDF");
        } finally {
            setGenerating(false);
        }
    };

    if (recommendations.length === 0) {
        return <div className="text-center text-white/50">No recommendations available.</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white tracking-wide">Review & Optimize</h3>
                <span className="text-sm font-medium text-gold-500 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
                    {recommendations.filter(r => r.status === 'accepted').length} ACCEPTED
                </span>
            </div>

            <div className="space-y-6">
                {recommendations.map((rec, i) => (
                    <div key={i} className="grid gap-6 rounded-2xl border border-white/5 bg-maroon-900/40 p-6 md:grid-cols-2 shadow-lg hover:border-royal-500/30 transition-all">
                        {/* Original Side */}
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Original</span>
                            <div className="rounded-xl bg-maroon-900/80 border border-white/5 p-4 text-sm text-white/70 leading-relaxed font-light">
                                {rec.original}
                            </div>
                        </div>

                        {/* Suggested Side */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-gold-500 uppercase tracking-widest flex items-center gap-2">
                                    Suggested <ArrowRight className="h-3 w-3" />
                                </span>
                                <div className="flex gap-2" role="group">
                                    <button
                                        onClick={() => handleDecision(i, 'accepted')}
                                        className={`p-2 rounded-lg transition-all border ${rec.status === 'accepted' ? 'bg-green-500 text-white border-green-500' : 'bg-white/5 text-white/40 border-transparent hover:text-green-400 hover:bg-green-900/20'}`}
                                        title="Accept"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDecision(i, 'rejected')}
                                        className={`p-2 rounded-lg transition-all border ${rec.status === 'rejected' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 text-white/40 border-transparent hover:text-red-400 hover:bg-red-900/20'}`}
                                        title="Reject"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-xl p-4 text-sm leading-relaxed transition-all border bg-gold-400 text-maroon-900 border-gold-500 shadow-lg font-medium">
                                {rec.suggested}
                            </div>
                            <div className="mt-2 text-xs text-royal-200/60 italic px-2">
                                Why: {rec.reason}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="sticky bottom-6 flex justify-center pt-8">
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-royal-600 to-royal-800 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-royal-500/25 hover:from-royal-500 hover:to-royal-700 disabled:opacity-70 disabled:scale-100 border border-white/10"
                >
                    {generating ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    ) : (
                        <Download className="h-5 w-5" />
                    )}
                    DOWNLOAD OPTIMIZED RESUME
                </button>
            </div>
        </div>
    );
}
