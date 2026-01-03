import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';

export default function SWOTCard({ swot }) {
    if (!swot) return null;

    const sections = [
        {
            title: 'Strengths',
            data: swot.strengths,
            icon: CheckCircle2,
            color: 'text-gold-500',
            bg: 'bg-gold-500/10',
            border: 'border-gold-500/20'
        },
        {
            title: 'Weaknesses',
            data: swot.weaknesses,
            icon: XCircle,
            color: 'text-red-800', // Deep Maroon/Red
            bg: 'bg-red-900/10',
            border: 'border-red-900/20'
        },
        {
            title: 'Opportunities',
            data: swot.opportunities,
            icon: Info,
            color: 'text-royal-400',
            bg: 'bg-royal-500/10',
            border: 'border-royal-500/20'
        },
        {
            title: 'Threats',
            data: swot.threats,
            icon: AlertTriangle,
            color: 'text-gold-500', // Gold Caution
            bg: 'bg-gold-500/10',
            border: 'border-gold-500/20'
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section) => (
                <div key={section.title} className={clsx("glass-card rounded-2xl p-6 border", section.border)}>
                    <div className="mb-4 flex items-center gap-3">
                        <div className={clsx("rounded-xl p-2.5", section.bg)}>
                            <section.icon className={clsx("h-5 w-5", section.color)} />
                        </div>
                        <h3 className="font-bold tracking-wide text-white">{section.title}</h3>
                    </div>
                    <ul className="space-y-3">
                        {section.data?.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-white/80 font-light leading-relaxed">
                                <span className={clsx("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full opacity-60", section.color.replace('text-', 'bg-'))} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
