const pool = require('../config/db');
saveCategory = async (req, res) => {
    const { name, description } = req.body;
  
    try{
      const [result] = await pool.query(
        "INSERT INTO categories (name, description) VALUES (?, ?)",
        [name, description]
      );
      if (result.affectedRows === 1) {
          return res.status(201).json({ message: "Categoría creada", categoryId: result.insertId });
      }
    }
    catch(error){
      res.status(500).json({ message: "Error al crear categoría", error });
    }
  }

  deleteCategory = async (req, res) => {

    const { id } = req.params;
    categoryID = Number(id);
    console.log(categoryID);
    console.log(typeof(categoryID));
    try{
      const [result] = await pool.query(
        "DELETE FROM categories WHERE idcategory = ?",
        [categoryID]
      );

      
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Categoría no encontrada" });
      }
      res.status(200).json({ message: "Categoría eliminada" });
    }
    catch(error){
      res.status(500).json({ message: "Error al eliminar categoría", error });
    }
  }

getAllCategories = async (req, res) => {

  try{
    const [rows] = await pool.query( "SELECT * FROM categories");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay categorias disponibles" });
    }
    else{
        return res.status(200).json({categories:rows});
    }
}
    catch(error){
      return res.status(500).json({ message: "Error al obtener categorias", error });
    }

}

getCategoriesById = async (req, res) => {
    const { id } = req.params;

    try{
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE idcategory = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    else{
        return res.status(200).json({category:rows[0]});
    }
}
    catch(error){
      return res.status(500).json({ message: "Error al obtener categoria", error });
    }
}

module.exports = {saveCategory, deleteCategory, getAllCategories, getCategoriesById };