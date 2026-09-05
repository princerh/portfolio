import { supabase } from "../services/supabase";

export const getGalleryPublicUrl = (filePath) => {
  if (!filePath) return null;

  const { data } = supabase.storage
    .from("gallery")
    .getPublicUrl(filePath);

  return data?.publicUrl || null;
};

export const uploadGalleryImage = async ({
  file,
  userId,
}) => {
  if (!file) {
    throw new Error("No image selected.");
  }

  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const extension =
    file.name?.split(".").pop()?.toLowerCase() || "jpg";

  const safeExtension =
    extension.replace(/[^a-z0-9]/g, "") || "jpg";

  const uniqueFileName =
    typeof crypto !== "undefined" &&
    crypto.randomUUID
      ? `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`
      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${safeExtension}`;

  const filePath = `${userId}/gallery/${uniqueFileName}`;

  const { error } = await supabase.storage
    .from("gallery")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw error;
  }

  return filePath;
};

export const deleteGalleryImage = async (filePath) => {
  if (!filePath) return;

  const { error } = await supabase.storage
    .from("gallery")
    .remove([filePath]);

  if (error) {
    throw error;
  }
};