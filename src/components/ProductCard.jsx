import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    return (
        <div className="group flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_24px_-10px_rgba(255,255,255,0.06)] rounded-2xl p-2 bg-transparent hover:bg-card border border-transparent hover:border-border/50">
            <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted/40">
                <Image src={product.image} alt={product.name} fittingType="fill" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                {product.old_price ? (
                    <span className="absolute left-3 top-3 rounded-full bg-destructive px-2 py-1 text-xs font-bold tracking-wider text-destructive-foreground shadow-sm">
                        -{Math.round((1 - product.price / product.old_price) * 100)}%
                    </span>
                ) : null}
                {!product.in_stock && <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm">Sold Out</span>}
            </Link>
            <div className="mt-3 flex flex-col flex-1 justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{product.brand}</p>
                    <Link to={`/product/${product.id}`} className="mt-1 block text-sm font-semibold transition hover:text-primary line-clamp-1">{product.name}</Link>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="font-heading font-bold text-foreground">৳{product.price.toLocaleString()}</span>
                        {product.old_price ? <span className="text-xs text-muted-foreground line-through">৳{product.old_price.toLocaleString()}</span> : null}
                    </div>
                </div>
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-3 rounded-full hover:bg-primary hover:text-primary-foreground border-border/80 transition-colors duration-200" 
                    disabled={!product.in_stock} 
                    onClick={(e) => { e.preventDefault(); addItem(product); }}
                >
                    <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Add to Cart
                </Button>
            </div>
        </div>
    );
}