import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Mail, MapPin, Phone, Truck } from 'lucide-react';


export default function Footer() {
    return (
        <footer className="border-t border-border bg-card/40">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <Link to="/" className="inline-block mb-4">
                        <img src="/zero-fashion-style.png" alt="Zero Fashion" className="h-8 object-contain" />
                    </Link>
                    <p className="mt-3 text-sm text-muted-foreground">Not Just Clothes. Bangladesh's leading fashion & clothing eShop — your home of premium wear.</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Truck className="h-4 w-4 text-primary" /> Free shipping in Dhaka over ৳2,500</div>
                </div>

                <div>
                    <h4 className="font-heading font-semibold">Shop</h4>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li><Link to="/shop" className="hover:text-primary">All Products</Link></li>
                        <li><Link to="/shop?category=T-Shirts" className="hover:text-primary">T-Shirts</Link></li>
                        <li><Link to="/shop?category=Trousers" className="hover:text-primary">Trousers</Link></li>
                        <li><Link to="/shop?category=Pants" className="hover:text-primary">Pants</Link></li>
                        <li><Link to="/shop?category=Accessories" className="hover:text-primary">Accessories</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-heading font-semibold">Info</h4>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li><Link to="/about" className="hover:text-primary">Our Story</Link></li>
                        <li><span className="cursor-default">Sustainability</span></li>
                        <li><span className="cursor-default">Store Locator</span></li>
                        <li><span className="cursor-default">Shipping & Returns</span></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-heading font-semibold">Contact</h4>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Dhaka, Bangladesh</li>
                        <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +880 1XXX-XXXXXX</li>
                        <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@zerofashion.com.bd</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Zero Fashion Ltd. All rights reserved.
            </div>
        </footer>
    );
}