import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/lib/cart-context';

const payments = ['Cash on Delivery', 'bKash', 'Nagad', 'Card'];

export default function CheckoutModal({ open, onOpenChange }) {
    const { items, total, clear } = useCart();
    const { toast } = useToast();
    const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', shipping_address: '', payment_method: 'Cash on Delivery' });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.customer_name || !form.customer_phone || !form.shipping_address) {
            toast({ title: 'Please fill name, phone and address', variant: 'destructive' });
            return;
        }
        setSaving(true);
        try {
            await apiClient.entities.Order.create({
                order_number: 'VG' + Date.now().toString().slice(-8),
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                customer_email: form.customer_email,
                shipping_address: form.shipping_address,
                payment_method: form.payment_method,
                items: items.map(i => ({ name: i.name, brand: i.brand, price: i.price, qty: i.qty })),
                total,
                status: 'pending',
            });
            toast({ title: 'Order placed successfully!' });
            clear();
            onOpenChange?.(false);
        } catch {
            toast({ title: 'Failed to place order', variant: 'destructive' });
        } finally { setSaving(false); }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Checkout</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="cname">Full Name</Label>
                            <Input id="cname" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Your name" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cphone">Phone</Label>
                            <Input id="cphone" value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} placeholder="01XXXXXXXXX" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="cemail">Email (optional)</Label>
                        <Input id="cemail" type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} placeholder="you@email.com" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="caddr">Shipping Address</Label>
                        <Textarea id="caddr" value={form.shipping_address} onChange={e => set('shipping_address', e.target.value)} rows={2} placeholder="House, road, area, city" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Payment Method</Label>
                        <Select value={form.payment_method} onValueChange={v => set('payment_method', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {payments.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{items.length}</span></div>
                        <div className="mt-1 flex justify-between font-semibold"><span>Total</span><span className="text-primary">৳{total.toLocaleString()}</span></div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Place Order
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}