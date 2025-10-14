import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Monument {
  id: string;
  name: string;
}

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonument, setSelectedMonument] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);
      fetchMonuments();
    };

    checkAuth();
  }, [navigate]);

  const fetchMonuments = async () => {
    try {
      const { data, error } = await supabase
        .from("monuments")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setMonuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading monuments",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMonument) {
      toast({
        title: "Monument required",
        description: "Please select a monument to review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating",
        variant: "destructive",
      });
      return;
    }

    if (!userId) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("feedback")
        .insert({
          user_id: userId,
          monument_id: selectedMonument,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your review.",
      });

      // Reset form
      setSelectedMonument("");
      setRating(0);
      setComment("");
    } catch (error: any) {
      toast({
        title: "Submission failed",
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
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl">
                <MessageSquare className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-3xl">Share Your Feedback</CardTitle>
                <CardDescription className="mt-1">
                  Help us improve the tourism experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="monument">Select Monument *</Label>
                <Select value={selectedMonument} onValueChange={setSelectedMonument}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a monument" />
                  </SelectTrigger>
                  <SelectContent>
                    {monuments.map((monument) => (
                      <SelectItem key={monument.id} value={monument.id}>
                        {monument.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Rating *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || rating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    You rated: {rating} star{rating !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Your Feedback (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience, suggestions, or thoughts..."
                  rows={6}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {comment.length}/500 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary shadow-soft"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Feedback;
