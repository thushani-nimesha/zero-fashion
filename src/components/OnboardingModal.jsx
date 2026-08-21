import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { apiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Phone, MapPin, Camera } from 'lucide-react';

export default function OnboardingModal() {
    const { user, updateCurrentUser } = useAuth();
    const { toast } = useToast();
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await apiClient.uploadFile(file);
            setPhotoUrl(url);
            toast({ title: 'Profile photo uploaded successfully!' });
        } catch (err) {
            toast({ title: 'Failed to upload photo', description: err.message || String(err), variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone || !address) {
            toast({ title: 'Please fill in all fields', variant: 'destructive' });
            return;
        }
        setSaving(true);
        try {
            await updateCurrentUser({
                phone,
                address,
                photo_url: photoUrl
            });
            toast({ title: 'Profile setup complete! Welcome to Zero Fashion.' });
        } catch (err) {
            toast({ title: 'Failed to save details', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md px-4">
            <div className="w-full max-w-md bg-card/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] dark:shadow-[0_0_60px_-10px_rgba(255,255,255,0.04)] border border-border/60 dark:border-white/10 p-8 relative overflow-hidden before:absolute before:top-0 before:left-1/6 before:right-1/6 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent text-left">
                
                <div className="text-center mb-6 flex flex-col items-center">
                    <img 
                        src="/05_ZF_Rounded_Square_Icon.png" 
                        alt="Zero Fashion Logo" 
                        className="h-16 w-16 rounded-[1.25rem] shadow-xl shadow-primary/10 object-cover mb-4 animate-[float_3.5s_infinite_ease-in-out]" 
                    />
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Complete Your Profile</h2>
                    <p className="text-sm text-muted-foreground mt-1">Please add your details to continue to Zero Fashion</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <div className="relative h-20 w-20 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Preview" className="h-full w-full object-cover" />
                            ) : uploading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : (
                                <Camera className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <label className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                            {photoUrl ? 'Change Profile Picture' : 'Upload Profile Picture (Optional)'}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handlePhotoUpload} 
                                className="hidden" 
                                disabled={uploading || saving}
                            />
                        </label>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-2">
                        <Label htmlFor="onboarding-phone">Mobile Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                            <Input
                                id="onboarding-phone"
                                type="tel"
                                placeholder="01XXXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="pl-10 h-12"
                                required
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="onboarding-address">Delivery Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                            <Input
                                id="onboarding-address"
                                type="text"
                                placeholder="Enter your full shipping address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="pl-10 h-12"
                                required
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 font-medium mt-2" disabled={saving || uploading}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving details...
                            </>
                        ) : (
                            "Continue to Store"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
