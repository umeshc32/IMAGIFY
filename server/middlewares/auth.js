import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({ success: false, message: 'Not Authorized. Login Again' });
  }

  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenData.id) {
      req.userId = tokenData.id;  // ✅ safer than req.body.userId
      next();
    } else {
      return res.json({ success: false, message: 'Not Authorized. Login Again' });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;

