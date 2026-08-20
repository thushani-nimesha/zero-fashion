import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PROMO_IMG_1 = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop";
const PROMO_IMG_2 = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop";

export default function PromoBanner() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-16">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="group relative overflow-hidden rounded-2xl bg-muted/30">
                    <img src={PROMO_IMG_1} alt="Summer Collection" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="relative flex h-64 flex-col justify-end p-8 sm:h-80">
                        <span className="mb-2 inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">Season Sale</span>
                        <h3 className="font-heading text-3xl font-bold text-white">Summer Collection</h3>
                        <p className="mt-2 text-white/80">Up to 40% off on all summer essentials.</p>
                        <Button asChild className="mt-6 w-fit bg-white text-black hover:bg-white/90 rounded-full px-8"><Link to="/shop">Shop Now</Link></Button>
                    </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-2xl bg-muted/30">
                    <img src={PROMO_IMG_2} alt="New Arrivals" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="relative flex h-64 flex-col justify-end p-8 sm:h-80">
                        <span className="mb-2 inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">Just In</span>
                        <h3 className="font-heading text-3xl font-bold text-white">New Arrivals</h3>
                        <p className="mt-2 text-white/80">Discover the latest trends and exclusive pieces.</p>
                        <Button asChild variant="outline" className="mt-6 w-fit text-white border-white hover:bg-white hover:text-black rounded-full px-8 bg-transparent"><Link to="/shop">Explore</Link></Button>
                    </div>
                </div>
            </div>
        </section>
    );
}