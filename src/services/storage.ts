
import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "pg-images";

export const uploadImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Create a unique file path with user ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log('Uploading file to bucket:', BUCKET_NAME);
    console.log('File path:', filePath);
    
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
    
    console.log('Upload successful:', data);
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    console.log('Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in upload process:', error);
    return null;
  }
};

export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts[pathParts.length - 1];
    
    console.log('Deleting file:', filePath);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in delete process:', error);
    return false;
  }
};
