import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';
import { motion } from 'framer-motion';

export default function CategoryGrid() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.entities.Category.list()
            .then(data => { setCategories(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (!loading && categories.length === 0) return null;

    return (
        <motion.section 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-7xl px-4 py-12"
        >
            <div className="mb-6 text-center">
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">Shop by Category</h2>
                <p className="mt-1 text-sm text-muted-foreground">Find exactly what you need</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl bg-muted/40 animate-pulse" />
                    ))
                ) : (
                    categories.map(c => (
                        <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`} className="group relative overflow-hidden rounded-xl border border-border bg-card">
                            <div className="aspect-[4/3] overflow-hidden bg-muted/30">
                                {c.img && (
                                    <img src={c.img} alt={c.name} className="h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4">
                                <span className="font-heading text-lg font-bold drop-shadow-md text-white">{c.name}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </motion.section>
    );
}