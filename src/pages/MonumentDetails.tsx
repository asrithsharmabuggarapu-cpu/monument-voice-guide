import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Hotel, Navigation as NavigationIcon, Volume2, Star, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Monument {
  id: string;
  name: string;
  description: string;
  historical_info: string | null;
  location: string;
  category: string | null;
  image_url: string | null;
}

interface Recommendation {
  id: string;
  type: string;
  name: string;
  description: string | null;
  distance: string | null;
  rating: number | null;
  contact: string | null;
}

const MonumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [monument, setMonument] = useState<Monument | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [audioText, setAudioText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchMonumentDetails();
    };

    checkAuth();
  }, [id, navigate]);

  const fetchMonumentDetails = async () => {
    try {
      const [monumentRes, recommendationsRes] = await Promise.all([
        supabase.from("monuments").select("*").eq("id", id).single(),
        supabase.from("recommendations").select("*").eq("monument_id", id),
      ]);

      if (monumentRes.error) throw monumentRes.error;
      if (recommendationsRes.error) throw recommendationsRes.error;

      setMonument(monumentRes.data);
      setRecommendations(recommendationsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error loading monument details",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async (language: string) => {
    if (!monument) return;

    setAudioLoading(language);
    try {
      const textContent = `${monument.name}. ${monument.description}. ${monument.historical_info || ''}`;
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: textContent, language }
      });

      if (error) throw error;

      setAudioText((prev) => ({ ...prev, [language]: data.translatedText }));
      
      // Use Web Speech API to read the text
      const utterance = new SpeechSynthesisUtterance(data.translatedText);
      utterance.lang = language === 'telugu' ? 'te-IN' : language === 'hindi' ? 'hi-IN' : 'en-US';
      speechSynthesis.speak(utterance);

      toast({
        title: "Audio started",
        description: `Playing in ${language.charAt(0).toUpperCase() + language.slice(1)}`,
      });
    } catch (error: any) {
      toast({
        title: "Error generating audio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAudioLoading(null);
    }
  };

  if (loading || !monument) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const nearbyPlaces = recommendations.filter((r) => r.type === "nearby_place");
  const hotels = recommendations.filter((r) => r.type === "hotel");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden shadow-elegant">
              {monument.image_url && (
                <div className="relative h-96">
                  <img
                    src={monument.image_url}
                    alt={monument.name}
                    className="w-full h-full object-cover"
                  />
                  {monument.category && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground shadow-soft">
                      {monument.category}
                    </Badge>
                  )}
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{monument.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4" />
                  {monument.location}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{monument.description}</p>
                </div>

                {monument.historical_info && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Historical Information</h3>
                    <p className="text-muted-foreground">{monument.historical_info}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Audio Guide</h3>
                  <div className="flex flex-wrap gap-3">
                    {["english", "hindi", "telugu"].map((lang) => (
                      <Button
                        key={lang}
                        onClick={() => handleTextToSpeech(lang)}
                        disabled={audioLoading !== null}
                        className="gap-2 bg-secondary hover:bg-secondary/90"
                      >
                        {audioLoading === lang ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </Button>
                    ))}
                  </div>
                  {Object.keys(audioText).length > 0 && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Translated text available for: {Object.keys(audioText).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Nearby attractions and hotels</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="places" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="places" className="flex-1">
                      <NavigationIcon className="w-4 h-4 mr-2" />
                      Places
                    </TabsTrigger>
                    <TabsTrigger value="hotels" className="flex-1">
                      <Hotel className="w-4 h-4 mr-2" />
                      Hotels
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="places" className="space-y-4 mt-4">
                    {nearbyPlaces.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No nearby places available
                      </p>
                    ) : (
                      nearbyPlaces.map((place) => (
                        <Card key={place.id} className="border-l-4 border-l-secondary">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{place.name}</CardTitle>
                            {place.distance && (
                              <CardDescription className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {place.distance}
                              </CardDescription>
                            )}
                          </CardHeader>
                          {place.description && (
                            <CardContent className="pt-0">
                              <p className="text-sm text-muted-foreground">
                                {place.description}
                              </p>
                              {place.rating && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Star className="w-4 h-4 fill-primary text-primary" />
                                  <span className="text-sm font-medium">{place.rating}</span>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="hotels" className="space-y-4 mt-4">
                    {hotels.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hotels available
                      </p>
                    ) : (
                      hotels.map((hotel) => (
                        <Card key={hotel.id} className="border-l-4 border-l-primary">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{hotel.name}</CardTitle>
                            {hotel.distance && (
                              <CardDescription className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {hotel.distance}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            {hotel.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {hotel.description}
                              </p>
                            )}
                            {hotel.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-primary text-primary" />
                                <span className="text-sm font-medium">{hotel.rating}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonumentDetails;
