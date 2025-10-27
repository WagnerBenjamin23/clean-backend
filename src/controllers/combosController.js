const { pool } = require("../config/db");

createCombo = (req, res) => {
  const { name, description, price, products } = req.body;

  pool.query(
    "INSERT INTO combos (name, description, price) VALUES (?, ?, ?)",
    [name, description, price],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error al crear combo", error: err });
      }

      const comboId = result.insertId;

      // Insertar productos del combo
      products.forEach((p) => {
        pool.query(
          "INSERT INTO products_combos (combos_idcombo, products_idproducts) VALUES (?, ?)",
          [comboId, p],
          (err2) => {
            if (err2) console.error(err2);
          }
        );
      });

      return res.status(201).json({ message: "Combo creado", comboId });
    }
  );
};


getCombos = (req, res) => {
  const sql = `
    SELECT c.idcombo, c.name, c.description, c.price,
           GROUP_CONCAT(pc.products_idproducts) AS products
    FROM combos c
    LEFT JOIN products_combos pc ON c.idcombo = pc.combos_idcombo
    GROUP BY c.idcombo
  `;
  pool.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Error al obtener combos", error: err });
    if (!rows.length) return res.status(404).json({ message: "No se encontraron combos" });
    return res.status(200).json({ combos: rows });
  });
};


updateCombos = async (req, res) => {
  const comboId = req.params.id;
  const { name, description, price, products } = req.body; 

  try {
 
    await pool.promise().query(
      `UPDATE combos SET name = ?, description = ?, price = ? WHERE idcombo = ?`,
      [name, description, price, comboId]
    );
 
    await pool.promise().query(`DELETE FROM products_combos WHERE combos_idcombo = ?`, [comboId]);

    if (products && products.length > 0) {
      const values = products.map(p => [comboId, p]); 
      await pool.promise().query(
        `INSERT INTO products_combos (combos_idcombo, products_idproducts) VALUES ?`,
        [values]
      );
    }

    res.json({ message: 'Combo actualizado correctamente' });
  } catch (error) {

    res.status(500).json({ error: 'Error al actualizar el combo' });
  }
};

deleteCombo = async (req, res) => {
  const { id } = req.params;
  comboID = Number(id);

  try{
    const [result] = await pool.promise().query(
      "DELETE FROM combos WHERE idcombo = ?",
      [comboID]
    );
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Combo no encontrado" });
    }   
    res.status(200).json({ message: "Combo eliminado" });
  }
  catch(error){
    res.status(500).json({ message: "Error al eliminar combo", error });
  }
}



module.exports = {createCombo, getCombos, updateCombos, deleteCombo}