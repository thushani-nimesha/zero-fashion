import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Clock, Truck, CheckCircle2, Trash2 } from 'lucide-react';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Orders({ isEmbedded = false }) {
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(new Set());
    const [bulkStatus, setBulkStatus] = useState('');
    const [applying, setApplying] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchOrders = () => {
            apiClient.entities.Order.list('-created_date', 200)
                .then(res => {
                    setOrders(res.filter(o => o.status !== 'removed' && o.status !== 'dismissed'));
                })
                .finally(() => setLoading(false));
        };
        setLoading(true);
        fetchOrders();
        const unsubscribe = apiClient.entities.Order.subscribe(() => {
            fetchOrders();
        });
        return unsubscribe;
    }, []);

    const filtered = useMemo(() => filter === 'all' ? orders : orders.filter(o => o.status === filter), [orders, filter]);

    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
    }), [orders]);

    const allSelected = filtered.length > 0 && filtered.every(o => selected.has(o.id));
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(o => o.id)));

    const toggle = (id) => setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const applyBulk = async () => {
        if (!bulkStatus || selected.size === 0) return;
        setApplying(true);
        try {
            await apiClient.entities.Order.bulkUpdate([...selected].map(id => ({ id, status: bulkStatus })));
            toast({ title: `${selected.size} order(s) updated to ${bulkStatus}` });
            setSelected(new Set());
            setBulkStatus('');
        } catch {
            toast({ title: 'Bulk update failed', variant: 'destructive' });
        } finally { setApplying(false); }
    };

    const updateStatus = async (id, status) => {
        try { await apiClient.entities.Order.update(id, { status }); }
        catch { toast({ title: 'Update failed', variant: 'destructive' }); }
    };

    const deleteOrder = async (id) => {
        if (!confirm('Are you sure you want to remove this order?')) return;
        try {
            await apiClient.entities.Order.update(id, { status: 'removed' });
            toast({ title: 'Order removed successfully' });
        } catch {
            toast({ title: 'Failed to remove order', variant: 'destructive' });
        }
    };

    const statCards = [
        { label: 'Total Orders', value: stats.total, icon: Package, color: 'text-primary' },
        { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
        { label: 'Shipped', value: stats.shipped, icon: Truck, color: 'text-purple-500' },
        { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'text-green-500' },
    ];

    return (
        <div className={isEmbedded ? "py-4" : "mx-auto max-w-7xl px-4 py-8"}>
            {!isEmbedded && (
                <>
                    <h1 className="font-heading text-2xl font-bold sm:text-3xl">Order Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Orders sync automatically in real time.</p>
                </>
            )}

            <div className={isEmbedded ? "grid grid-cols-2 gap-4 lg:grid-cols-4" : "mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"}>
                {statCards.map(s => (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{s.label}</span>
                            <s.icon className={`h-5 w-5 ${s.color}`} />
                        </div>
                        <p className="mt-1 font-heading text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
                {['all', ...STATUSES].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}>{s}</button>
                ))}
            </div>

            {selected.size > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <span className="text-sm font-medium">{selected.size} selected</span>
                    <Select value={bulkStatus} onValueChange={setBulkStatus}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Set status…" /></SelectTrigger>
                        <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button size="sm" disabled={!bulkStatus || applying} onClick={applyBulk}>
                        {applying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Apply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
                </div>
            )}

            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="hidden grid-cols-[auto_1fr_1fr_auto_auto_auto_auto] gap-4 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                    <span>Order</span><span>Customer</span><span>Total</span><span>Status</span><span>Date</span><span>Action</span>
                </div>
                <div className="divide-y divide-border">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : filtered.length === 0 ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">No orders found.</p>
                    ) : filtered.map(o => (
                        <div key={o.id} className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[auto_1fr_1fr_auto_auto_auto_auto] sm:items-center sm:gap-4">
                            <Checkbox checked={selected.has(o.id)} onCheckedChange={() => toggle(o.id)} />
                            <div>
                                <p className="text-sm font-medium">#{o.order_number || o.id.slice(-6)}</p>
                                <p className="text-xs text-muted-foreground">{o.items?.length || 0} item(s) · {o.payment_method}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm">{o.customer_name}</p>
                                <p className="truncate text-xs text-muted-foreground">{o.customer_phone}</p>
                            </div>
                            <span className="text-sm font-semibold">৳{(o.total || 0).toLocaleString()}</span>
                            <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                                <SelectTrigger className="w-36 capitalize"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground">{o.created_date ? new Date(o.created_date).toLocaleDateString() : ''}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                onClick={() => deleteOrder(o.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}