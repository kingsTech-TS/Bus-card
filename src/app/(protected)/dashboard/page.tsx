"use client";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCards } from "@/hooks/useCards";
import { useAdminStats } from "@/hooks/useAdmin";
import { CreditCard, Eye, Download, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: cards, isLoading: cardsLoading } = useCards();
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  const totalViews = cards?.reduce((acc, card) => acc + (card.views || 0), 0) || 0;
  const totalDownloads = cards?.reduce((acc, card) => acc + (card.downloads || 0), 0) || 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title={`Welcome back, ${user?.full_name || 'there'}`} 
        description="Here is an overview of your card portfolio and templates."
      >
        <Link href="/cards">
          <Button>Create New Card</Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardsLoading ? "-" : cards?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardsLoading ? "-" : totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardsLoading ? "-" : totalDownloads}</div>
          </CardContent>
        </Card>
      </div>

      {user?.role === "admin" && stats && (
        <div className="mb-8 p-6 bg-primary/5 rounded-xl border border-primary/10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> Admin Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Platform Users</p>
              <p className="text-2xl font-bold">{stats.total_users}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Platform Cards</p>
              <p className="text-2xl font-bold">{stats.total_cards}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Recent Cards</h2>
        {cards?.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-xl">
            <p className="text-muted-foreground mb-4">You haven't created any cards yet.</p>
            <Link href="/cards">
              <Button variant="outline">Browse Templates</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards?.slice(0, 4).map(card => (
              <Card key={card.id}>
                <div className="aspect-video bg-muted border-b flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Preview Thumbnail</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-base truncate">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {card.views || 0}</span>
                  <Link href={`/cards/${card.id}`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
