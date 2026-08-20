import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, FolderPlus, Upload, X } from 'lucide-react';

export default function CategoryForm({ onCreated }) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', img: '' });
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const { file_url } = await apiClient.integrations.Core.UploadFile({ file });
            setFormData(prev => ({ ...prev, img: file_url }));
            toast({ title: 'Image uploaded successfully' });
        } catch (error) {
            toast({ title: 'Upload failed', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiClient.entities.Category.create(formData);
            toast({ title: 'Category created' });
            setFormData({ name: '', img: '' });
            if (onCreated) onCreated();
        } catch (error) {
            toast({ title: 'Failed to create category', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                <FolderPlus className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-bold">Add New Category</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input 
                        value={formData.name} 
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
                        placeholder="e.g. Winter Collection" 
                        required 
                    />
                </div>

                <div className="space-y-2">
                    <Label>Cover Image</Label>
                    {formData.img ? (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                            <img src={formData.img} alt="Preview" className="h-full w-full object-cover" />
                            <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="absolute right-2 top-2 h-6 w-6 rounded-full" 
                                onClick={() => setFormData(p => ({ ...p, img: '' }))}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full items-center justify-center">
                            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50">
                                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                    {uploading ? <Loader2 className="mb-2 h-6 w-6 animate-spin text-muted-foreground" /> : <Upload className="mb-2 h-6 w-6 text-muted-foreground" />}
                                    <p className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Upload Image'}</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                            </label>
                        </div>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={saving || uploading || !formData.img}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Category
                </Button>
            </form>
        </div>
    );
}
