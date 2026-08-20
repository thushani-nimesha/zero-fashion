import React from 'react';

const pillars = [
    'ZERO FASHION',
    'MINIMALIST DESIGN',
    'SUSTAINABLE ETHOS',
    'PREMIUM CRAFTSMANSHIP',
    'EXCLUSIVE COLLECTIONS',
    'TIMELESS COMFORT'
];

export default function BrandStrip() {
    // Duplicate the pillars to create a seamless infinite scrolling effect
    const doublePillars = [...pillars, ...pillars, ...pillars];

    return (
        <section className="border-y border-border bg-card/30 overflow-hidden py-6">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-33.333%); }
                }
                .marquee-container {
                    display: flex;
                    width: max-content;
                    animation: marquee 25s linear infinite;
                }
            `}</style>
            <div className="relative w-full overflow-hidden">
                <div className="marquee-container gap-16">
                    {doublePillars.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-4 whitespace-nowrap">
                            <span className="font-heading text-lg font-bold tracking-widest text-muted-foreground/60 transition-colors duration-300 hover:text-primary">
                                {p}
                            </span>
                            <span className="h-2 w-2 rounded-full bg-primary/40" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}