import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const HERO_IMG = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop';

export default function Hero() {
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] // Custom cubic-bezier for a premium, smooth acceleration curve
            }
        }
    };

    return (
        <section className="relative overflow-hidden bg-muted/20">
            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="order-2 lg:order-1"
                >
                    <motion.span 
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground shadow-sm"
                    >
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> New Collection 2024
                    </motion.span>
                    
                    <motion.h1 
                        variants={itemVariants}
                        className="mt-6 font-heading text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl text-foreground"
                    >
                        Elevate Your Style with <span className="text-primary italic">Zero Fashion</span>
                    </motion.h1>
                    
                    <motion.p 
                        variants={itemVariants}
                        className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed"
                    >
                        Discover the latest trends in premium clothing. From everyday essentials to statement pieces, find your perfect fit with our curated collection of top global designs.
                    </motion.p>
                    
                    <motion.div 
                        variants={itemVariants}
                        className="mt-8 flex flex-wrap gap-4"
                    >
                        <Button asChild size="lg" className="rounded-full px-8">
                            <Link to="/shop">
                                Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                            <Link to="/about">Our Story</Link>
                        </Button>
                    </motion.div>
                    
                    <motion.div 
                        variants={itemVariants}
                        className="mt-12 flex items-center gap-8 border-t border-border pt-8"
                    >
                        <div>
                            <p className="font-heading text-3xl font-bold text-foreground">10k+</p>
                            <p className="mt-1 text-sm text-muted-foreground font-medium uppercase tracking-wide">Happy Customers</p>
                        </div>
                        <div className="w-px h-12 bg-border"></div>
                        <div>
                            <p className="font-heading text-3xl font-bold text-foreground">Top</p>
                            <p className="mt-1 text-sm text-muted-foreground font-medium uppercase tracking-wide">Designers</p>
                        </div>
                        <div className="w-px h-12 bg-border"></div>
                        <div>
                            <p className="font-heading text-3xl font-bold text-foreground">24h</p>
                            <p className="mt-1 text-sm text-muted-foreground font-medium uppercase tracking-wide">Fast Delivery</p>
                        </div>
                    </motion.div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="relative order-1 lg:order-2"
                >
                    <div className="absolute -inset-4 rounded-3xl bg-muted/50 blur-2xl" />
                    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
                        <img 
                            src={HERO_IMG} 
                            alt="Premium fashion collection" 
                            className="h-[600px] w-full object-cover transition-transform duration-700 hover:scale-105" 
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}