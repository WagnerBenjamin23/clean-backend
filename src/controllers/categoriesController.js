const pool = require('../config/db');

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
        res.status(200).json({category:rows[0]});
    }
}
    catch(error){
      return res.status(500).json({ message: "Error al obtener categoria", error });
    }
}

module.exports = { getAllCategories, getCategoriesById };