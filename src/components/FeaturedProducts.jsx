import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.entities.Product.list('-created_date', 50)
            .then(p => { setProducts(p.filter(x => x.featured).slice(0, 8)); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <section className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h2 className="font-heading text-2xl font-bold sm:text-3xl">Featured Products</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Hand-picked gear from top brands</p>
                </div>
                <Button asChild variant="outline"><Link to="/shop">View All</Link></Button>
            </div>
            {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted/40" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            )}
        </section>
    );
}