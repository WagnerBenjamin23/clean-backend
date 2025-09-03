const pool = require('../config/db');

testConnection = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM roles'); 
    return res.status(200).json({"roles":rows});
  } catch (err) {
    return res.status(404).json({"Error":"Error al obtener los roles"});
  }
}

module.exports={testConnection}