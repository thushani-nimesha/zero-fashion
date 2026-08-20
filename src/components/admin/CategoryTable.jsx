import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';

export default function CategoryTable({ categories, onChange }) {
    const { toast } = useToast();
    const [deleting, setDeleting] = useState(null);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        setDeleting(id);
        try {
            await apiClient.entities.Category.delete(id);
            toast({ title: 'Category deleted' });
            if (onChange) onChange();
        } catch (error) {
            toast({ title: 'Failed to delete', variant: 'destructive' });
        } finally {
            setDeleting(null);
        }
    };

    if (!categories?.length) {
        return (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">No categories found.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="w-16">Image</span>
                <span>Name</span>
                <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
                {categories.map((cat) => (
                    <div key={cat.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3">
                        <div className="h-12 w-16 overflow-hidden rounded-md border border-border">
                            {cat.img ? (
                                <img src={cat.img} alt={cat.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-muted/50" />
                            )}
                        </div>
                        <div className="font-medium">{cat.name}</div>
                        <div className="text-right">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDelete(cat.id)}
                                disabled={deleting === cat.id}
                            >
                                {deleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
