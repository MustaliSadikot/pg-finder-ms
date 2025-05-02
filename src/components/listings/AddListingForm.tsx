import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { pgListingsAPI } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { uploadImage } from "@/services/storage";
import { Loader2, UploadCloud, Link as LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";

const commonAmenities = [
  { id: "wifi", label: "WiFi" },
  { id: "ac", label: "AC" },
  { id: "food", label: "Food" },
  { id: "laundry", label: "Laundry" },
  { id: "gym", label: "Gym" },
  { id: "parking", label: "Parking" },
  { id: "security", label: "Security" },
  { id: "tv", label: "TV" },
  { id: "cleaning", label: "Cleaning Service" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  genderPreference: z.enum(["male", "female", "any"]),
  amenities: z.array(z.string()).min(1, "Select at least one amenity"),
  imageFile: z.instanceof(FileList).optional(),
  imageUrl: z.string().url("Please enter a valid URL").optional(),
  availability: z.boolean(),
  description: z.string().min(10, "Description must be at least 10 characters"),
}).refine(data => data.imageFile?.length > 0 || data.imageUrl, {
  message: "Either upload an image or provide an image URL",
  path: ["imageUrl"], 
});

type FormData = z.infer<typeof formSchema>;

const AddListingForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [addedPG, setAddedPG] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      price: 0,
      genderPreference: "any",
      amenities: [],
      imageUrl: "",
      availability: true,
      description: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Set the value in the form
      form.setValue("imageFile", files);
      form.setValue("imageUrl", ""); // Clear URL input when file is selected
    }
  };

  const handleImageUrlChange = (url: string) => {
    if (url) {
      setImagePreview(url);
      // Clear file input when URL is used
      form.setValue("imageFile", undefined);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a listing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = data.imageUrl || "";
      
      // If there's a file selected, upload it first
      if (data.imageFile && data.imageFile.length > 0) {
        setIsUploading(true);
        const uploadedUrl = await uploadImage(data.imageFile[0], user.id);
        setIsUploading(false);
        
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast({
            title: "Image upload failed",
            description: "There was an error uploading your image. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Construct the listing with both backend and frontend properties
      const newListing = await pgListingsAPI.addListing({
        owner_id: user.id,
        ownerId: user.id,
        name: data.name,
        address: data.location,
        location: data.location,
        price: data.price,
        genderPreference: data.genderPreference,
        amenities: data.amenities,
        imageUrl: imageUrl,
        availability: data.availability,
        description: data.description,
      });

      toast({
        title: "PG listing added",
        description: "Your PG has been successfully listed",
      });

      // Invalidate the owner listings query
      queryClient.invalidateQueries({ queryKey: ["ownerListings", user.id] });
      
      // Set the added PG ID and reset the form
      setAddedPG(newListing.id);
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error("Error adding listing:", error);
      toast({
        title: "Failed to add listing",
        description: "There was an error adding your PG listing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {addedPG && (
          <Alert className="mb-6">
            <AlertDescription>
              PG listing added successfully! You can now{" "}
              <Button 
                variant="link" 
                className="h-auto p-0 text-primary" 
                onClick={() => {
                  document.querySelector('[value="manage-rooms"]')?.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                  );
                }}
              >
                add rooms and beds
              </Button>{" "}
              to your new PG.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PG Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PG name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter monthly rent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genderPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender Preference</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male Only</SelectItem>
                        <SelectItem value="female">Female Only</SelectItem>
                        <SelectItem value="any">Any (Co-ed)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageFile"
                render={() => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>PG Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Tabs value={imageTab} onValueChange={(v) => setImageTab(v as "upload" | "url")}>
                          <TabsList className="grid grid-cols-2">
                            <TabsTrigger value="upload">Upload Image</TabsTrigger>
                            <TabsTrigger value="url">Image URL</TabsTrigger>
                          </TabsList>
                          <TabsContent value="upload" className="mt-4">
                            <div className="flex items-center justify-center w-full">
                              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                {imagePreview && imageTab === "upload" ? (
                                  <div className="relative w-full h-full">
                                    <img 
                                      src={imagePreview} 
                                      alt="PG Preview" 
                                      className="object-cover w-full h-full rounded-lg" 
                                    />
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                                  </div>
                                )}
                                <input 
                                  id="image-upload" 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/png, image/jpeg, image/jpg"
                                  onChange={handleImageChange}
                                />
                              </label>
                            </div>
                          </TabsContent>
                          <TabsContent value="url" className="mt-4">
                            <FormField
                              control={form.control}
                              name="imageUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex flex-col space-y-4">
                                    <div className="flex items-center space-x-2">
                                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="https://example.com/image.jpg"
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          handleImageUrlChange(e.target.value);
                                        }}
                                      />
                                    </div>
                                    {imagePreview && imageTab === "url" && (
                                      <div className="h-40 w-full">
                                        <img 
                                          src={imagePreview}
                                          alt="Preview" 
                                          className="h-full w-full object-cover rounded-md"
                                          onError={() => {
                                            setImagePreview(null);
                                            toast({
                                              title: "Image Error",
                                              description: "Could not load image from provided URL",
                                              variant: "destructive",
                                            });
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image of your PG accommodation or provide an image URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div>
                      <FormLabel>Availability</FormLabel>
                      <FormDescription>
                        Is this PG currently available?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your PG accommodation"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Amenities</FormLabel>
                    <FormDescription>
                      Select all amenities that your PG offers
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {commonAmenities.map((amenity) => (
                      <FormField
                        key={amenity.id}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={amenity.id}
                              className="flex items-center space-x-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(amenity.label)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = [...(field.value || [])];
                                    if (checked) {
                                      field.onChange([...currentValue, amenity.label]);
                                    } else {
                                      field.onChange(
                                        currentValue.filter((value) => value !== amenity.label)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {amenity.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isUploading ? "Uploading..." : "Adding..."}
                  </>
                ) : (
                  "Add PG Listing"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      {addedPG && (
        <CardFooter className="px-6 pb-6 pt-0">
          <Button 
            className="w-full" 
            onClick={() => {
              // Select the manage-rooms tab
              document.querySelector('[value="manage-rooms"]')?.dispatchEvent(
                new MouseEvent('click', { bubbles: true })
              );
            }}
          >
            Add Rooms & Beds to Your New PG
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AddListingForm;
