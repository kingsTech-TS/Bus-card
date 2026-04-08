"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAdminUsers, usePromoteUser } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, Mail } from "lucide-react";

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const { mutate: promoteUser, isPending } = usePromoteUser();

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="User Management" 
        description="View and promote users across the platform."
      />

      <Card className="rounded-[2rem] border-0 shadow-soft overflow-hidden">
        <div className="rounded-md border">
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] p-4 text-sm font-medium text-muted-foreground border-b bg-muted/50">
            <div>User</div>
            <div>Email</div>
            <div>Role</div>
            <div>Joined</div>
            <div className="text-right">Actions</div>
          </div>
          
          <div className="divide-y">
            {isLoading && <div className="p-8 text-center text-muted-foreground">Loading users...</div>}
            
            {users?.map(user => (
              <div key={user.id} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] p-4 items-center gap-4 text-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.full_name || user.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate">{user.full_name || user.email}</span>
                </div>
                
                <div className="flex items-center gap-2 truncate text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>
                
                <div>
                  {user.role === "admin" ? (
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600"><ShieldCheck className="w-3 h-3 mr-1"/> Admin</Badge>
                  ) : (
                    <Badge variant="secondary">User</Badge>
                  )}
                </div>
                
                <div className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
                
                <div className="text-right">
                  {user.role !== "admin" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if(confirm(`Promote ${user.full_name || user.email} to Admin?`)) {
                          promoteUser(user.id);
                        }
                      }}
                      disabled={isPending}
                    >
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Make Admin
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
