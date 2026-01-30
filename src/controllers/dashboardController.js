const { pool } = require("../config/db");

getDashboardStats = async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    const [rows] = await conn.query(`
      SELECT
        (SELECT COUNT(*) FROM products) AS productsCount,
        (SELECT COUNT(*) FROM categories) AS categoriesCount,
        (SELECT COUNT(*) FROM combos) AS combosCount,
        (SELECT COUNT(*) FROM products WHERE stock = 0) AS productsOutOfStock
    `);

    return res.status(200).json(rows[0]);

  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener estadísticas del dashboard",
      error
    });
  } finally {
    if (conn) conn.release(); // 🔥 CLAVE
  }
};

module.exports = { getDashboardStats };
