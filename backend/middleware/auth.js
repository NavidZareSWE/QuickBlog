import jwt from "jsonwebtoken";

const auth = async (req, res, callback) => {
  const  token  = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized - Login Again" });
  }
  try {
    // This line of code verifies the JWT (JSON Web Token) provided in the 'token' variable
    // It uses the secret key stored in the environment variable 'JWT_SECRET' to decode the token
    // The decoded token, which contains the user's information, is stored in the 'token_decode' variable
    jwt.verify(token, process.env.JWT_SECRET);
    callback();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default auth;
