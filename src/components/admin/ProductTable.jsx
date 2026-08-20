import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ProductTable({ products, onChange, onEdit, editingId }) {
    const { toast } = useToast();
    const [deleting, setDeleting] = useState(null);

    const remove = async (id) => {
        setDeleting(id);
        try {
            await apiClient.entities.Product.delete(id);
            toast({ title: 'Product deleted' });
            onChange?.();
        } catch {
            toast({ title: 'Delete failed', variant: 'destructive' });
        } finally { setDeleting(null); }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4">
                <h2 className="font-heading text-lg font-bold">Products ({products.length})</h2>
            </div>
            <div className="divide-y divide-border">
                {products.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No products yet.</p> : null}
                {products.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3">
                        <img src={p.image} alt={p.name} className="h-12 w-12 rounded-md border border-border object-cover" />
                        <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.brand} · {p.category}</p>
                        </div>
                        <span className="hidden text-sm font-semibold sm:block">৳{p.price.toLocaleString()}</span>
                        <span className={`hidden rounded-md px-2 py-0.5 text-xs sm:block ${p.in_stock ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                            {p.in_stock ? 'In stock' : 'Out'}
                        </span>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => onEdit?.(p)} className={editingId === p.id ? 'bg-muted' : ''}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" disabled={deleting === p.id} onClick={() => remove(p.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}