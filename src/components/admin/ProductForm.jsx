import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ImagePlus, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const defaultCategories = ['T-Shirts', 'Trousers', 'Pants', 'Accessories', 'Outerwear', 'Shoes', 'Jewelry', 'Premium'];

export default function ProductForm({ onCreated, initialData, onCancel }) {
    const { toast } = useToast();
    const [categories, setCategories] = useState(defaultCategories);
    const [form, setForm] = useState({ name: '', brand: '', category: 'T-Shirts', price: '', old_price: '', description: '', image: '', in_stock: true, featured: false });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    React.useEffect(() => {
        apiClient.entities.Category.list()
            .then(cats => {
                if (cats && cats.length > 0) {
                    const catNames = cats.map(c => c.name);
                    setCategories(catNames);
                    if (!initialData) {
                        setForm(f => ({ ...f, category: catNames[0] }));
                    }
                }
            })
            .catch(() => {});
    }, [initialData]);

    React.useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || '',
                brand: initialData.brand || '',
                category: initialData.category || 'T-Shirts',
                price: initialData.price || '',
                old_price: initialData.old_price || '',
                description: initialData.description || '',
                image: initialData.image || '',
                in_stock: initialData.in_stock !== false,
                featured: initialData.featured || false,
            });
        } else {
            setForm({ name: '', brand: '', category: categories[0] || 'T-Shirts', price: '', old_price: '', description: '', image: '', in_stock: true, featured: false });
        }
    }, [initialData, categories]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { file_url } = await apiClient.integrations.Core.UploadFile({ file });
            set('image', file_url);
        } catch {
            toast({ title: 'Image upload failed', variant: 'destructive' });
        } finally { setUploading(false); }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.brand || !form.price || !form.image) {
            toast({ title: 'Please fill name, brand, price and image', variant: 'destructive' });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name, brand: form.brand, category: form.category,
                price: Number(form.price),
                old_price: form.old_price ? Number(form.old_price) : undefined,
                description: form.description, image: form.image,
                in_stock: form.in_stock, featured: form.featured,
            };
            
            if (initialData?.id) {
                await apiClient.entities.Product.update(initialData.id, payload);
                toast({ title: 'Product updated successfully' });
            } else {
                await apiClient.entities.Product.create(payload);
                toast({ title: 'Product added successfully' });
            }
            
            setForm({ name: '', brand: '', category: categories[0] || 'T-Shirts', price: '', old_price: '', description: '', image: '', in_stock: true, featured: false });
            onCreated?.();
        } catch {
            toast({ title: initialData?.id ? 'Failed to update product' : 'Failed to add product', variant: 'destructive' });
        } finally { setSaving(false); }
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-5 relative">
            {initialData && (
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-4 top-4 text-muted-foreground"
                    onClick={onCancel}
                >
                    Cancel Edit
                </Button>
            )}
            <h2 className="font-heading text-lg font-bold">
                {initialData ? 'Edit Product' : 'Add New Product'}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Product name" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Zara" />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => set('category', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="price">Price (৳)</Label>
                    <Input id="price" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="8000" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="old_price">Old Price (optional)</Label>
                    <Input id="old_price" type="number" value={form.old_price} onChange={e => set('old_price', e.target.value)} placeholder="9000" />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Short product description" />
            </div>

            <div className="space-y-1.5">
                <Label>Product Image</Label>
                <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-primary">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                        {uploading ? 'Uploading…' : 'Upload image'}
                        <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
                    </label>
                    {form.image ? <img src={form.image} alt="preview" className="h-16 w-16 rounded-md border border-border object-cover" /> : null}
                </div>
            </div>

            <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2">
                    <Switch checked={form.in_stock} onCheckedChange={v => set('in_stock', v)} />
                    <span className="text-sm">In Stock</span>
                </label>
                <label className="flex items-center gap-2">
                    <Switch checked={form.featured} onCheckedChange={v => set('featured', v)} />
                    <span className="text-sm">Featured</span>
                </label>
            </div>

            <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {saving ? 'Saving…' : 'Add Product'}
            </Button>
        </form>
    );
}