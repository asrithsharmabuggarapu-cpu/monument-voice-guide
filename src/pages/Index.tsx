import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, MapPin, Globe, Volume2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <div className="p-6 bg-gradient-to-br from-primary to-primary/80 rounded-3xl shadow-elegant">
              <Landmark className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            Smart Tourism Guide
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Explore India's rich cultural heritage with interactive AR guides, multi-language audio tours, and personalized recommendations
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-elegant text-lg px-8"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="border-2 border-primary/50 hover:bg-primary/5 text-lg px-8"
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2 border-primary/10 shadow-soft hover:shadow-elegant transition-all duration-300">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Discover Monuments</h3>
              <p className="text-muted-foreground">
                Upload monument images and get instant historical information and cultural insights
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/10 shadow-soft hover:shadow-elegant transition-all duration-300">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-secondary/10 rounded-2xl">
                  <Volume2 className="w-8 h-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Multi-Language Audio</h3>
              <p className="text-muted-foreground">
                Listen to guided tours in Telugu, Hindi, and English with natural narration
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-soft hover:shadow-elegant transition-all duration-300">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Smart Recommendations</h3>
              <p className="text-muted-foreground">
                Get personalized suggestions for nearby attractions, hotels, and travel tips
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
