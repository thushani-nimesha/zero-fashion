import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 2500;
const DELIVERY_CHARGE = 100;

export default function Checkout() {
    const { items, total, clear } = useCart();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', shipping_address: '', payment_method: 'Cash on Delivery' });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const finalTotal = total + shippingCost;

    if (items.length === 0) {
        return (
            <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center">
                <div className="rounded-full bg-muted/50 p-6 mb-4"><Truck className="h-12 w-12 text-muted-foreground" /></div>
                <h2 className="font-heading text-2xl font-bold">Your cart is empty</h2>
                <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild className="mt-6 rounded-full px-8"><Link to="/shop">Continue Shopping</Link></Button>
            </div>
        );
    }

    const submit = async (e) => {
        e.preventDefault();
        if (!form.customer_name || !form.customer_phone || !form.shipping_address) {
            toast({ title: 'Please fill name, phone and address', variant: 'destructive' });
            return;
        }
        setSaving(true);
        try {
            await apiClient.entities.Order.create({
                order_number: 'ZF' + Date.now().toString().slice(-6),
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                customer_email: form.customer_email,
                shipping_address: form.shipping_address,
                payment_method: form.payment_method,
                items: items.map(i => ({ name: i.name, brand: i.brand, price: i.price, qty: i.qty })),
                total: finalTotal,
                status: 'pending',
            });
            toast({ title: 'Order placed successfully! 🎉' });
            clear();
            navigate('/');
        } catch {
            toast({ title: 'Failed to place order', variant: 'destructive' });
        } finally { setSaving(false); }
    };

    return (
        <div className="bg-muted/10 min-h-screen pb-24">
            <div className="mx-auto max-w-6xl px-4 pt-8">
                <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
                </Button>
                
                <h1 className="font-heading text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid gap-12 lg:grid-cols-12">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7">
                        <form id="checkout-form" onSubmit={submit} className="space-y-8">
                            {/* Shipping Information */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">1</span>
                                    Shipping Details
                                </h2>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="cname">Full Name <span className="text-destructive">*</span></Label>
                                        <Input id="cname" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Enter your full name" className="bg-muted/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cphone">Phone Number <span className="text-destructive">*</span></Label>
                                        <Input id="cphone" value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} placeholder="01XXXXXXXXX" className="bg-muted/50" />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="cemail">Email Address (Optional)</Label>
                                        <Input id="cemail" type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} placeholder="For order updates" className="bg-muted/50" />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="caddr">Full Delivery Address <span className="text-destructive">*</span></Label>
                                        <Textarea id="caddr" value={form.shipping_address} onChange={e => set('shipping_address', e.target.value)} rows={3} placeholder="House, Road, Area, City" className="bg-muted/50 resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">2</span>
                                    Payment Method
                                </h2>
                                <RadioGroup value={form.payment_method} onValueChange={v => set('payment_method', v)} className="grid gap-4 sm:grid-cols-3">
                                    <div className="relative">
                                        <RadioGroupItem value="Cash on Delivery" id="cod" className="peer sr-only" />
                                        <Label htmlFor="cod" className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                            <span className="font-bold">Cash on Delivery</span>
                                            <span className="text-xs text-muted-foreground text-center">Pay when you receive</span>
                                        </Label>
                                    </div>
                                    <div className="relative">
                                        <RadioGroupItem value="bKash" id="bkash" className="peer sr-only" />
                                        <Label htmlFor="bkash" className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-[#e2136e] peer-data-[state=checked]:bg-[#e2136e]/5 cursor-pointer transition-all">
                                            <span className="font-bold text-[#e2136e]">bKash</span>
                                            <span className="text-xs text-muted-foreground text-center">Pay via app</span>
                                        </Label>
                                    </div>
                                    <div className="relative">
                                        <RadioGroupItem value="Card" id="card" className="peer sr-only" />
                                        <Label htmlFor="card" className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                            <span className="font-bold">Card</span>
                                            <span className="text-xs text-muted-foreground text-center">Visa / Mastercard</span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {form.payment_method === 'bKash' && (
                                    <div className="mt-6 rounded-lg bg-[#e2136e]/10 p-4 border border-[#e2136e]/20">
                                        <p className="text-sm font-medium text-[#e2136e] mb-2">bKash Payment Instructions:</p>
                                        <ol className="list-decimal pl-5 text-sm space-y-1 text-muted-foreground">
                                            <li>Go to your bKash App or Dial *247#</li>
                                            <li>Choose "Send Money"</li>
                                            <li>Enter the Merchant Number: <span className="font-bold text-foreground">017XXXXXXXX</span></li>
                                            <li>Enter the total amount: <span className="font-bold text-foreground">৳{finalTotal.toLocaleString()}</span></li>
                                            <li>Enter your TrxID below to verify (Optional for now)</li>
                                        </ol>
                                        <Input placeholder="Enter TrxID (Optional)" className="mt-3 bg-background" />
                                    </div>
                                )}
                                {form.payment_method === 'Card' && (
                                    <div className="mt-6 rounded-lg bg-muted/50 p-4 border border-border flex items-center gap-3">
                                        <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">You will be securely redirected to our payment gateway to complete the transaction after clicking Place Order.</p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-lg">
                            <h2 className="font-heading text-xl font-bold mb-6 border-b border-border pb-4">Order Summary</h2>
                            
                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                                {items.map(it => (
                                    <div key={it.id} className="flex gap-4">
                                        <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                            <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center">
                                            <h4 className="line-clamp-1 text-sm font-semibold">{it.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">Qty: {it.qty}</p>
                                            <p className="text-sm font-bold mt-1">৳{(it.price * it.qty).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-foreground">৳{total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span className="font-medium text-foreground">
                                        {shippingCost === 0 ? <span className="text-green-500 font-bold">Free</span> : `৳${shippingCost.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between font-heading text-2xl font-bold border-t border-border pt-4 mt-2">
                                    <span>Total</span>
                                    <span className="text-primary">৳{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button type="submit" form="checkout-form" className="w-full mt-8 rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/20" disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}Place Order (৳{finalTotal.toLocaleString()})
                            </Button>
                            
                            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Secure checkout provided by Zero Fashion
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
