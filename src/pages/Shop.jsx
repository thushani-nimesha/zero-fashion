import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';


export default function Shop() {
    const [params, setParams] = useSearchParams();
    const category = params.get('category') || '';
    const brand = params.get('brand') || '';
    const q = params.get('q') || '';
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiClient.entities.Product.list('-created_date', 100),
            apiClient.entities.Category.list()
        ]).then(([p, c]) => {
            setProducts(p);
            setBrands([...new Set(p.map(x => x.brand))].sort());
            if (c && c.length > 0) {
                setCategories(c.map(cat => cat.name));
            } else {
                setCategories(['T-Shirts', 'Trousers', 'Pants', 'Accessories', 'Outerwear', 'Shoes', 'Jewelry', 'Premium']);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => products.filter(p =>
        (!category || p.category === category) &&
        (!brand || p.brand === brand) &&
        (!q || (p.name + p.brand + p.category).toLowerCase().includes(q.toLowerCase()))
    ), [products, category, brand, q]);

    const setParam = (key, val) => {
        const next = new URLSearchParams(params);
        if (val) next.set(key, val); else next.delete(key);
        setParams(next);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">Shop</h1>
            <p className="mt-1 text-sm text-muted-foreground">{filtered.length} products{category ? ` in ${category}` : ''}</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
                <aside className="space-y-6">
                    <div className="relative lg:hidden">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input defaultValue={q} placeholder="Search…" className="bg-muted/50 pl-9" onChange={e => setParam('q', e.target.value)} />
                    </div>
                    <div>
                        <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</h3>
                        <ul className="space-y-1.5 text-sm">
                            <li>
                                <button 
                                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between border ${
                                        !category 
                                        ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(255,255,255,0.05)] font-semibold scale-[1.02]' 
                                        : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30 hover:translate-x-1.5'
                                    }`} 
                                    onClick={() => setParam('category', '')}
                                >
                                    <span>All</span>
                                    {!category && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                                </button>
                            </li>
                            {categories.map(c => (
                                <li key={c}>
                                    <button 
                                        className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between border ${
                                            category === c 
                                            ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(255,255,255,0.05)] font-semibold scale-[1.02]' 
                                            : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30 hover:translate-x-1.5'
                                        }`} 
                                        onClick={() => setParam('category', category === c ? '' : c)}
                                    >
                                        <span>{c}</span>
                                        {category === c && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {brands.length > 0 && (
                        <div>
                            <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">Brands</h3>
                            <ul className="space-y-1.5 text-sm">
                                <li>
                                    <button 
                                        className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between border ${
                                            !brand 
                                            ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(255,255,255,0.05)] font-semibold scale-[1.02]' 
                                            : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30 hover:translate-x-1.5'
                                        }`} 
                                        onClick={() => setParam('brand', '')}
                                    >
                                        <span>All</span>
                                        {!brand && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                                    </button>
                                </li>
                                {brands.map(b => (
                                    <li key={b}>
                                        <button 
                                            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between border ${
                                                brand === b 
                                                ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(255,255,255,0.05)] font-semibold scale-[1.02]' 
                                                : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30 hover:translate-x-1.5'
                                            }`} 
                                            onClick={() => setParam('brand', brand === b ? '' : b)}
                                        >
                                            <span>{b}</span>
                                            {brand === b && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>

                <div>
                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted/40" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">No products found.</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}