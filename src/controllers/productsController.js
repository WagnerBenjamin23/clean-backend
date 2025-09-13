const { messaging } = require('firebase-admin');
const pool = require('../config/db');
categoriesController = require('./categoriesController');

createProduct = async (req, res) => {
    const { name, description, price, stock, id_category, image_url } = req.body.product;

    try{
        category = await pool.query(
          "SELECT * FROM categories WHERE idcategory = ?",
          [id_category])

        if (category[0].length === 0) {
          return res.status(404).json({ message: "Categoría no encontrada" });
        }

        const result = await pool.query(
        "INSERT INTO products (name, description, price, stock, categories_idcategory) VALUES (?, ?, ?, ?, ?)",
        [name, description, price, stock, id_category]
        );

        if(image_url){
        await pool.query(
            "INSERT INTO product_images (image_url, products_idproducts) VALUES (?, ?)",
            [image_url, result[0].insertId]
        );}

        return res.status(201).json({ message: "Producto creado", product: result });
    }
    catch(error){
      return res.status(500).json({ message: "Error al crear producto", error });
    }
}

getProducts = async (req, res) => {
    try{
        const [rows] = await pool.query("SELECT * FROM products");
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

module.exports = {createProduct, getProducts, changeVisibility, updateProduct}