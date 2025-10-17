import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Recommendation {
  id: string;
  monument_id: string;
  type: string;
  name: string;
  description: string;
  distance: string;
  rating: number;
  contact: string;
}

interface RecommendationFormProps {
  recommendation: Recommendation | null;
  monumentId: string;
  onClose: () => void;
}

export const RecommendationForm = ({ recommendation, monumentId, onClose }: RecommendationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'nearby_place',
    name: '',
    description: '',
    distance: '',
    rating: 0,
    contact: '',
  });

  useEffect(() => {
    if (recommendation) {
      setFormData({
        type: recommendation.type || 'nearby_place',
        name: recommendation.name || '',
        description: recommendation.description || '',
        distance: recommendation.distance || '',
        rating: recommendation.rating || 0,
        contact: recommendation.contact || '',
      });
    }
  }, [recommendation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recommendationData = {
        ...formData,
        monument_id: monumentId,
      };

      if (recommendation) {
        const { error } = await supabase
          .from('recommendations')
          .update(recommendationData)
          .eq('id', recommendation.id);

        if (error) throw error;
        toast.success("Recommendation updated successfully");
      } else {
        const { error } = await supabase
          .from('recommendations')
          .insert([recommendationData]);

        if (error) throw error;
        toast.success("Recommendation created successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error saving recommendation:", error);
      toast.error("Failed to save recommendation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nearby_place">Nearby Place</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="distance">Distance</Label>
        <Input
          id="distance"
          value={formData.distance}
          onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
          placeholder="e.g., 2.5 km"
        />
      </div>

      <div>
        <Label htmlFor="rating">Rating (0-5)</Label>
        <Input
          id="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
        />
      </div>

      <div>
        <Label htmlFor="contact">Contact</Label>
        <Input
          id="contact"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          placeholder="Phone, email, or website"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : recommendation ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};