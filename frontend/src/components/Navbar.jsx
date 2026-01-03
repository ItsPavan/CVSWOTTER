import React from 'react';
import { supabase } from '../lib/supabase';
import { Layers } from 'lucide-react';

export default function Navbar({ session }) {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-maroon-900/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Layers className="h-6 w-6 text-gold-500" />
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        ResumeAI <span className="text-gold-500">Architect</span>
                    </h1>
                </div>

                {session && (
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-white/40">{session.user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-semibold text-royal-300 hover:text-white transition-colors border border-royal-900/50 rounded-full px-4 py-1.5 hover:bg-royal-900/30 hover:border-royal-500/30"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
