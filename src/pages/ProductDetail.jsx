import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { apiClient } from '@/api/apiClient';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import ProductCard from '@/components/ProductCard';

export default function ProductDetail() {
    const { id } = useParams();
    const { addItem } = useCart();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setProduct(null);
        apiClient.entities.Product.get(id)
            .then(p => {
                setProduct(p);
                return apiClient.entities.Product.filter({ category: p.category }, '-created_date', 5);
            })
            .then(r => { setRelated(r.filter(x => x.id !== id).slice(0, 4)); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="mx-auto max-w-7xl px-4 py-20"><div className="h-96 animate-pulse rounded-xl bg-muted/40" /></div>;
    if (!product) return <div className="mx-auto max-w-3xl px-4 py-20 text-center"><p className="text-muted-foreground">Product not found.</p><Button asChild className="mt-4"><Link to="/shop">Back to Shop</Link></Button></div>;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <nav className="mb-4 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/shop" className="hover:text-primary">Shop</Link> / <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    <Image src={product.image} alt={product.name} fittingType="fill" className="aspect-square w-full" />
                </div>
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-accent">{product.brand}</p>
                    <h1 className="mt-1 font-heading text-2xl font-bold sm:text-3xl">{product.name}</h1>
                    <div className="mt-3 flex items-center gap-3">
                        <span className="font-heading text-3xl font-bold text-primary">৳{product.price.toLocaleString()}</span>
                        {product.old_price ? <span className="text-lg text-muted-foreground line-through">৳{product.old_price.toLocaleString()}</span> : null}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${product.in_stock ? 'text-green-500' : 'text-destructive'}`}>{product.in_stock ? 'In Stock' : 'Out of Stock'}</p>

                    {product.description ? <p className="mt-4 text-muted-foreground">{product.description}</p> : null}

                    <div className="mt-6">
                        <Button size="lg" disabled={!product.in_stock} onClick={() => addItem(product)}>
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                        </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg border border-border p-3"><Truck className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-xs text-muted-foreground">Free Dhaka Delivery</p></div>
                        <div className="rounded-lg border border-border p-3"><ShieldCheck className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-xs text-muted-foreground">Official Warranty</p></div>
                        <div className="rounded-lg border border-border p-3"><RotateCcw className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-xs text-muted-foreground">7-Day Returns</p></div>
                    </div>
                </div>
            </div>

            {related.length > 0 && (
                <section className="mt-12">
                    <h2 className="mb-4 font-heading text-xl font-bold">Related Products</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {related.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}
        </div>
    );
}