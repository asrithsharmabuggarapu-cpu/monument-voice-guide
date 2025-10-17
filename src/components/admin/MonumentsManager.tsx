import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { MonumentForm } from "./MonumentForm";

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

export const MonumentsManager = () => {
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMonument, setEditingMonument] = useState<Monument | null>(null);

  useEffect(() => {
    fetchMonuments();
  }, []);

  const fetchMonuments = async () => {
    try {
      const { data, error } = await supabase
        .from('monuments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMonuments(data || []);
    } catch (error) {
      console.error("Error fetching monuments:", error);
      toast.error("Failed to load monuments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this monument?")) return;

    try {
      const { error } = await supabase
        .from('monuments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Monument deleted successfully");
      fetchMonuments();
    } catch (error) {
      console.error("Error deleting monument:", error);
      toast.error("Failed to delete monument");
    }
  };

  const handleEdit = (monument: Monument) => {
    setEditingMonument(monument);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMonument(null);
    fetchMonuments();
  };

  if (loading) {
    return <div>Loading monuments...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monuments Management</CardTitle>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Monument
        </Button>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <MonumentForm
            monument={editingMonument}
            onClose={handleFormClose}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monuments.map((monument) => (
                  <TableRow key={monument.id}>
                    <TableCell className="font-medium">{monument.name}</TableCell>
                    <TableCell>{monument.location}</TableCell>
                    <TableCell>{monument.category}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(monument)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(monument.id)}
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