import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload as UploadIcon, Loader2, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    historicalInfo: "",
    category: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast({
        title: "Image required",
        description: "Please upload an image of the monument",
        variant: "destructive",
      });
      return;
    }

    if (!userId) return;

    setUploading(true);

    try {
      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('monument-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('monument-images')
        .getPublicUrl(fileName);

      // Insert monument data
      const { data: monument, error: insertError } = await supabase
        .from('monuments')
        .insert({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          historical_info: formData.historicalInfo,
          category: formData.category,
          image_url: publicUrl,
          created_by: userId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert monument image record
      const { error: imageRecordError } = await supabase
        .from('monument_images')
        .insert({
          monument_id: monument.id,
          user_id: userId,
          image_url: publicUrl,
        });

      if (imageRecordError) throw imageRecordError;

      toast({
        title: "Monument uploaded successfully!",
        description: "Your monument has been added to the guide.",
      });

      navigate(`/monument/${monument.id}`);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-3xl">Upload Monument</CardTitle>
            <CardDescription>
              Share a historical monument with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image">Monument Image *</Label>
                <div className="flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-dashed border-primary/30">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/10"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Image className="w-12 h-12" />
                        <span className="text-sm font-medium">Click to upload image</span>
                        <span className="text-xs">PNG, JPG or WEBP (max 10MB)</span>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Monument Name *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g., Taj Mahal"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Monument, Fort, Temple"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  required
                  placeholder="e.g., Agra, Uttar Pradesh"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  placeholder="Brief description of the monument..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="historicalInfo">Historical Information</Label>
                <Textarea
                  id="historicalInfo"
                  placeholder="Historical background, significance, and interesting facts..."
                  rows={4}
                  value={formData.historicalInfo}
                  onChange={(e) => setFormData({ ...formData, historicalInfo: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-soft"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Monument
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Upload;
