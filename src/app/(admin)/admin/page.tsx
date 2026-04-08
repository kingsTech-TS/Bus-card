"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAdminStats, useActivityLogs } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileImage, Eye, Download, ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const { data: stats } = useAdminStats();
  const { data: logs } = useActivityLogs();

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Admin Control Center" 
        description="Platform-wide metrics and system status."
      >
        <Link href="/admin/users">
          <Button variant="outline"><Users className="w-4 h-4 mr-2"/> Manage Users</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+{stats?.new_users_today || 0} today</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Total Users</p>
            <h3 className="text-3xl font-bold tracking-tight">{stats?.total_users || "-"}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <FileImage className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+{stats?.new_cards_today || 0} today</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Total Cards</p>
            <h3 className="text-3xl font-bold tracking-tight">{stats?.total_cards || "-"}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Card Views</p>
            <h3 className="text-3xl font-bold tracking-tight">{stats?.total_views || "-"}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <Download className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Exports</p>
            <h3 className="text-3xl font-bold tracking-tight">{stats?.total_downloads || "-"}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5"/> Recent Activity</CardTitle>
            <CardDescription>Live feed of platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs?.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      <span className="text-foreground">{log.user || 'System'}</span> {log.action} <span className="font-semibold text-primary">{log.resource}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {!logs?.length && <p className="text-sm text-muted-foreground">No recent activity.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users" className="block w-full">
              <Button variant="secondary" className="w-full justify-start">Manage Users</Button>
            </Link>
            <Button variant="secondary" className="w-full justify-start">Promote New Admin</Button>
            <Button variant="secondary" className="w-full justify-start">Platform Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
