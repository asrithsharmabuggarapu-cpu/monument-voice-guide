import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { MonumentsManager } from "@/components/admin/MonumentsManager";
import { RecommendationsManager } from "@/components/admin/RecommendationsManager";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to access admin panel");
        navigate("/login");
        return;
      }

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error("Error checking admin access:", error);
        toast.error("Error verifying admin access");
        navigate("/");
        return;
      }

      if (!roles) {
        toast.error("Access denied: Admin privileges required");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error in checkAdminAccess:", error);
      toast.error("Authentication error");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
            <CardDescription>
              Manage monuments, recommendations, and site content
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="monuments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="monuments">Monuments</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="monuments">
            <MonumentsManager />
          </TabsContent>

          <TabsContent value="recommendations">
            <RecommendationsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;