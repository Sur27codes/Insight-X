"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming this exists or I'll implement a simple one

// Simple class merger if lib/utils allows, else inline
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export const GlassCard = ({ children, className, style, delay = 0, hoverEffect = true }: { children: React.ReactNode, className?: string, style?: React.CSSProperties, delay?: number, hoverEffect?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hoverEffect ? { scale: 1.01, boxShadow: "0 0 40px rgba(6,182,212,0.15)" } : {}}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={classNames(
            "glass-panel relative rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl transition-all duration-500 overflow-hidden group",
            className || ""
        )}
        style={style}
    >
        {/* Spotlight Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10">
            {children}
        </div>
    </motion.div>
);

export const GlassStat = ({ label, value, trend, delay = 0 }: { label: string, value: string, trend?: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay }}
        className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md"
    >
        <span className="text-sm text-gray-400 font-medium mb-1">{label}</span>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
            {trend && <span className="text-xs font-semibold text-emerald-400">{trend}</span>}
        </div>
    </motion.div>
);

export const GlassButton = ({ children, onClick, className, variant = "primary" }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: "primary" | "secondary" | "danger" }) => (
    <motion.button
        whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(6,182,212,0.4)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className={classNames(
            "glass-button px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all duration-300",
            variant === "primary" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20" : "bg-white/5 hover:bg-white/10 text-white border border-white/10",
            className || ""
        )}
    >
        {children}
    </motion.button>
);

export const GlassModal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50"
                >
                    <div className="glass-panel mx-4 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                            <button onClick={onClose} className="text-white/50 hover:text-white px-2">✕</button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);
