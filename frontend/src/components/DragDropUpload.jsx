import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function DragDropUpload({ onUploadComplete, endpoint = "/upload", label = "Resume" }) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
    const [errorMessage, setErrorMessage] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    }, []);

    const uploadFile = async (file) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
            setErrorMessage("Only PDF and DOCX files are supported");
            return;
        }

        setUploadState('uploading');
        setErrorMessage(null);
        setFileInfo({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Small delay for visual satisfaction
            setTimeout(() => {
                setUploadState('success');
                // Pass full data if endpoint returns generic data, else pass id
                if (response.data.resume_id) {
                    onUploadComplete(response.data.resume_id, file.name);
                } else {
                    onUploadComplete(response.data);
                }
            }, 800);
        } catch (err) {
            console.error(err);
            setUploadState('error');
            setErrorMessage(err.response?.data?.detail || "Upload failed. Please try again.");
        }
    };

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await uploadFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            await uploadFile(e.target.files[0]);
        }
    };

    const resetUpload = (e) => {
        e.stopPropagation();
        setUploadState('idle');
        setFileInfo(null);
        onUploadComplete(null, null); // Reset in parent too if needed
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {uploadState === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="relative flex items-center gap-4 rounded-xl border border-gold-500/50 bg-gold-900/10 p-6 shadow-inner shadow-gold-500/5"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h3 className="truncate font-bold text-white">{fileInfo.name}</h3>
                            <p className="text-sm text-gold-500/80 font-medium">Ready for analysis</p>
                        </div>
                        <button onClick={resetUpload} className="rounded-full p-2 hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={clsx(
                            "relative group flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all duration-300 backdrop-blur-sm",
                            isDragActive ? "border-gold-500 bg-gold-500/5 scale-[1.02]" : "border-white/10 hover:border-royal-500/50 hover:bg-royal-900/20",
                            uploadState === 'error' && "border-red-500/50 bg-red-900/20"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload').click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.doc"
                            onChange={handleChange}
                            disabled={uploadState === 'uploading'}
                        />

                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className={clsx(
                                "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 shadow-2xl",
                                uploadState === 'uploading' ? "bg-maroon-800" : "bg-gradient-to-br from-royal-600 to-royal-800 text-white group-hover:shadow-royal-500/30"
                            )}>
                                {uploadState === 'uploading' ? (
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-500 border-t-gold-500" />
                                ) : (
                                    <Upload className="h-8 w-8" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-royal-200 transition-colors">
                                    {uploadState === 'uploading' ? "Uploading..." : `Click to Upload ${label}`}
                                </h3>
                                <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                                    PDF or DOCX (Word) supported
                                </p>
                            </div>
                        </div>

                        {uploadState === 'error' && (
                            <div className="absolute inset-x-0 bottom-4 px-4 text-center">
                                <p className="text-sm font-medium text-red-400 bg-red-900/50 py-1 rounded-full inline-block px-3 border border-red-500/20">
                                    <AlertCircle className="inline h-3 w-3 mr-1" />
                                    {errorMessage}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
