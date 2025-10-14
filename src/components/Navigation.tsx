import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Landmark, LogOut, Upload, Home, MessageSquare } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out successfully",
      });
      navigate("/login");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
              <Landmark className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Smart Tourism
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            
            <Button
              variant={isActive("/upload") ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/upload")}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>

            <Button
              variant={isActive("/feedback") ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/feedback")}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
