import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    return (
        <div className="group flex flex-col">
            <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted/40">
                <Image src={product.image} alt={product.name} fittingType="fill" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                {product.old_price ? (
                    <span className="absolute left-3 top-3 rounded-full bg-destructive px-2 py-1 text-xs font-bold tracking-wider text-destructive-foreground shadow-sm">
                        -{Math.round((1 - product.price / product.old_price) * 100)}%
                    </span>
                ) : null}
                {!product.in_stock && <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm">Sold Out</span>}
                
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button size="sm" className="w-full shadow-lg" disabled={!product.in_stock} onClick={(e) => { e.preventDefault(); addItem(product); }}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                </div>
            </Link>
            <div className="mt-4 flex flex-col">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{product.brand}</p>
                <Link to={`/product/${product.id}`} className="mt-1 text-sm font-semibold transition hover:text-primary">{product.name}</Link>
                <div className="mt-1 flex items-center gap-2">
                    <span className="font-heading font-bold text-foreground">৳{product.price.toLocaleString()}</span>
                    {product.old_price ? <span className="text-sm text-muted-foreground line-through">৳{product.old_price.toLocaleString()}</span> : null}
                </div>
            </div>
        </div>
    );
}