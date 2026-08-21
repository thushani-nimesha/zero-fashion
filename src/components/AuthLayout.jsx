import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
                        <Icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                    {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
                </div>
                <div className="bg-card/60 backdrop-blur-md rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.03)] border border-border/80 dark:border-white/10 p-8 relative">
                    {children}
                </div>
                {footer && (
                    <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
                )}
            </div>
        </div>
    );
}
