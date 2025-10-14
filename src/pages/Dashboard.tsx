import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Monument {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  image_url: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchMonuments();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchMonuments = async () => {
    try {
      const { data, error } = await supabase
        .from("monuments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMonuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading monuments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Explore Historical Monuments
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover India's rich cultural heritage
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-xl" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : monuments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                No monuments found. Upload an image to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monuments.map((monument) => (
              <Card
                key={monument.id}
                className="overflow-hidden cursor-pointer hover:shadow-elegant transition-all duration-300 group"
                onClick={() => navigate(`/monument/${monument.id}`)}
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  {monument.image_url ? (
                    <img
                      src={monument.image_url}
                      alt={monument.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                      <MapPin className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {monument.category && (
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-soft">
                      {monument.category}
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="group-hover:text-primary transition-colors">
                      {monument.name}
                    </span>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {monument.location}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {monument.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
