import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { apiClient } from '@/api/apiClient';
import { Package, UserCircle, LogOut, Clock, Truck, CheckCircle2, XCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
    pending: { color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', icon: Clock },
    confirmed: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: CheckCircle2 },
    shipped: { color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: Truck },
    delivered: { color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle2 },
    cancelled: { color: 'text-destructive bg-destructive/10 border-destructive/20', icon: XCircle },
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        if (!user?.email) return;
        apiClient.entities.Order.filterByEmail(user.email)
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex flex-col items-center text-center pb-6 border-b border-border">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <UserCircle className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="font-heading font-bold text-lg">{user.name || 'Customer'}</h2>
                            <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                        </div>
                        <nav className="mt-6 flex flex-col gap-2">
                            <Button 
                                variant={activeTab === 'orders' ? 'secondary' : 'ghost'} 
                                className="justify-start" 
                                onClick={() => setActiveTab('orders')}
                            >
                                <Package className="mr-2 h-4 w-4" /> My Orders
                            </Button>
                            <Button 
                                variant={activeTab === 'profile' ? 'secondary' : 'ghost'} 
                                className="justify-start" 
                                onClick={() => setActiveTab('profile')}
                            >
                                <UserCircle className="mr-2 h-4 w-4" /> Account Details
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-4" 
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
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
                        <div className="space-y-6">
                            <h1 className="font-heading text-2xl font-bold">Account Details</h1>
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Name</p>
                                        <p className="font-medium">{user.name || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Account Role</p>
                                        <p className="font-medium capitalize">{user.role || 'User'}</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-border">
                                    <p className="text-sm text-muted-foreground">To change your email or password, please contact support.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
