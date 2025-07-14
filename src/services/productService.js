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

export const fetchMachineProducts = async (machineId) => {
  const { data, error } = await supabase
    .from("machine_products")
    .select(`
      assigned_stock,
      product:products (
        id, name, image_url, price
      )
    `)
    .eq("machine_id", machineId);

  if (error) throw error;

  return data.map((item) => ({
    ...item.product,
    assigned_stock: item.assigned_stock,
  }));
};


// Actualizar el stock de un producto
export const updateProductStock = async (productId, quantity) => {
  if (isNaN(quantity)) {
    throw new Error("La cantidad debe ser un número válido");
  }

  try {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();

    if (fetchError) throw fetchError;

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new Error("No hay suficiente stock disponible.");
    }

    const { data, error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", productId);

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