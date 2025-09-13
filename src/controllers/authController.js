const pool = require('../config/db');
const admin = require('../config/firebase');

//REGISTRO DE USUARIOS
registerUser = async (req, res) => {
  const { email, name, password, role_id } = req.body;
  console.log(req.body);

  try {
     // Creo usuario en Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // Inserto en mi base de datos
    await pool.query(
      "INSERT INTO users (firebase_uid, email, name, password, roles_idrole) VALUES (?, ?, ?, ?, ?)",
      [uid, email, name, password, role_id]
    );

    return res.status(201).json({ message: "Usuario registrado en BD ", uid });
  } catch (error) {
    return res.status(500).json({ message: "Error al registrar usuario", error });
  }
};


//LOGIN DE USUARIOS
loginUser = async (req, res) => {
  const { email, password } = req.body; 

  if (!email || !password) {
    return res.status(400).json({ message: "Email y password son requeridos" });
  }

  try{
    apiKey = process.env.API_KEY;
  
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });
    
     const data = await response.json();

    if (data.error) {
      return res.status(401).json({ message: "Credenciales inválidas", error: data.error.message });
    }

     const [rows] = await pool.query("SELECT * FROM users WHERE firebase_uid = ?", [data.localId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado en la base de datos" });
    }

    const user = rows[0];

    // Retorno datos del usuario y token de Firebase
    return res.status(200).json({
      message: "Login exitoso",
      uid: data.localId,
      email: user.email,
      name: user.name,
      roles_idRole: user.roles_idrole,
      idToken: data.idToken 
    });
  }catch(error){
    return res.status(500).json({ message: "Error en el proceso de login", error });
  }
}

module.exports = { registerUser, loginUser };
