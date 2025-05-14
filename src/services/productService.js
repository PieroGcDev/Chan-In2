import { supabase } from "../supabaseClient";

// Obtener todos los productos
export const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;
  return data;
};

// Obtener uno por ID
export const fetchProductById = async (id) => {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

export const addProduct = async (product) => {
  const { data, error } = await supabase.from("products").insert([product]);
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, product) => {
  // Clonar y eliminar campos que no deberían actualizarse
  const { id: _, created_at, ...cleanProduct } = product;

  const { data, error } = await supabase
    .from("products")
    .update(cleanProduct)
    .eq("id", id);

  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};

// Buscar producto por código de barras
export const fetchProductByBarcode = async (barcode) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .single(); // ← solo uno
  if (error) throw error;
  return data;
};
