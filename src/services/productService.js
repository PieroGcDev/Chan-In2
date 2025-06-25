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

// Agregar un nuevo producto
export const addProduct = async (product) => {
  const { data, error } = await supabase.from("products").insert([{
    name: product.name,
    sku: product.sku,
    stock: product.stock,
    price: product.price,
    barcode: product.barcode,
    machine_id: product.machine_id,
    expiration_date: product.expiration_date,  // Incluir fecha de expiración
  }]);
  if (error) throw error;
  return data;
};

// Actualizar un producto existente
export const updateProduct = async (id, product) => {
  // Clonar y eliminar campos que no deberían actualizarse
  const { id: _, created_at, ...cleanProduct } = product;

  const { data, error } = await supabase
    .from("products")
    .update({
      ...cleanProduct,
      expiration_date: product.expiration_date,  // Incluir fecha de expiración
    })
    .eq("id", id);

  if (error) throw error;
  return data;
};

// Eliminar un producto
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
    .single();
  if (error) throw error;
  return data;
};

// Obtener productos de una máquina por su ID
export const fetchMachineProducts = async (machineId) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("machine_id", machineId); // Relacionar producto con su máquina

  if (error) throw error;
  return data;
};

// Actualizar el stock de un producto
export const updateProductStock = async (productId, quantity) => {
  const { data, error } = await supabase
    .from("products")
    .update({ stock: supabase.raw('stock - ?', [quantity]) }) // Disminuir el stock por la cantidad asignada
    .eq("id", productId);

  if (error) throw error;
  return data;
};