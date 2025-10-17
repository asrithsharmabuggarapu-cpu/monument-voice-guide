import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Hotel, Navigation as NavigationIcon, Volume2, Star, Loader2, Box, Headphones } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
// Import necessary items from the corrected context file
import { useLanguage, Monument } from "@/contexts/LanguageContext";

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
  // Get language state and the helper function from context
  const { language, getMonumentText } = useLanguage();
  
  const [monument, setMonument] = useState<Monument | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Stop audio playback when leaving the page or starting a new request
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

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
        // Fetch all multilingual columns
        supabase.from("monuments").select(`
            id, name, description, historical_info, location, category, image_url, model_url,
            description_english, description_hindi, description_telugu,
            historical_info_english, historical_info_hindi, historical_info_telugu
        `).eq("id", id).single(),
        supabase.from("recommendations").select("*").eq("monument_id", id),
      ]);

      if (monumentRes.error) throw monumentRes.error;
      if (recommendationsRes.error) throw recommendationsRes.error;

      setMonument(monumentRes.data as Monument);
      setRecommendations(recommendationsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error loading monument details",
        description: error.message,
        variant: "destructive",
      });
      // Optionally, navigate back if monument doesn't exist
      // navigate("/dashboard"); 
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ CRITICAL FIX: Handles Edge Function audio streaming
  const handleTextToSpeech = async () => {
    if (!monument) return;

    setAudioLoading(language);
    
    // Stop any currently playing audio
    if (audio) audio.pause();

    try {
      // Get the currently localized text for the whole guide
      const description = getMonumentText(monument, 'description');
      const historicalInfo = getMonumentText(monument, 'historical_info');
      
      const textContent = `${monument.name}. ${description}. ${historicalInfo}`;
      
      // 1. Invoke the Edge Function, expecting an audio buffer in the response
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
            text: textContent, 
            language: language 
        }
      });

      // Error handling for function invocation
      if (error) throw error;
      if (!data) throw new Error("Audio generation failed on the server.");
      
      // 2. The Edge function should return a raw audio buffer (e.g., MP3 or WAV)
      // We assume the response data is an ArrayBuffer (or base64 encoded string if transport is tricky)
      
      // Since Supabase returns data wrapped in an object for JSON, 
      // but we expect a binary response, we need to adjust the fetch if the invoke wrapper fails:
      
      // If the Edge function returns raw audio buffer, the `invoke` data object might contain the buffer.
      // For simplicity, let's assume `data` contains the raw ArrayBuffer.
      // NOTE: If Supabase invoke wraps the binary response in an object, you might need a custom fetch.
      
      // ***Using a robust fetch call for binary data***
      const url = `${supabase.functions.url('text-to-speech')}`;
      const audioResponse = await fetch(url, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: textContent, language: language }),
      });
      
      if (!audioResponse.ok) {
          throw new Error(`Edge Function error: ${audioResponse.statusText}`);
      }
      
      const audioBlob = await audioResponse.blob();
      
      if (audioBlob.type.includes("json")) {
          const errorJson = await audioBlob.text();
          console.error("Audio generation failed:", errorJson);
          throw new Error("Failed to receive audio data. Server returned JSON error.");
      }

      // 3. Create a playable object URL and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);
      newAudio.play();

      toast({
        title: "Audio Guide Started",
        description: `Playing in ${language.charAt(0).toUpperCase() + language.slice(1)}`,
      });
    } catch (error: any) {
      console.error("Audio generation error:", error);
      toast({
        title: "Audio Error",
        description: error.message || "Failed to start audio guide.",
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

  // ⚠️ ENHANCEMENT: Use the Context helper for localized content
  const description = getMonumentText(monument, 'description');
  const historicalInfo = getMonumentText(monument, 'historical_info');

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
                {monument.model_url && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Box className="w-5 h-5" />
                      3D Model
                    </h3>
                    <div className="rounded-lg overflow-hidden border shadow-sm">
                      <iframe
                        src={monument.model_url}
                        className="w-full h-[400px]"
                        frameBorder="0"
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{description}</p>
                </div>

                {historicalInfo && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Historical Information</h3>
                    <p className="text-muted-foreground">{historicalInfo}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Audio Guide</h3>
                  <div className="flex flex-wrap gap-3">
                    {/* The audio button uses the currently selected language */}
                    <Button
                      onClick={handleTextToSpeech}
                      disabled={audioLoading !== null}
                      className="gap-2 bg-secondary hover:bg-secondary/90"
                    >
                      {audioLoading === language ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Headphones className="w-4 h-4" />
                      )}
                      Play Guide in {language.charAt(0).toUpperCase() + language.slice(1)}
                    </Button>
                    
                    {audio && (
                      <Button variant="outline" onClick={() => audio.pause()} disabled={audio.paused}>
                          Stop Audio
                      </Button>
                    )}
                  </div>
                  {/* Removed the redundant audioText display */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Sidebar (Unchanged) */}
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
