import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Upload, Trash2, Image, Star, ImagePlus } from "lucide-react";
import OwnerLayout from "./OwnerLayout";
import type { Business } from "@shared/schema";

export default function OwnerGallery() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/owner/businesses"],
    enabled: isAuthenticated,
  });

  const selectedBusiness = businesses?.[0];
  const galleryImages = selectedBusiness?.galleryImages || [];

  const uploadImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/owner/businesses/${selectedBusiness?.id}/images`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Greška pri uploadu slike");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Slika uploadovana", description: "Slika je uspješno dodana u galeriju" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const uploadCoverMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/owner/businesses/${selectedBusiness?.id}/cover-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Greška pri uploadu naslovne slike");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Naslovna slika ažurirana", description: "Naslovna slika je uspješno ažurirana" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      return apiRequest("DELETE", `/api/owner/businesses/${selectedBusiness?.id}/images`, { imageUrl });
    },
    onSuccess: () => {
      toast({ title: "Slika obrisana", description: "Slika je uspješno uklonjena iz galerije" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/businesses"] });
    },
    onError: (error: Error) => {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "gallery" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Greška", description: "Molimo izaberite sliku", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Greška", description: "Slika ne smije biti veća od 5MB", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    
    setUploading(true);
    if (type === "cover") {
      uploadCoverMutation.mutate(formData);
    } else {
      uploadImageMutation.mutate(formData);
    }
  };

  if (businessesLoading) {
    return (
      <OwnerLayout title="Galerija slika">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Galerija slika" subtitle="Dodajte slike vašeg salona">
      <div className="space-y-6">
        {/* Cover Image */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Naslovna slika (Hero)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ova slika će se prikazivati kao glavna slika vašeg salona na stranici salona.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Current Cover Image Preview */}
            <div className="w-full md:w-64 aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {selectedBusiness?.coverImage || selectedBusiness?.imageUrl ? (
                <img 
                  src={selectedBusiness.coverImage || selectedBusiness.imageUrl || ""} 
                  alt="Naslovna slika" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Nema naslovne slike</p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "cover")}
                data-testid="input-cover-image"
              />
              <Button
                variant="outline"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadCoverMutation.isPending}
                className="gap-2"
                data-testid="button-upload-cover"
              >
                {uploadCoverMutation.isPending ? (
                  <LoadingSpinner />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Promijeni naslovnu sliku
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Preporučena veličina: 1200x600px, max 5MB
              </p>
            </div>
          </div>
        </Card>

        {/* Gallery Images */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Galerija ({galleryImages.length}/10)
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "gallery")}
              data-testid="input-gallery-image"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || galleryImages.length >= 10}
              className="gap-2"
              data-testid="button-upload-gallery"
            >
              {uploading ? (
                <LoadingSpinner />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
              Dodaj sliku
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Dodajte do 10 slika koje prikazuju vaš salon, usluge ili radove.
          </p>

          {galleryImages.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Image className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Nema slika u galeriji</p>
              <p className="text-xs text-muted-foreground mb-4">
                Dodajte slike da privučete više klijenata
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Uploaduj prvu sliku
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((imageUrl, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={imageUrl} 
                    alt={`Galerija ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="w-10 h-10"
                          data-testid={`button-delete-image-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Obrisati sliku?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ova radnja se ne može poništiti. Slika će biti trajno obrisana.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Odustani</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteImageMutation.mutate(imageUrl)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Obriši
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tips */}
        <Card className="p-6 bg-muted/50">
          <h4 className="font-medium text-foreground mb-2">Savjeti za dobre fotografije</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Koristite prirodno osvjetljenje</li>
            <li>• Pokažite radove prije i poslije</li>
            <li>• Fotografišite enterijer salona</li>
            <li>• Dodajte slike zadovoljnih klijenata (uz dozvolu)</li>
            <li>• Izbjegavajte zamagljene ili tamne slike</li>
          </ul>
        </Card>
      </div>
    </OwnerLayout>
  );
}
