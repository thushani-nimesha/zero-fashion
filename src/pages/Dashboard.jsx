import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { apiClient } from '@/api/apiClient';
import { Package, UserCircle, LogOut, Clock, Truck, CheckCircle2, XCircle, LayoutDashboard, Camera, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const statusConfig = {
    pending: { color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', icon: Clock },
    confirmed: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: CheckCircle2 },
    shipped: { color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: Truck },
    delivered: { color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle2 },
    cancelled: { color: 'text-destructive bg-destructive/10 border-destructive/20', icon: XCircle },
};

export default function Dashboard() {
    const { user, logout, updateCurrentUser } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editPhotoUrl, setEditPhotoUrl] = useState(user?.photo_url || '');
    const [editPhone, setEditPhone] = useState(user?.phone || '');
    const [editAddress, setEditAddress] = useState(user?.address || '');
    const [uploading, setUploading] = useState(false);

    const [passwordStep, setPasswordStep] = useState('idle'); // idle, verif, input
    const [verificationCode, setVerificationCode] = useState('');
    const [sentCode, setSentCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [phoneStep, setPhoneStep] = useState('idle'); // idle, verif, verified
    const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
    const [phoneSentCode, setPhoneSentCode] = useState('');

    // Update form states when user changes
    useEffect(() => {
        if (user) {
            setEditName(user.name || '');
            setEditPhotoUrl(user.photo_url || '');
            setEditPhone(user.phone || '');
            setEditAddress(user.address || '');
        }
    }, [user]);

    useEffect(() => {
        if (!user?.email) {
            setLoading(false);
            return;
        }
        
        const fetchDashboardData = () => {
            apiClient.entities.Order.filterByEmail(user.email)
                .then(res => {
                    setOrders(res.filter(o => o.status !== 'removed' && o.status !== 'dismissed'));
                    setNotifications(res.filter(o => o.status === 'removed'));
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        };
        
        fetchDashboardData();
        const unsubscribe = apiClient.entities.Order.subscribe(fetchDashboardData);
        return unsubscribe;
    }, [user]);

    const dismissNotification = async (id) => {
        try {
            await apiClient.entities.Order.update(id, { status: 'dismissed' });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const canCancel = (orderDate) => {
        if (!orderDate) return false;
        const created = new Date(orderDate).getTime();
        const now = Date.now();
        const diffMs = now - created;
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours < 5;
    };

    const handleCancelOrder = async (id) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            await apiClient.entities.Order.update(id, { status: 'cancelled' });
            toast({ title: 'Order cancelled successfully' });
        } catch {
            toast({ title: 'Failed to cancel order', variant: 'destructive' });
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleSaveProfile = async () => {
        if (editPhone !== user.phone && phoneStep !== 'verified') {
            toast({ title: 'Please verify your mobile number change first', variant: 'destructive' });
            return;
        }
        try {
            await updateCurrentUser({ 
                name: editName, 
                photo_url: editPhotoUrl, 
                phone: editPhone, 
                address: editAddress 
            });
            setIsEditingProfile(false);
            setPhoneStep('idle');
            toast({ title: 'Profile updated successfully' });
        } catch {
            toast({ title: 'Failed to update profile', variant: 'destructive' });
        }
    };

    const handleSendPhoneCode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setPhoneSentCode(code);
        setPhoneStep('verif');
        toast({ 
            title: 'Phone Verification Code Sent!', 
            description: `We've sent a 6-digit code to ${user.email}. (Code: ${code})`,
            duration: 10000
        });
    };

    const handleVerifyPhoneCode = () => {
        if (phoneVerificationCode === phoneSentCode) {
            setPhoneStep('verified');
            toast({ title: 'Phone number verified! You can now save changes.' });
        } else {
            toast({ title: 'Invalid verification code', variant: 'destructive' });
        }
    };

    const handleSendCode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setSentCode(code);
        setPasswordStep('verif');
        toast({ 
            title: 'Verification Code Sent!', 
            description: `We've sent a 6-digit verification code to ${user.email}. (Code: ${code})`,
            duration: 10000
        });
    };

    const handleVerifyCode = () => {
        if (verificationCode === sentCode) {
            setPasswordStep('input');
            toast({ title: 'Code verified successfully! Enter your new password.' });
        } else {
            toast({ title: 'Invalid verification code', variant: 'destructive' });
        }
    };

    const handleSavePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({ title: 'Passwords do not match', variant: 'destructive' });
            return;
        }
        try {
            await apiClient.auth.changePassword(newPassword);
            setPasswordStep('idle');
            setNewPassword('');
            setConfirmPassword('');
            toast({ title: 'Password updated successfully' });
        } catch (err) {
            toast({ title: err.message || 'Failed to update password', variant: 'destructive' });
        }
    };

    if (!user) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        >
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-card/45 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] dark:shadow-[0_0_60px_-10px_rgba(255,255,255,0.04)] border border-border/60 dark:border-white/10 p-6 relative overflow-hidden before:absolute before:top-0 before:left-1/6 before:right-1/6 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent">
                        <div className="flex flex-col items-center text-center pb-6 border-b border-border">
                            <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-2xl font-bold text-primary shadow-lg shadow-primary/10 relative overflow-hidden">
                                {user.photo_url ? (
                                    <img src={user.photo_url} alt="Profile" className="h-full w-full object-cover" />
                                ) : user.name ? (
                                    user.name[0].toUpperCase()
                                ) : (
                                    <UserCircle className="h-10 w-10" />
                                )}
                            </div>
                            <h2 className="font-heading font-bold text-lg">{user.name || 'Customer'}</h2>
                            <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                        </div>
                        <nav className="mt-6 flex flex-col gap-2">
                            <button 
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between border text-sm ${
                                    activeTab === 'orders' 
                                    ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(255,255,255,0.05)] font-semibold scale-[1.02]' 
                                    : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30 hover:translate-x-1.5'
                                }`} 
                                onClick={() => setActiveTab('orders')}
                            >
                                <span className="flex items-center gap-2">
                                    <Package className="h-4 w-4" /> My Orders
                                </span>
                                {activeTab === 'orders' && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                            </button>
                            <button 
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between border text-sm ${
                                    activeTab === 'profile' 
                                    ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(255,255,255,0.05)] font-semibold scale-[1.02]' 
                                    : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30 hover:translate-x-1.5'
                                }`} 
                                onClick={() => setActiveTab('profile')}
                            >
                                <span className="flex items-center gap-2">
                                    <UserCircle className="h-4 w-4" /> Account Details
                                </span>
                                {activeTab === 'profile' && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                            </button>
                            <button 
                                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 border border-transparent text-sm text-destructive hover:bg-destructive/10 hover:translate-x-1.5 mt-4" 
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {notifications.map(n => (
                        <div key={n.id} className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                            <div>
                                <span className="font-bold">Notice (Order #{n.order_number || n.id.slice(-6)}): </span>
                                Due to a technical error, the order has been removed by the admin board. Please contact our admins for more details.
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/20 hover:text-destructive rounded-full" onClick={() => dismissNotification(n.id)}>Dismiss</Button>
                        </div>
                    ))}

                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <LayoutDashboard className="h-6 w-6 text-primary" />
                                <h1 className="font-heading text-2xl font-bold">Order History</h1>
                            </div>
                            
                            {loading ? (
                                <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground animate-pulse">
                                    Loading your orders...
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                                    <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                                    <h3 className="font-heading text-lg font-bold">No orders yet</h3>
                                    <p className="text-muted-foreground mt-2">When you place an order, it will appear here.</p>
                                    <Button onClick={() => navigate('/shop')} className="mt-6">Start Shopping</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(order => {
                                        const status = statusConfig[order.status] || statusConfig.pending;
                                        const StatusIcon = status.icon;
                                        
                                        return (
                                            <div key={order.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                                                <div className="border-b border-border bg-muted/20 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
                                                        <p className="font-bold text-foreground">#{order.order_number}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Placed on {new Date(order.created_date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex flex-col sm:items-end gap-2">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${status.color}`}>
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {order.status}
                                                        </span>
                                                        <p className="font-heading font-bold text-lg">৳{order.total?.toLocaleString()}</p>
                                                        {order.status === 'pending' && canCancel(order.created_date) && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full h-8 px-4 text-xs mt-1"
                                                                onClick={() => handleCancelOrder(order.id)}
                                                            >
                                                                Cancel Order
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-4 sm:p-6 bg-card">
                                                    <h4 className="text-sm font-semibold mb-3">Items in this order:</h4>
                                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                        {order.items?.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-3">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                                                                    {item.qty}x
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="truncate text-sm font-medium">{item.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-6 text-left">
                            <div className="flex items-center justify-between">
                                <h1 className="font-heading text-2xl font-bold">Account Details</h1>
                                {!isEditingProfile && (
                                    <Button onClick={() => setIsEditingProfile(true)} variant="outline" size="sm" className="rounded-full">
                                        Edit Details
                                    </Button>
                                )}
                            </div>

                            <div className="bg-card/45 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] dark:shadow-[0_0_60px_-10px_rgba(255,255,255,0.04)] border border-border/60 dark:border-white/10 p-8 relative overflow-hidden before:absolute before:top-0 before:left-1/6 before:right-1/6 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent">
                                {isEditingProfile ? (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-name">Full Name</Label>
                                            <Input 
                                                id="edit-name"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                placeholder="Enter full name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Profile Photo</Label>
                                            <div className="flex items-center gap-4 p-3 border border-border bg-background/50 rounded-lg">
                                                <div className="relative h-12 w-12 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {editPhotoUrl ? (
                                                        <img src={editPhotoUrl} alt="Profile" className="h-full w-full object-cover" />
                                                    ) : uploading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                    ) : (
                                                        <Camera className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <label className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                                                        {uploading ? 'Uploading...' : editPhotoUrl ? 'Change Image' : 'Choose Profile Picture'}
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                setUploading(true);
                                                                try {
                                                                    const url = await apiClient.uploadFile(file);
                                                                    setEditPhotoUrl(url);
                                                                    toast({ title: 'Photo uploaded successfully' });
                                                                } catch (err) {
                                                                    toast({ title: 'Upload failed', description: err.message || String(err), variant: 'destructive' });
                                                                } finally {
                                                                    setUploading(false);
                                                                }
                                                            }} 
                                                            className="hidden" 
                                                            disabled={uploading}
                                                        />
                                                    </label>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG or GIF up to 5MB</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-phone">Mobile Number</Label>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Input 
                                                    id="edit-phone"
                                                    value={editPhone}
                                                    onChange={e => {
                                                        setEditPhone(e.target.value);
                                                        if (e.target.value !== user.phone) {
                                                            if (phoneStep === 'verified') setPhoneStep('idle');
                                                        }
                                                    }}
                                                    placeholder="Enter mobile number"
                                                    disabled={phoneStep === 'verified'}
                                                />
                                                {editPhone !== user.phone && (
                                                    <div className="flex gap-2">
                                                        {phoneStep === 'idle' && (
                                                            <Button type="button" onClick={handleSendPhoneCode} variant="outline" size="sm" className="w-full sm:w-auto">
                                                                Send Code
                                                            </Button>
                                                        )}
                                                        {phoneStep === 'verif' && (
                                                            <div className="flex gap-2 w-full">
                                                                <Input 
                                                                    placeholder="6-digit code"
                                                                    value={phoneVerificationCode}
                                                                    onChange={e => setPhoneVerificationCode(e.target.value)}
                                                                    className="w-28 text-center font-mono font-bold"
                                                                />
                                                                <Button type="button" onClick={handleVerifyPhoneCode} size="sm">Verify</Button>
                                                            </div>
                                                        )}
                                                        {phoneStep === 'verified' && (
                                                            <span className="text-xs text-green-500 font-semibold flex items-center gap-1">Verified</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-address">Delivery Address</Label>
                                            <Input 
                                                id="edit-address"
                                                value={editAddress}
                                                onChange={e => setEditAddress(e.target.value)}
                                                placeholder="Enter full shipping address"
                                            />
                                        </div>

                                        <div className="flex gap-2 justify-end pt-4 border-t border-border/50">
                                            <Button onClick={() => {
                                                setIsEditingProfile(false);
                                                setPhoneStep('idle');
                                            }} variant="ghost" size="sm">Cancel</Button>
                                            <Button onClick={handleSaveProfile} size="sm">Save Changes</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-5 divide-y divide-border/50">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                                            <p className="font-semibold text-foreground">{user.name || 'Not set'}</p>
                                        </div>
                                        <div className="pt-4">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                                            <p className="font-semibold text-foreground">{user.email}</p>
                                        </div>
                                        <div className="pt-4">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mobile Number</p>
                                            <p className="font-semibold text-foreground">{user.phone || 'Not set'}</p>
                                        </div>
                                        <div className="pt-4">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
                                            <p className="font-semibold text-foreground">{user.address || 'Not set'}</p>
                                        </div>
                                        <div className="pt-4">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Account Role</p>
                                            <p className="font-semibold text-foreground capitalize">{user.role || 'User'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {user.provider !== 'google' && (
                                <div className="space-y-4 mt-8">
                                    <h2 className="font-heading text-xl font-bold text-left">Security</h2>
                                    <div className="bg-card/45 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] dark:shadow-[0_0_60px_-10px_rgba(255,255,255,0.04)] border border-border/60 dark:border-white/10 p-8 relative overflow-hidden before:absolute before:top-0 before:left-1/6 before:right-1/6 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent text-left">
                                        {passwordStep === 'idle' && (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-medium text-foreground">Password</p>
                                                    <p className="text-sm text-muted-foreground">Request email verification to securely change your password.</p>
                                                </div>
                                                <Button onClick={handleSendCode} variant="outline" size="sm" className="rounded-full">
                                                    Change Password
                                                </Button>
                                            </div>
                                        )}

                                        {passwordStep === 'verif' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="font-medium text-foreground">Verify Email</p>
                                                    <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your email to continue.</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                                                    <Input 
                                                        placeholder="Enter 6-digit code"
                                                        value={verificationCode}
                                                        onChange={e => setVerificationCode(e.target.value)}
                                                        maxLength={6}
                                                        className="tracking-widest text-center font-mono font-bold"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button onClick={handleVerifyCode} size="sm">Verify Code</Button>
                                                        <Button onClick={() => setPasswordStep('idle')} variant="ghost" size="sm">Cancel</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {passwordStep === 'input' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="font-medium text-foreground">Set New Password</p>
                                                    <p className="text-sm text-muted-foreground">Enter and confirm your new account password.</p>
                                                </div>
                                                <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="new-pwd">New Password</Label>
                                                        <Input 
                                                            id="new-pwd"
                                                            type="password"
                                                            value={newPassword}
                                                            onChange={e => setNewPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="confirm-pwd">Confirm New Password</Label>
                                                        <Input 
                                                            id="confirm-pwd"
                                                            type="password"
                                                            value={confirmPassword}
                                                            onChange={e => setConfirmPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-end pt-2 max-w-xl">
                                                    <Button onClick={() => setPasswordStep('idle')} variant="ghost" size="sm">Cancel</Button>
                                                    <Button onClick={handleSavePassword} size="sm">Update Password</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </motion.div>
    );
}
