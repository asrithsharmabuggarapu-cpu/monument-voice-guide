import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Monument {
  id: string;
  name: string;
  location: string;
  category: string;
  image_url: string;
  model_url: string | null;
  description: string;
  historical_info: string;
  description_english: string | null;
  description_hindi: string | null;
  description_telugu: string | null;
  historical_info_english: string | null;
  historical_info_hindi: string | null;
  historical_info_telugu: string | null;
}

interface MonumentFormProps {
  monument: Monument | null;
  onClose: () => void;
}

export const MonumentForm = ({ monument, onClose }: MonumentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: '',
    image_url: '',
    model_url: '',
    description: '',
    historical_info: '',
    description_english: '',
    description_hindi: '',
    description_telugu: '',
    historical_info_english: '',
    historical_info_hindi: '',
    historical_info_telugu: '',
  });

  useEffect(() => {
    if (monument) {
      setFormData({
        name: monument.name || '',
        location: monument.location || '',
        category: monument.category || '',
        image_url: monument.image_url || '',
        model_url: monument.model_url || '',
        description: monument.description || '',
        historical_info: monument.historical_info || '',
        description_english: monument.description_english || '',
        description_hindi: monument.description_hindi || '',
        description_telugu: monument.description_telugu || '',
        historical_info_english: monument.historical_info_english || '',
        historical_info_hindi: monument.historical_info_hindi || '',
        historical_info_telugu: monument.historical_info_telugu || '',
      });
    }
  }, [monument]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const monumentData = {
        ...formData,
        created_by: user.id,
      };

      if (monument) {
        const { error } = await supabase
          .from('monuments')
          .update(monumentData)
          .eq('id', monument.id);

        if (error) throw error;
        toast.success("Monument updated successfully");
      } else {
        const { error } = await supabase
          .from('monuments')
          .insert([monumentData]);

        if (error) throw error;
        toast.success("Monument created successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error saving monument:", error);
      toast.error("Failed to save monument");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Monument Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="image_url">Image URL *</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="model_url">3D Model URL (Sketchfab Embed)</Label>
          <Input
            id="model_url"
            type="url"
            value={formData.model_url}
            onChange={(e) => setFormData({ ...formData, model_url: e.target.value })}
            placeholder="https://sketchfab.com/models/..."
          />
        </div>
      </div>

      <Tabs defaultValue="english" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="english">English</TabsTrigger>
          <TabsTrigger value="hindi">हिंदी</TabsTrigger>
          <TabsTrigger value="telugu">తెలుగు</TabsTrigger>
        </TabsList>

        <TabsContent value="english" className="space-y-4">
          <div>
            <Label htmlFor="description_english">Description (English) *</Label>
            <Textarea
              id="description_english"
              value={formData.description_english}
              onChange={(e) => setFormData({ ...formData, description_english: e.target.value, description: e.target.value })}
              rows={4}
              required
            />
          </div>
          <div>
            <Label htmlFor="historical_info_english">Historical Info (English)</Label>
            <Textarea
              id="historical_info_english"
              value={formData.historical_info_english}
              onChange={(e) => setFormData({ ...formData, historical_info_english: e.target.value, historical_info: e.target.value })}
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="hindi" className="space-y-4">
          <div>
            <Label htmlFor="description_hindi">Description (Hindi)</Label>
            <Textarea
              id="description_hindi"
              value={formData.description_hindi}
              onChange={(e) => setFormData({ ...formData, description_hindi: e.target.value })}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="historical_info_hindi">Historical Info (Hindi)</Label>
            <Textarea
              id="historical_info_hindi"
              value={formData.historical_info_hindi}
              onChange={(e) => setFormData({ ...formData, historical_info_hindi: e.target.value })}
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="telugu" className="space-y-4">
          <div>
            <Label htmlFor="description_telugu">Description (Telugu)</Label>
            <Textarea
              id="description_telugu"
              value={formData.description_telugu}
              onChange={(e) => setFormData({ ...formData, description_telugu: e.target.value })}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="historical_info_telugu">Historical Info (Telugu)</Label>
            <Textarea
              id="historical_info_telugu"
              value={formData.historical_info_telugu}
              onChange={(e) => setFormData({ ...formData, historical_info_telugu: e.target.value })}
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : monument ? "Update Monument" : "Create Monument"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};