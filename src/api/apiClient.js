import { auth, db, googleProvider, storage } from '../lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged
} from 'firebase/auth';
import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    onValue
} from 'firebase/database';

const hasFirebase = !!auth;

const snapToArray = (snapshot) => {
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([id, val]) => ({ id, ...val }));
};

const getLocal = (key, defaultVal = []) => {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultVal;
    } catch {
        return defaultVal;
    }
};

const setLocal = (key, val) => {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        console.error(e);
    }
};

const defaultCategories = [
    { id: 'cat1', name: 'T-Shirts', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800' },
    { id: 'cat2', name: 'Trousers', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800' },
    { id: 'cat3', name: 'Pants', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800' },
    { id: 'cat4', name: 'Shoes', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800' }
];

const defaultProducts = [
    {
        id: 'p1',
        name: 'Premium Cotton T-Shirt',
        brand: 'Zero Fashion',
        category: 'T-Shirts',
        price: 1200,
        old_price: 1500,
        description: 'High-quality cotton blend t-shirt designed for ultimate comfort and daily wear.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800',
        in_stock: true,
        featured: true,
        created_date: new Date().toISOString()
    },
    {
        id: 'p2',
        name: 'Slim Fit Trouser',
        brand: 'Zero Fashion',
        category: 'Trousers',
        price: 2500,
        description: 'Tailored slim-fit trousers perfect for both casual and semi-formal settings.',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800',
        in_stock: true,
        featured: true,
        created_date: new Date().toISOString()
    },
    {
        id: 'p3',
        name: 'Classic Cargo Pants',
        brand: 'Zero Fashion',
        category: 'Pants',
        price: 2200,
        description: 'Durable multi-pocket cargo pants built for utility and style.',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800',
        in_stock: true,
        featured: true,
        created_date: new Date().toISOString()
    },
    {
        id: 'p4',
        name: 'Leather Casual Shoes',
        brand: 'Zero Fashion',
        category: 'Shoes',
        price: 3500,
        old_price: 4000,
        description: 'Handcrafted genuine leather casual shoes featuring a cushioned sole.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800',
        in_stock: true,
        featured: true,
        created_date: new Date().toISOString()
    }
];

if (!localStorage.getItem('zf_categories')) {
    setLocal('zf_categories', defaultCategories);
}
if (!localStorage.getItem('zf_products')) {
    setLocal('zf_products', defaultProducts);
}

const orderListeners = new Set();
const notifyOrderListeners = () => {
    orderListeners.forEach(cb => {
        try {
            cb({ type: 'update' });
        } catch (e) {
            console.error(e);
        }
    });
};

export const apiClient = {
    auth: {
        loginViaEmailPassword: async (email, password) => {
            if (hasFirebase) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                return userCredential.user;
            }
            const users = getLocal('zf_users', []);
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) throw new Error('Invalid email or password');
            sessionStorage.setItem('zf_current_user_id', user.id);
            return user;
        },
        loginWithProvider: async (provider, redirectUrl) => {
            if (hasFirebase) {
                await signInWithPopup(auth, googleProvider);
                if (redirectUrl) window.location.href = redirectUrl;
                return;
            }
            const mockUser = {
                id: 'google_user_' + Date.now(),
                email: 'googleuser@example.com',
                name: 'Google User',
                phone: '',
                address: '',
                role: 'user',
                provider: 'google',
                phoneVerified: true
            };
            const users = getLocal('zf_users', []);
            let existingUser = users.find(u => u.email === mockUser.email);
            if (!existingUser) {
                users.push(mockUser);
                setLocal('zf_users', users);
                existingUser = mockUser;
            }
            sessionStorage.setItem('zf_current_user_id', existingUser.id);
            if (redirectUrl) window.location.href = redirectUrl;
        },
        register: async ({ email, password, name, phone, address, photo_url }) => {
            if (hasFirebase) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const userProfile = {
                    id: user.uid,
                    email,
                    name,
                    phone,
                    address: address || '',
                    photo_url: photo_url || '',
                    role: email === import.meta.env.VITE_ADMIN_EMAIL ? 'admin' : 'user',
                    phoneVerified: false
                };
                await set(ref(db, `users/${user.uid}`), userProfile);
                return user;
            }
            const users = getLocal('zf_users', []);
            if (users.some(u => u.email === email)) {
                throw new Error('Email is already registered');
            }
            const newUser = {
                id: 'local_user_' + Date.now(),
                email,
                password,
                name,
                phone,
                address: address || '',
                photo_url: photo_url || '',
                role: (email === import.meta.env.VITE_ADMIN_EMAIL || email.includes('admin')) ? 'admin' : 'user',
                phoneVerified: false
            };
            users.push(newUser);
            setLocal('zf_users', users);
            sessionStorage.setItem('zf_pending_user_id', newUser.id);
            return newUser;
        },
        verifyOtp: async ({ email, otpCode }) => {
            if (hasFirebase) {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    await update(ref(db, `users/${currentUser.uid}`), { phoneVerified: true });
                }
                return { access_token: 'mock_firebase_token' };
            }
            const pendingId = sessionStorage.getItem('zf_pending_user_id');
            if (pendingId) {
                const users = getLocal('zf_users', []);
                const userIdx = users.findIndex(u => u.id === pendingId);
                if (userIdx !== -1) {
                    users[userIdx].phoneVerified = true;
                    setLocal('zf_users', users);
                    sessionStorage.setItem('zf_current_user_id', pendingId);
                    sessionStorage.removeItem('zf_pending_user_id');
                }
            }
            return { access_token: 'mock_local_token' };
        },
        resendOtp: async (email) => {
            return true;
        },
        setToken: (token) => {},
        resetPasswordRequest: async (email) => {
            if (hasFirebase) {
                await sendPasswordResetEmail(auth, email);
                return true;
            }
            return true;
        },
        resetPassword: async ({ resetToken, newPassword }) => {
            return true;
        },
        me: () => {
            if (hasFirebase) {
                return new Promise((resolve, reject) => {
                    const unsubscribe = onAuthStateChanged(auth, async (user) => {
                        unsubscribe();
                        if (user) {
                            try {
                                const userSnap = await get(ref(db, `users/${user.uid}`));
                                const provider = user.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password';
                                if (userSnap.exists()) {
                                    resolve({ email: user.email, ...userSnap.val(), provider });
                                } else {
                                    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
                                    const isAdmin = user.email === adminEmail;
                                    resolve({
                                        id: user.uid,
                                        email: user.email,
                                        name: user.displayName || 'User',
                                        role: isAdmin ? 'admin' : 'user',
                                        provider,
                                        phoneVerified: false
                                    });
                                }
                            } catch {
                                const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
                                const isAdmin = user.email === adminEmail;
                                const provider = user.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password';
                                resolve({
                                    id: user.uid,
                                    email: user.email,
                                    name: user.displayName || 'User',
                                    role: isAdmin ? 'admin' : 'user',
                                    provider,
                                    phoneVerified: false
                                });
                            }
                        } else {
                            reject(new Error('Not authenticated'));
                        }
                    });
                });
            }
            return new Promise((resolve, reject) => {
                const currentUserId = sessionStorage.getItem('zf_current_user_id');
                if (currentUserId) {
                    const users = getLocal('zf_users', []);
                    const user = users.find(u => u.id === currentUserId);
                    if (user) {
                        resolve(user);
                    } else {
                        reject(new Error('Not authenticated'));
                    }
                } else {
                    reject(new Error('Not authenticated'));
                }
            });
        },
        logout: async (redirectUrl) => {
            if (hasFirebase) {
                await signOut(auth);
            } else {
                sessionStorage.removeItem('zf_current_user_id');
            }
            if (redirectUrl) window.location.href = redirectUrl;
        },
        redirectToLogin: (redirectUrl) => {
            window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
        },
        updateProfile: async (profileData) => {
            if (hasFirebase) {
                const currentUser = auth.currentUser;
                if (!currentUser) throw new Error("Not authenticated");
                const userSnap = await get(ref(db, `users/${currentUser.uid}`));
                const existing = userSnap.exists() ? userSnap.val() : {};
                const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
                const isAdmin = currentUser.email === adminEmail;
                const merged = {
                    id: currentUser.uid,
                    email: currentUser.email || existing.email || '',
                    name: existing.name || currentUser.displayName || 'User',
                    role: existing.role || (isAdmin ? 'admin' : 'user'),
                    ...existing,
                    ...profileData
                };
                await set(ref(db, `users/${currentUser.uid}`), merged);
                return merged;
            }
            const currentUserId = sessionStorage.getItem('zf_current_user_id');
            if (currentUserId) {
                const users = getLocal('zf_users', []);
                const userIdx = users.findIndex(u => u.id === currentUserId);
                if (userIdx !== -1) {
                    users[userIdx] = { ...users[userIdx], ...profileData };
                    setLocal('zf_users', users);
                    return users[userIdx];
                }
            }
            throw new Error("User not found");
        },
        changePassword: async (newPassword) => {
            if (hasFirebase) {
                const currentUser = auth.currentUser;
                if (!currentUser) throw new Error("Not authenticated");
                const { updatePassword } = await import('firebase/auth');
                await updatePassword(currentUser, newPassword);
                return true;
            }
            const currentUserId = sessionStorage.getItem('zf_current_user_id');
            if (currentUserId) {
                const users = getLocal('zf_users', []);
                const userIdx = users.findIndex(u => u.id === currentUserId);
                if (userIdx !== -1) {
                    users[userIdx].password = newPassword;
                    setLocal('zf_users', users);
                    return true;
                }
            }
            return false;
        }
    },
    entities: {
        Category: {
            list: async () => {
                if (hasFirebase) {
                    const snapshot = await get(ref(db, 'categories'));
                    let arr = snapToArray(snapshot);
                    if (arr.length === 0) {
                        const promises = defaultCategories.map(async (c) => {
                            const newRef = push(ref(db, 'categories'));
                            const payload = { name: c.name, img: c.img, created_date: new Date().toISOString() };
                            await set(newRef, payload);
                        });
                        await Promise.all(promises);
                        const freshSnapshot = await get(ref(db, 'categories'));
                        arr = snapToArray(freshSnapshot);
                    }
                    return arr.sort((a, b) =>
                        (a.created_date || '').localeCompare(b.created_date || '')
                    );
                }
                return getLocal('zf_categories').sort((a, b) =>
                    (a.created_date || '').localeCompare(b.created_date || '')
                );
            },
            create: async (data) => {
                const payload = { ...data, created_date: new Date().toISOString() };
                if (hasFirebase) {
                    const newRef = push(ref(db, 'categories'));
                    await set(newRef, payload);
                    return { id: newRef.key, ...payload };
                }
                const categories = getLocal('zf_categories');
                const newCategory = { id: 'cat_' + Date.now(), ...payload };
                categories.push(newCategory);
                setLocal('zf_categories', categories);
                return newCategory;
            },
            delete: async (id) => {
                if (hasFirebase) {
                    await remove(ref(db, `categories/${id}`));
                    return true;
                }
                const categories = getLocal('zf_categories');
                const filtered = categories.filter(c => c.id !== id);
                setLocal('zf_categories', filtered);
                return true;
            }
        },
        Product: {
            list: async (sortStr = '-created_date', limitNum = 100) => {
                if (hasFirebase) {
                    const snapshot = await get(ref(db, 'products'));
                    let arr = snapToArray(snapshot);
                    if (arr.length === 0) {
                        const promises = defaultProducts.map(async (p) => {
                            const newRef = push(ref(db, 'products'));
                            const payload = {
                                name: p.name,
                                brand: p.brand,
                                category: p.category,
                                price: p.price,
                                old_price: p.old_price || null,
                                description: p.description,
                                image: p.image,
                                in_stock: p.in_stock,
                                featured: p.featured,
                                created_date: new Date().toISOString()
                            };
                            await set(newRef, payload);
                        });
                        await Promise.all(promises);
                        const freshSnapshot = await get(ref(db, 'products'));
                        arr = snapToArray(freshSnapshot);
                    }
                    return arr.sort((a, b) =>
                        (b.created_date || '').localeCompare(a.created_date || '')
                    ).slice(0, limitNum);
                }
                const products = getLocal('zf_products');
                return products.sort((a, b) =>
                    (b.created_date || '').localeCompare(a.created_date || '')
                ).slice(0, limitNum);
            },
            get: async (id) => {
                if (hasFirebase) {
                    const snapshot = await get(ref(db, `products/${id}`));
                    if (!snapshot.exists()) throw new Error('Not found');
                    return { id, ...snapshot.val() };
                }
                const products = getLocal('zf_products');
                const product = products.find(p => p.id === id);
                if (!product) throw new Error('Not found');
                return product;
            },
            filter: async (queryObj, sortStr, limitNum = 100) => {
                if (hasFirebase) {
                    const snapshot = await get(ref(db, 'products'));
                    const arr = snapToArray(snapshot);
                    return arr
                        .filter(p => p.category === queryObj.category)
                        .slice(0, limitNum);
                }
                const products = getLocal('zf_products');
                return products
                    .filter(p => p.category === queryObj.category)
                    .slice(0, limitNum);
            },
            create: async (data) => {
                const payload = { ...data, created_date: new Date().toISOString() };
                if (hasFirebase) {
                    const newRef = push(ref(db, 'products'));
                    await set(newRef, payload);
                    return { id: newRef.key, ...payload };
                }
                const products = getLocal('zf_products');
                const newProduct = { id: 'prod_' + Date.now(), ...payload };
                products.push(newProduct);
                setLocal('zf_products', products);
                return newProduct;
            },
            update: async (id, data) => {
                if (hasFirebase) {
                    await update(ref(db, `products/${id}`), data);
                    return { id, ...data };
                }
                const products = getLocal('zf_products');
                const idx = products.findIndex(p => p.id === id);
                if (idx !== -1) {
                    products[idx] = { ...products[idx], ...data };
                    setLocal('zf_products', products);
                }
                return { id, ...data };
            },
            delete: async (id) => {
                if (hasFirebase) {
                    await remove(ref(db, `products/${id}`));
                    return true;
                }
                const products = getLocal('zf_products');
                const filtered = products.filter(p => p.id !== id);
                setLocal('zf_products', filtered);
                return true;
            }
        },
        Order: {
            list: async (sortStr, limitNum = 200) => {
                if (hasFirebase) {
                    const snapshot = await get(ref(db, 'orders'));
                    const arr = snapToArray(snapshot);
                    return arr.sort((a, b) =>
                        (b.created_date || '').localeCompare(a.created_date || '')
                    ).slice(0, limitNum);
                }
                const orders = getLocal('zf_orders');
                return orders.sort((a, b) =>
                    (b.created_date || '').localeCompare(a.created_date || '')
                ).slice(0, limitNum);
            },
            filterByEmail: async (email) => {
                if (hasFirebase) {
                    const snapshot = await get(ref(db, 'orders'));
                    const arr = snapToArray(snapshot);
                    return arr
                        .filter(o => o.customer_email === email)
                        .sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''));
                }
                const orders = getLocal('zf_orders');
                return orders
                    .filter(o => o.customer_email === email)
                    .sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''));
            },
            create: async (data) => {
                const payload = {
                    ...data,
                    status: 'pending',
                    created_date: new Date().toISOString()
                };
                if (hasFirebase) {
                    const newRef = push(ref(db, 'orders'));
                    await set(newRef, payload);
                    return { id: newRef.key, ...payload };
                }
                const orders = getLocal('zf_orders');
                const newOrder = { id: 'ord_' + Date.now(), ...payload };
                orders.push(newOrder);
                setLocal('zf_orders', orders);
                notifyOrderListeners();
                return newOrder;
            },
            update: async (id, data) => {
                if (hasFirebase) {
                    await update(ref(db, `orders/${id}`), data);
                    return { id, ...data };
                }
                const orders = getLocal('zf_orders');
                const idx = orders.findIndex(o => o.id === id);
                if (idx !== -1) {
                    orders[idx] = { ...orders[idx], ...data };
                    setLocal('zf_orders', orders);
                    notifyOrderListeners();
                }
                return { id, ...data };
            },
            bulkUpdate: async (dataArr) => {
                if (hasFirebase) {
                    const promises = dataArr.map(d => update(ref(db, `orders/${d.id}`), d));
                    await Promise.all(promises);
                    return true;
                }
                const orders = getLocal('zf_orders');
                dataArr.forEach(d => {
                    const idx = orders.findIndex(o => o.id === d.id);
                    if (idx !== -1) {
                        orders[idx] = { ...orders[idx], ...d };
                    }
                });
                setLocal('zf_orders', orders);
                notifyOrderListeners();
                return true;
            },
            subscribe: (callback) => {
                if (hasFirebase) {
                    const ordersRef = ref(db, 'orders');
                    const unsubscribe = onValue(ordersRef, (snapshot) => {
                        callback({ type: 'update' });
                    });
                    return unsubscribe;
                }
                orderListeners.add(callback);
                return () => {
                    orderListeners.delete(callback);
                };
            }
        }
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                if (!file) throw new Error("No file provided");
                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                if (cloudName && uploadPreset) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', uploadPreset);
                    const res = await fetch(
                        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                        { method: 'POST', body: formData }
                    );
                    const data = await res.json();
                    if (data.secure_url) {
                        return { file_url: data.secure_url };
                    } else {
                        throw new Error(data.error?.message || "Upload failed");
                    }
                }
                if (hasFirebase && storage) {
                    const fileRef = storageRef(storage, `products/${Date.now()}_${file.name}`);
                    const snapshot = await uploadBytes(fileRef, file);
                    const file_url = await getDownloadURL(snapshot.ref);
                    return { file_url };
                }
                return { file_url: URL.createObjectURL(file) };
            }
        }
    }
};
