import React from 'react';
import Hero from '@/components/Hero';
import BrandStrip from '@/components/BrandStrip';
import CategoryGrid from '@/components/CategoryGrid';
import FeaturedProducts from '@/components/FeaturedProducts';
import PromoBanner from '@/components/PromoBanner';

export default function Home() {
    return (
        <>
            <Hero />
            <BrandStrip />
            <CategoryGrid />
            <FeaturedProducts />
            <PromoBanner />
        </>
    );
}