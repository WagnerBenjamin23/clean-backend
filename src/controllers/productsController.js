const { messaging } = require('firebase-admin');
const pool = require('../config/db');
categoriesController = require('./categoriesController');
const admin = require("firebase-admin");
const storage = admin.storage().bucket();
const cloudinary = require('../config/cloudinary');

createProduct = async (req, res) => {
  const { name, description, price, stock, id_category} = req.body.product;
  const images = req.body.product.images; 
  try {
    // Validar categoría
    const [category] = await pool.query(
      "SELECT * FROM categories WHERE idcategory = ?",
      [id_category]
    );

    if (category.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    // Crear producto
    const [result] = await pool.query(
      "INSERT INTO products (name, description, price, stock, categories_idcategory) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, stock, id_category]
    );
    const productId = result.insertId;

    await uploadProductImages(images, productId);


    return res.status(201).json({ message: "Producto creado", productId });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear producto", error });
  }
};

addProductImage = async (req, res) => {


  console.log('PARAMS: ', req.params)
  const productId = req.params.id;
  const {images} = req.body;

  console.log("ID ", productId);
  console.log("IMAGES ", images )
  

  try{
    const product = await getProductByIdInternal(productId);
    console.log("PRODUCTO", product)
    if(!product) res.status(404).json({message:"Producto no encontrado"});
    {
      await pool.query(
        "INSERT INTO product_images (image_url, products_idproducts) VALUES (?, ?)",
        [images, productId]
      );
      res.status(201).json({message: 'Imagen guardada'})
    }
  }
  catch (e){
    res.status(404).json({message:"Error al guardar imagen", error: e});
  }
}

getProducts = async (req, res) => {
    try{
        const [rows] = await pool.query(`
        SELECT p.*, 
              GROUP_CONCAT(i.image_url) AS images
        FROM products p
        LEFT JOIN product_images i ON p.idproducts = i.products_idproducts
        GROUP BY p.idproducts
        `);

        if (rows.length === 0) {
          return res.status(404).json({ message: "No hay productos disponibles" });
        }
        else{
            return res.status(200).json({products:rows});
        }
    }
    catch(error){
        return res.status(500).json({ message: "Error al obtener productos", error });
    }
}

changeVisibility = async (req, res) => {
    const { id } = req.params;
    const { newState } = req.body;

  try{
    const result = await pool.query(
      "UPDATE products SET is_active = ? WHERE idproducts = ?",
      [newState, id]
    );

    return res.status(200).json({ message: "Visibilidad cambiada", result });
  }
  catch(error){
    return res.status(500).json({ message: "Error al cambiar visibilidad", error });
  }
}

updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, id_category } = req.body;
    const productId = req.params.id; 

    console.log('Updating product:', { productId, name, description, price, stock, id_category });

    const [result] = await pool.execute(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock = ?, categories_idcategory = ? 
       WHERE idproducts = ?`,
      [name, description, price, stock, id_category, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE idproducts = ?',
      [productId]
    );

    return res.status(200).json({ message: "Producto actualizado exitosamente", product: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al actualizar el producto", error: err.message });
  }
};

deleteProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const productId = req.params.id;

    // Iniciar transacción
    await connection.beginTransaction();

    // 1. Traer imágenes asociadas ANTES de borrar
    const [images] = await connection.query(
      "SELECT image_url FROM product_images WHERE products_idproducts = ?",
      [productId]
    );

    for (const img of images) {
    await deleteImageFromCloudinary(img.image_url);
   }

    // 2. Borrar imágenes en la DB
    await connection.query(
      "DELETE FROM product_images WHERE products_idproducts = ?",
      [productId]
    );

    // 3. Borrar el producto
    const [result] = await connection.query(
      "DELETE FROM products WHERE idproducts = ?",
      [productId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Confirmar si todo salió bien
    await connection.commit();
    return res.status(200).json({ message: "Producto e imágenes borrados exitosamente" });

  } catch (err) {
    await connection.rollback();
    return res.status(500).json({
      message: "Error al borrar producto",
      error: err.message,
    });
  } finally {
    connection.release();
  }
};



const getProductByIdInternal = async (id) => {
  const [productRows] = await pool.query(
    "SELECT * FROM products WHERE idproducts = ?",
    [id]
  );

  if (productRows.length === 0) {
    throw new Error("Producto no encontrado");
  }

  const [imageRows] = await pool.query(
    "SELECT image_url FROM product_images WHERE products_idproducts = ?",
    [id]
  );

  const product = {
    ...productRows[0],
    images: imageRows.map(img => img.image_url)
  };

  return { product };
};

function getFilePathFromUrl(url) {
  try {
    const decoded = decodeURIComponent(url); 
    const match = decoded.match(/\/o\/(.*?)\?/); 
    return match ? match[1] : null;  
  } catch (e) {
    return null;
  }
}


async function uploadProductImages(images, productId) {
  try {
    for (const url of images) {
      await pool.query(
        "INSERT INTO product_images (products_idproducts, image_url) VALUES (?, ?)",
        [productId, url]
      );
    }
    console.log("Imágenes subidas correctamente");
  } catch (err) {
    console.error(err);
  }
}

async function deleteImageFromCloudinary(url) {
  const publicId = getPublicIdFromUrl(url);
  console.log('PUBLIC ID', publicId)
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Resultado eliminación Cloudinary:', result);
    return result;
  } catch (err) {
    console.error('Error eliminando imagen de Cloudinary:', err);
    throw err;
  }
}

function getPublicIdFromUrl(url) {
  const parts = url.split('/');
  console.log('parts', parts)
  const filename = parts[parts.length - 1]; 
  console.log('filename', filename)
  return filename.substring(0, filename.lastIndexOf('.')); 
}

getLatestProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const [products] = await pool.query(
      `
      SELECT 
        p.*,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.products_idproducts = p.idproducts
          ORDER BY pi.created_at ASC
          LIMIT 1
        ) AS image
      FROM products p
      ORDER BY p.created_at DESC
      LIMIT ?
      `,
      [limit]
    );

    return res.status(200).json({
      ok: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting latest products:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error getting latest products'
    });
  }
};








module.exports = {createProduct, getProducts, changeVisibility, updateProduct, deleteProduct, addProductImage, uploadProductImages, getLatestProducts}