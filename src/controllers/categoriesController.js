const pool = require('../config/db');

saveCategory = async (req, res) => {
  const { name, description } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    const [result] = await conn.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description]
    );
    return res.status(201).json({ message: "Categoría creada", categoryId: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear categoría", error });
  } finally {
    if (conn) conn.release();
  }
};

deleteCategory = async (req, res) => {
  const categoryID = Number(req.params.id);

  let conn;
  try {
    conn = await pool.getConnection();
    const [result] = await conn.query(
      "DELETE FROM categories WHERE idcategory = ?",
      [categoryID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    return res.status(200).json({ message: "Categoría eliminada" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar categoría", error });
  } finally {
    if (conn) conn.release();
  }
};

getAllCategories = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM categories");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay categorías disponibles" });
    }
    return res.status(200).json({ categories: rows });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener categorías", error });
  } finally {
    if (conn) conn.release();
  }
};

getCategoriesById = async (req, res) => {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM categories WHERE idcategory = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    return res.status(200).json({ category: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener categoría", error });
  } finally {
    if (conn) conn.release();
  }
};

updateCategory = async (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    const [result] = await conn.query(
      'UPDATE categories SET name = ?, description = ? WHERE idcategory = ?',
      [name, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    return res.json({ idcategory: id, name, description });
  } catch (error) {
    return res.status(500).json({ message: 'Error editando categoría', error });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { saveCategory, deleteCategory, getAllCategories, getCategoriesById, updateCategory };
