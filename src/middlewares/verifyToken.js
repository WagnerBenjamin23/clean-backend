const admin = require("../config/firebase"); 


const verifyToken = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No se proporcionó token" });
    }

    const idToken = authHeader.split(" ")[1];
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.displayName,
      roles: decodedToken.roles || []
    };

    next();
  } catch (error) {
    console.error("Error verifyToken:", error);
    return res.status(401).json({ message: "Token inválido", error: error.message });
  }
};

module.exports = { verifyToken };
