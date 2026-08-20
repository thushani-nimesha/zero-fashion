import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, Award, Truck, Users } from 'lucide-react';

const features = [
    { icon: Target, t: 'Our Mission', d: 'Make premium clothing accessible to everyone in Bangladesh.' },
    { icon: Award, t: 'Official Retailer', d: 'Partner of Zara, H&M, Nike, Adidas, Puma, and more.' },
    { icon: Truck, t: 'Fast Delivery', d: 'Free shipping within Dhaka on orders over ৳2,500.' },
    { icon: Users, t: 'Community First', d: 'Serving thousands of happy fashion enthusiasts since 2021.' },
];

export default function About() {
    return (
        <div>
            <section className="relative overflow-hidden border-b border-border">
                <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,hsl(var(--primary)/0.2),transparent)]" />
                <div className="relative mx-auto max-w-3xl px-4 py-16 text-center">
                    <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">About Zero Fashion</h1>
                    <p className="mt-3 text-muted-foreground">Not Just Clothes — Bangladesh's destination for premium fashion.</p>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-4 py-12">
                <div className="space-y-4 text-muted-foreground">
                    <p>Founded in 2021, Zero Fashion specializes in the retail and wholesale distribution of high-quality clothing and fashion wear. We are the official retailer of leading brands including Zara, H&M, Nike, Adidas, Puma, and Levis.</p>
                    <p>From premium t-shirts and trousers to pants and modern accessories, we bring authentic, stylish products to fashion lovers across Bangladesh — with free shipping within Dhaka.</p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-12">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map(f => (
                        <div key={f.t} className="rounded-xl border border-border bg-card p-5">
                            <f.icon className="h-8 w-8 text-primary" />
                            <h3 className="mt-3 font-heading font-semibold">{f.t}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-16 text-center">
                <Button asChild size="lg"><Link to="/shop">Explore Products</Link></Button>
            </section>
        </div>
    );
}