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

// Obtener productos asignados a una máquina por su ID (ajustado para no usar machine_id directamente)
export const fetchMachineProducts = async (machineId) => {
  const { data, error } = await supabase
    .from("machine_products") // Usamos la tabla de relación para obtener los productos
    .select("product_id")
    .eq("machine_id", machineId);

  if (error) throw error;

  const productIds = data.map(item => item.product_id);
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (productError) throw productError;
  return products;
};

// Actualizar el stock de un producto
export const updateProductStock = async (productId, quantity) => {
  // Verificamos que la cantidad sea un número válido
  if (isNaN(quantity) || quantity <= 0) {
    throw new Error("La cantidad debe ser un número mayor que 0");
  }

  try {
    // Primero obtenemos el producto y su stock actual
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();  // Usamos `single()` para obtener solo un producto

    if (fetchError) throw fetchError;

    // Restamos la cantidad del stock actual
    const newStock = product.stock - quantity;

    // Si el nuevo stock es negativo, lanzamos un error
    if (newStock < 0) {
      throw new Error("No hay suficiente stock disponible.");
    }

    // Actualizamos el stock en la base de datos
    const { data, error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", productId);  // Identificamos el producto por su ID

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error al actualizar el stock del producto:", error.message);
    throw error;
  }
};

// Eliminar un producto asignado de una máquina
export const removeProductFromMachine = async (machineId, productId) => {
  const { data, error } = await supabase
    .from("machine_products")  // Suponiendo que 'machine_products' es la tabla de relación
    .delete()
    .eq("machine_id", machineId)
    .eq("product_id", productId);

  if (error) throw error;
  return data;
};