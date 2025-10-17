import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { RecommendationForm } from "./RecommendationForm";

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

interface Monument {
  id: string;
  name: string;
}

export const RecommendationsManager = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [selectedMonument, setSelectedMonument] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | null>(null);

  useEffect(() => {
    fetchMonuments();
  }, []);

  useEffect(() => {
    if (selectedMonument) {
      fetchRecommendations();
    }
  }, [selectedMonument]);

  const fetchMonuments = async () => {
    try {
      const { data, error } = await supabase
        .from('monuments')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setMonuments(data || []);
      if (data && data.length > 0) {
        setSelectedMonument(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching monuments:", error);
      toast.error("Failed to load monuments");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!selectedMonument) return;

    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('monument_id', selectedMonument)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to load recommendations");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recommendation?")) return;

    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Recommendation deleted successfully");
      fetchRecommendations();
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      toast.error("Failed to delete recommendation");
    }
  };

  const handleEdit = (recommendation: Recommendation) => {
    setEditingRecommendation(recommendation);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecommendation(null);
    fetchRecommendations();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recommendations Management</CardTitle>
        <div className="flex gap-2">
          <Select value={selectedMonument} onValueChange={setSelectedMonument}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a monument" />
            </SelectTrigger>
            <SelectContent>
              {monuments.map((monument) => (
                <SelectItem key={monument.id} value={monument.id}>
                  {monument.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(true)} disabled={!selectedMonument}>
            <Plus className="h-4 w-4 mr-2" />
            Add Recommendation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <RecommendationForm
            recommendation={editingRecommendation}
            monumentId={selectedMonument}
            onClose={handleFormClose}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.map((recommendation) => (
                  <TableRow key={recommendation.id}>
                    <TableCell className="font-medium">{recommendation.name}</TableCell>
                    <TableCell>{recommendation.type}</TableCell>
                    <TableCell>{recommendation.distance}</TableCell>
                    <TableCell>{recommendation.rating}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(recommendation)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(recommendation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};