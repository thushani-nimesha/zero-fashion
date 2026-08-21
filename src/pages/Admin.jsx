import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import ProductForm from '@/components/admin/ProductForm';
import ProductTable from '@/components/admin/ProductTable';
import CategoryForm from '@/components/admin/CategoryForm';
import CategoryTable from '@/components/admin/CategoryTable';
import Orders from '@/pages/Orders';
import { Loader2, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Admin() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleToggleBanUser = async (userToUpdate) => {
        const newBanState = !userToUpdate.banned;
        try {
            await apiClient.entities.User.update(userToUpdate.id, { banned: newBanState });
            setUsers(prev => prev.map(u => u.id === userToUpdate.id ? { ...u, banned: newBanState } : u));
        } catch (e) {
            console.error(e);
            alert("Failed to update user status.");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await apiClient.entities.User.delete(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (e) {
            console.error(e);
            alert("Failed to delete user.");
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [p, c, u] = await Promise.all([
                apiClient.entities.Product.list('-created_date', 100),
                apiClient.entities.Category.list(),
                apiClient.entities.User.list()
            ]);
            setProducts(p);
            setCategories(c);
            setUsers(u);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage your orders, catalog, and categories all in one place.</p>
                </div>
                <Button 
                    variant="outline" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 sm:self-start rounded-full px-6" 
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>

            <Tabs defaultValue="orders" className="mt-8">
                <TabsList className="mb-6 inline-flex w-full justify-start overflow-x-auto border-b border-border bg-transparent p-0 rounded-none">
                    <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6">Orders</TabsTrigger>
                    <TabsTrigger value="products" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6">Products</TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6">Categories</TabsTrigger>
                    <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6">Users</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="mt-0 outline-none">
                    <div className="-mx-4 -my-8 sm:mx-0 sm:my-0">
                        <Orders isEmbedded={true} />
                    </div>
                </TabsContent>

                <TabsContent value="products" className="mt-0 outline-none">
                    <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">
                        <ProductForm 
                            onCreated={() => {
                                setEditingProduct(null);
                                loadData();
                            }} 
                            initialData={editingProduct}
                            onCancel={() => setEditingProduct(null)}
                        />
                        <div>
                            {loading ? (
                                <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                            ) : (
                                <ProductTable 
                                    products={products} 
                                    onChange={loadData} 
                                    onEdit={setEditingProduct}
                                    editingId={editingProduct?.id}
                                />
                            )}
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="categories" className="mt-0 outline-none">
                    <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">
                        <CategoryForm onCreated={loadData} />
                        <div>
                            {loading ? (
                                <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                            ) : (
                                <CategoryTable categories={categories} onChange={loadData} />
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="users" className="mt-0 outline-none">
                    <div className="mx-auto max-w-5xl bg-card/45 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] dark:shadow-[0_0_60px_-10px_rgba(255,255,255,0.04)] border border-border/60 dark:border-white/10 p-8 relative overflow-hidden before:absolute before:top-0 before:left-1/6 before:right-1/6 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent text-left">
                        <h2 className="font-heading text-xl font-bold mb-4">Manage Users</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-border/50 text-muted-foreground uppercase text-xs tracking-wider">
                                        <th className="py-3 px-4 font-semibold">User</th>
                                        <th className="py-3 px-4 font-semibold">Role</th>
                                        <th className="py-3 px-4 font-semibold">Status</th>
                                        <th className="py-3 px-4 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                                            <td className="py-4 px-4 flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden font-bold text-foreground">
                                                    {u.photo_url ? (
                                                        <img src={u.photo_url} alt={u.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        (u.name || 'U')[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{u.name || 'Not set'}</p>
                                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                    u.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'
                                                }`}>
                                                    {u.role || 'User'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                    u.banned ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                }`}>
                                                    {u.banned ? 'Banned' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right align-middle">
                                                <div className="flex gap-2 justify-end">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className={`rounded-full px-4 h-8 ${u.banned ? 'text-green-500 hover:text-green-500 hover:bg-green-500/10 border-green-500/20' : 'text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'}`}
                                                        onClick={() => handleToggleBanUser(u)}
                                                    >
                                                        {u.banned ? 'Restore' : 'Ban'}
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm" 
                                                        className="rounded-full px-4 h-8"
                                                        onClick={() => handleDeleteUser(u.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}