const jwt = require('jsonwebtoken')

/**
 * Middleware para autenticar JWT en el header Authorization.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET no configurado' })
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' })
    }
    req.userId = decoded.userId
    next()
  })
}

module.exports = {
  authenticateToken
}
