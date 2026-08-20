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
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [p, c] = await Promise.all([
                apiClient.entities.Product.list('-created_date', 100),
                apiClient.entities.Category.list()
            ]);
            setProducts(p);
            setCategories(c);
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
            </Tabs>
        </div>
    );
}