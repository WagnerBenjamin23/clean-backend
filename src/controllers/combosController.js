const { pool } = require("../config/db");

const { pool } = require("../config/db");

createCombo = async (req, res) => {
  const { name, description, price, products } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(
      "INSERT INTO combos (name, description, price) VALUES (?, ?, ?)",
      [name, description, price]
    );

    const comboId = result.insertId;

    if (products && products.length > 0) {
      for (const productId of products) {
        await conn.query(
          "INSERT INTO products_combos (combos_idcombo, products_idproducts) VALUES (?, ?)",
          [comboId, productId]
        );
      }
    }

    await conn.commit();
    return res.status(201).json({ message: "Combo creado", comboId });

  } catch (error) {
    if (conn) await conn.rollback();
    return res.status(500).json({ message: "Error al crear combo", error });
  } finally {
    if (conn) conn.release(); // 🔥 CLAVE
  }
};



getCombos = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const [rows] = await conn.query(`
      SELECT c.idcombo, c.name, c.description, c.price,
             GROUP_CONCAT(pc.products_idproducts) AS products
      FROM combos c
      LEFT JOIN products_combos pc ON c.idcombo = pc.combos_idcombo
      GROUP BY c.idcombo
    `);

    if (!rows.length) {
      return res.status(404).json({ message: "No se encontraron combos" });
    }

    return res.status(200).json({ combos: rows });

  } catch (error) {
    return res.status(500).json({ message: "Error al obtener combos", error });
  } finally {
    if (conn) conn.release();
  }
};


updateCombos = async (req, res) => {
  const comboId = Number(req.params.id);
  const { name, description, price, products } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [update] = await conn.query(
      `UPDATE combos SET name = ?, description = ?, price = ? WHERE idcombo = ?`,
      [name, description, price, comboId]
    );

    if (update.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Combo no encontrado" });
    }

    await conn.query(
      `DELETE FROM products_combos WHERE combos_idcombo = ?`,
      [comboId]
    );

    if (products && products.length > 0) {
      for (const productId of products) {
        await conn.query(
          `INSERT INTO products_combos (combos_idcombo, products_idproducts) VALUES (?, ?)`,
          [comboId, productId]
        );
      }
    }

    await conn.commit();
    res.json({ message: "Combo actualizado correctamente" });

  } catch (error) {
    if (conn) await conn.rollback();
    res.status(500).json({ message: "Error al actualizar el combo", error });
  } finally {
    if (conn) conn.release();
  }
};


deleteCombo = async (req, res) => {
  const comboID = Number(req.params.id);
  let conn;

  try {
    conn = await pool.getConnection();

    const [result] = await conn.query(
      "DELETE FROM combos WHERE idcombo = ?",
      [comboID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Combo no encontrado" });
    }

    res.status(200).json({ message: "Combo eliminado" });

  } catch (error) {
    res.status(500).json({ message: "Error al eliminar combo", error });
  } finally {
    if (conn) conn.release();
  }
};




module.exports = {createCombo, getCombos, updateCombos, deleteCombo}