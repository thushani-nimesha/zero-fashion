import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const FREE_SHIPPING_THRESHOLD = 2500;

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, updateQty, removeItem, clear } = useCart();
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

  const handleCheckout = () => {
      closeCart();
      navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl transition-transform">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="flex items-center gap-2 font-heading text-xl font-bold uppercase tracking-wider"><ShoppingBag className="h-5 w-5" /> Your Cart</h3>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={closeCart}><X className="h-5 w-5" /></Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-muted/50 p-6"><ShoppingBag className="h-12 w-12 text-muted-foreground" /></div>
            <p className="text-lg font-medium text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="rounded-full px-8 mt-2" onClick={closeCart}><Link to="/shop">Start Shopping</Link></Button>
          </div>
        ) : (
          <>
            <div className="bg-muted/30 p-4 border-b border-border">
                <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    {remaining > 0 ? (
                        <span>Add <span className="font-bold text-primary">৳{remaining.toLocaleString()}</span> more for Free Shipping</span>
                    ) : (
                        <span className="font-bold text-green-500">You've unlocked Free Shipping! 🎉</span>
                    )}
                </div>
                <Progress value={progress} className="h-2" />
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map(it => (
                <div key={it.id} className="flex gap-4">
                  <div className="h-24 w-20 overflow-hidden rounded-md bg-muted">
                    <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <Link to={`/product/${it.id}`} onClick={closeCart} className="line-clamp-2 text-sm font-semibold hover:text-primary leading-tight pr-2">{it.name}</Link>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive -mt-1" onClick={() => removeItem(it.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground uppercase tracking-widest">{it.brand}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={() => updateQty(it.id, it.qty - 1)}><Minus className="h-3 w-3" /></Button>
                            <span className="w-6 text-center text-sm font-medium">{it.qty}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={() => updateQty(it.id, it.qty + 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <p className="text-sm font-bold">৳{(it.price * it.qty).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4 border-t border-border p-5 bg-card">
              <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>Subtotal</span><span>৳{total.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{remaining > 0 ? 'Calculated at checkout' : 'Free'}</span></div>
              </div>
              <div className="flex items-center justify-between font-heading text-xl font-bold border-t border-border pt-4">
                <span>Total</span><span>৳{total.toLocaleString()}</span>
              </div>
              <Button className="w-full rounded-full" size="lg" onClick={handleCheckout}>Proceed to Checkout</Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}