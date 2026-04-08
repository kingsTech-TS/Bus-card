"use client";
import { useAuthStore } from "@/store/auth.store";
import { useCards } from "@/hooks/useCards";
import { useAdminStats } from "@/hooks/useAdmin";
import { CreditCard, Eye, Download, Users, PlusCircle, LayoutTemplate, Palette, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: cards, isLoading: cardsLoading } = useCards();
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  const totalViews = cards?.reduce((acc, card) => acc + (card.views || 0), 0) || 0;
  const totalDownloads = cards?.reduce((acc, card) => acc + (card.downloads || 0), 0) || 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER HERO SECTION */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between bg-card rounded-[2rem] p-8 md:p-12 shadow-soft relative overflow-hidden">
        {/* Soft background shape */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="flex-1 z-10 w-full md:pr-8 mt-8 md:mt-0">
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
             Hi, {user?.full_name || user?.email?.split('@')[0] || 'there'}!
           </h1>
           <p className="text-muted-foreground text-lg mb-8">What are we doing today?</p>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 max-w-md">
              <Link href="/cards" className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">✓</span>
                Manage Cards
              </Link>
              <Link href="/templates" className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600 group-hover:scale-110 transition-transform">✓</span>
                Create Templates
              </Link>
              <Link href="/brand-kit" className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-red-100 text-red-600 group-hover:scale-110 transition-transform">✓</span>
                Manage Brand Kits
              </Link>
              <Link href="/assets" className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">✓</span>
                Upload Assets
              </Link>
           </div>
        </div>

        <div className="relative w-64 h-64 md:w-80 md:h-80 z-10 shrink-0">
           <Image 
             src="/meditating-bear.png" 
             alt="Meditating Bear" 
             fill 
             className="object-contain drop-shadow-sm"
             priority
           />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* STATS SECTION */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-card rounded-3xl p-6 shadow-soft flex flex-col justify-between">
             <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                <CreditCard className="w-5 h-5 text-red-600" />
             </div>
             <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Cards Created</p>
                <h3 className="text-3xl font-bold">{cardsLoading ? "-" : cards?.length || 0}</h3>
             </div>
          </div>
          
          <div className="bg-card rounded-3xl p-6 shadow-soft flex flex-col justify-between">
             <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                <Eye className="w-5 h-5 text-blue-600" />
             </div>
             <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Card Views</p>
                <h3 className="text-3xl font-bold">{cardsLoading ? "-" : totalViews}</h3>
             </div>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-soft flex flex-col justify-between">
             <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                <Download className="w-5 h-5 text-green-600" />
             </div>
             <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Downloads</p>
                <h3 className="text-3xl font-bold">{cardsLoading ? "-" : totalDownloads}</h3>
             </div>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-soft flex flex-col justify-between">
             <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                <LayoutTemplate className="w-5 h-5 text-yellow-600" />
             </div>
             <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Global Templates</p>
                <h3 className="text-3xl font-bold">12</h3>
             </div>
          </div>
          
          {user?.role === "admin" && stats && (
            <div className="col-span-full mt-4 bg-primary/10 rounded-3xl p-6 shadow-soft border border-primary/20">
               <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                 <Users className="w-5 h-5" /> Admin Overview
               </h2>
               <div className="flex gap-12">
                 <div>
                   <p className="text-sm text-primary/80 font-medium">Platform Users</p>
                   <p className="text-3xl font-bold text-primary">{stats.total_users}</p>
                 </div>
                 <div>
                   <p className="text-sm text-primary/80 font-medium">Platform Cards</p>
                   <p className="text-3xl font-bold text-primary">{stats.total_cards}</p>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS PANEL */}
        <aside className="w-full lg:w-96 shrink-0 space-y-6">
           <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Notifications
             </h2>
             <Button variant="ghost" size="sm" className="text-primary h-auto py-1">See all</Button>
           </div>
           
           <div className="flex flex-col gap-4">
             {/* Fake notification matching UI */}
             <div className="bg-card rounded-3xl p-4 flex items-center gap-4 shadow-soft">
               <div className="w-12 h-12 shrink-0 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                 <Calendar className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <p className="text-sm font-semibold">You've enabled silent refresh!</p>
                 <p className="text-xs text-muted-foreground mt-0.5">System notification</p>
               </div>
             </div>
             
             <div className="bg-card rounded-3xl p-4 flex items-center gap-4 shadow-soft">
               <div className="w-12 h-12 shrink-0 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                 <Palette className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <p className="text-sm font-semibold">Dark mode configured</p>
                 <p className="text-xs text-muted-foreground mt-0.5">Your preferences updated</p>
               </div>
             </div>

             <div className="bg-card rounded-3xl p-4 flex items-center gap-4 shadow-soft">
               <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                 <Users className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <p className="text-sm font-semibold">Welcome to BusCard</p>
                 <p className="text-xs text-muted-foreground mt-0.5">Dashboard looks complete!</p>
               </div>
             </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
