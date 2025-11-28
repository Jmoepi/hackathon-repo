import { createClient } from '../client';

// Storage bucket names
export const BUCKETS = {
  AVATARS: 'avatars',
  PRODUCTS: 'products',
} as const;

/**
 * Upload a user's avatar image
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @returns The public URL of the uploaded avatar
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const supabase = createClient();

  // Get file extension
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${userId}/avatar.${ext}`;

  // Delete existing avatar if it exists (to avoid duplicates with different extensions)
  await deleteAvatar(userId);

  // Upload the new avatar
  const { error: uploadError } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return { url: null, error: new Error(uploadError.message) };
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKETS.AVATARS)
    .getPublicUrl(filePath);

  // Update the user's profile with the avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating profile with avatar URL:', updateError);
    // Don't fail - the image was uploaded successfully
  }

  return { url: urlData.publicUrl, error: null };
}

/**
 * Delete a user's avatar
 * @param userId - The user's ID
 */
export async function deleteAvatar(userId: string): Promise<{ error: Error | null }> {
  const supabase = createClient();

  // List all files in the user's avatar folder
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .list(userId);

  if (listError) {
    console.error('Error listing avatars:', listError);
    return { error: new Error(listError.message) };
  }

  // Delete all files in the folder
  if (files && files.length > 0) {
    const filePaths = files.map((f) => `${userId}/${f.name}`);
    const { error: deleteError } = await supabase.storage
      .from(BUCKETS.AVATARS)
      .remove(filePaths);

    if (deleteError) {
      console.error('Error deleting avatars:', deleteError);
      return { error: new Error(deleteError.message) };
    }
  }

  // Clear the avatar_url from profile
  await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId);

  return { error: null };
}

/**
 * Get a user's avatar URL
 * @param userId - The user's ID
 */
export async function getAvatarUrl(userId: string): Promise<string | null> {
  const supabase = createClient();

  // First check if there's an avatar_url in the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single();

  if (profile?.avatar_url) {
    return profile.avatar_url;
  }

  // Fallback: check storage directly
  const { data: files } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .list(userId);

  if (files && files.length > 0) {
    const { data } = supabase.storage
      .from(BUCKETS.AVATARS)
      .getPublicUrl(`${userId}/${files[0].name}`);
    return data.publicUrl;
  }

  return null;
}

/**
 * Upload a product image
 * @param userId - The user's ID
 * @param productId - The product's ID
 * @param file - The image file to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadProductImage(
  userId: string,
  productId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const supabase = createClient();

  // Get file extension
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${userId}/${productId}.${ext}`;

  // Upload the product image
  const { error: uploadError } = await supabase.storage
    .from(BUCKETS.PRODUCTS)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading product image:', uploadError);
    return { url: null, error: new Error(uploadError.message) };
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKETS.PRODUCTS)
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, error: null };
}

/**
 * Delete a product image
 * @param userId - The user's ID
 * @param productId - The product's ID
 */
export async function deleteProductImage(
  userId: string,
  productId: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  // List files matching the product ID
  const { data: files } = await supabase.storage
    .from(BUCKETS.PRODUCTS)
    .list(userId);

  if (files) {
    const productFiles = files.filter((f) => f.name.startsWith(productId));
    if (productFiles.length > 0) {
      const filePaths = productFiles.map((f) => `${userId}/${f.name}`);
      const { error } = await supabase.storage
        .from(BUCKETS.PRODUCTS)
        .remove(filePaths);

      if (error) {
        return { error: new Error(error.message) };
      }
    }
  }

  return { error: null };
}

/**
 * Get a product's image URL
 * @param userId - The user's ID
 * @param productId - The product's ID
 */
export async function getProductImageUrl(
  userId: string,
  productId: string
): Promise<string | null> {
  const supabase = createClient();

  const { data: files } = await supabase.storage
    .from(BUCKETS.PRODUCTS)
    .list(userId);

  if (files) {
    const productFile = files.find((f) => f.name.startsWith(productId));
    if (productFile) {
      const { data } = supabase.storage
        .from(BUCKETS.PRODUCTS)
        .getPublicUrl(`${userId}/${productFile.name}`);
      return data.publicUrl;
    }
  }

  return null;
}
