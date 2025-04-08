
import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "pg-images";

export const uploadImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Create a unique file path with user ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in upload process:', error);
    return null;
  }
};
