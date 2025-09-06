
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, LayoutDashboard, Boxes, QrCode, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import streetVendorImg from '@/image/Street Vendor and Modern Payment Interaction (1).png';
import inventoryimg from '@/image/inventory.png'
const onboardingSteps = [
  {
    icon: LayoutDashboard,
    title: 'Welcome to Township Trader',
    description: "Your all-in-one toolkit for managing your small business with ease. Let's get you started.",
    image: 'https://picsum.photos/800/600',
    dataAiHint: 'welcome business',
  },
  {
    icon: Boxes,
    title: 'Inventory Management',
    description: 'Easily track your products, update stock levels, and get low-stock alerts so you never run out.',
    image: 'https://picsum.photos/800/600',
    dataAiHint: 'products inventory',
  },
  {
    icon: QrCode,
    title: 'Seamless Payments',
    description: 'Generate QR codes for quick, easy, and secure digital payments from your customers.',
    image: 'https://picsum.photos/800/600',
    dataAiHint: 'qr code payment',
  },
  {
    icon: Users,
    title: 'Customer Engagement',
    description: 'Manage your customer list and send out promotional SMS messages to drive sales.',
    image: 'https://picsum.photos/800/600',
    dataAiHint: 'community people',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Remove timed redirect; will redirect on button click instead

  const progress = ((current + 1) / onboardingSteps.length) * 100;

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
       <div className="absolute top-4 right-4 z-10">
        <Button asChild variant="ghost">
          <Link href="/dashboard">Skip</Link>
        </Button>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-primary"
        >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </svg>
        <h1 className="text-3xl font-bold font-headline">Township Trader</h1>
      </div>
      
      <Carousel setApi={setApi} className="w-full max-w-sm md:max-w-xl lg:max-w-3xl">
        <CarouselContent>
          {onboardingSteps.map((step, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center p-0 text-center">
                  <div className="relative w-full h-48 md:h-64">
                    <Skeleton className="absolute inset-0 w-full h-full" />
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                      data-ai-hint={step.dataAiHint}
                      onLoad={e => e.currentTarget.previousSibling?.remove()}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6 space-y-3">
                    <step.icon className="w-10 h-10 mx-auto text-primary" />
                    <h2 className="text-2xl font-bold">{step.title}</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>

      <div className="mt-6 w-full max-w-sm md:max-w-xl lg:max-w-3xl space-y-4">
        <Progress value={progress} className="h-2" />

        {current === onboardingSteps.length - 1 ? (
          <Button className="w-full" onClick={() => router.push('/dashboard')}>
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
           <div className="flex justify-center md:hidden">
             <Button onClick={() => api?.scrollNext()} size="lg">
                Next <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
           </div>
        )}
      </div>
    </div>
  );
}
