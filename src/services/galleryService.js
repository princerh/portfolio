import { supabase } from "./supabase";
import { getGalleryPublicUrl } from "../utils/galleryStorage";

export const getBeyondSettings = async () => {
  const { data, error } = await supabase
    .from("beyond_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const getGalleryCategories = async ({
  activeOnly = true,
} = {}) => {
  let query = supabase
    .from("gallery_categories")
    .select("*")
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

export const getGalleryPhotos = async ({
  publishedOnly = true,
  featuredOnly = false,
  limit = null,
} = {}) => {
  let query = supabase
    .from("gallery_photos")
    .select(`
      *,
      category:gallery_categories (
        id,
        name,
        slug,
        is_active
      )
    `)
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (publishedOnly) {
    query = query.eq("is_published", true);
  }

  if (featuredOnly) {
    query = query.eq("featured", true);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map((photo) => ({
    ...photo,
    image_url: getGalleryPublicUrl(photo.image_path),
  }));
};

export const createGalleryPhoto = async (payload) => {
  const { data, error } = await supabase
    .from("gallery_photos")
    .insert(payload)
    .select(`
      *,
      category:gallery_categories (
        id,
        name,
        slug
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return {
    ...data,
    image_url: getGalleryPublicUrl(data.image_path),
  };
};

export const updateGalleryPhoto = async (
  id,
  payload
) => {
  const { data, error } = await supabase
    .from("gallery_photos")
    .update(payload)
    .eq("id", id)
    .select(`
      *,
      category:gallery_categories (
        id,
        name,
        slug
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return {
    ...data,
    image_url: getGalleryPublicUrl(data.image_path),
  };
};

export const deleteGalleryPhotoRecord = async (
  id
) => {
  const { error } = await supabase
    .from("gallery_photos")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
};

export const createGalleryCategory = async (
  payload
) => {
  const { data, error } = await supabase
    .from("gallery_categories")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateGalleryCategory = async (
  id,
  payload
) => {
  const { data, error } = await supabase
    .from("gallery_categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteGalleryCategory = async (
  id
) => {
  const { error } = await supabase
    .from("gallery_categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
};

export const saveBeyondSettings = async ({
  id,
  userId,
  values,
}) => {
  if (id) {
    const { data, error } = await supabase
      .from("beyond_settings")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("beyond_settings")
    .insert({
      owner_id: userId,
      ...values,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};