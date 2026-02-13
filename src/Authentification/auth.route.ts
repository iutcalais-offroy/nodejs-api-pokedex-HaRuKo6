import { NextFunction, Request, Response, Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../database'
import { env } from '../env'

export const authRouter = Router()

/**
 * POST /api/auth/sign-up
 * Creates a new user account with email, username, and password.
 * Hashes the password and generates a JWT token for authentication.
 * @param {Request} req - Express request object containing user data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with token and user info or error
 * @throws {Error} Returns 400 if required fields are missing
 * @throws {Error} Returns 409 if email is already in use
 * @throws {Error} Returns 500 for internal server errors
 * @example
 * POST /api/auth/sign-up
 * Body: { "email": "user@example.com", "username": "testuser", "password": "password123" }
 * Response: { "token": "jwt-token", "user": { "id": 1, "email": "user@example.com", "username": "testuser", "createdAt": "2023-01-01T00:00:00.000Z" } }
 */
authRouter.post('/sign-up', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body

    // Validation des données
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: 'Email, username, and password are required' })
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    })

    // Générer le token JWT (validité 7 jours)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    // Retourner le token et les infos utilisateur
    res.status(201).json({
      token,
      user,
    })
    return
  } catch (error) {
    console.error('Sign-up error:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

/**
 * POST /api/auth/sign-in
 * Authenticates a user with email and password.
 * Verifies credentials and generates a JWT token for authenticated sessions.
 * @param {Request} req - Express request object containing login credentials in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with token and user info or error
 * @throws {Error} Returns 400 if required fields are missing
 * @throws {Error} Returns 401 if email or password is invalid
 * @throws {Error} Returns 500 for internal server errors
 * @example
 * POST /api/auth/sign-in
 * Body: { "email": "user@example.com", "password": "password123" }
 * Response: { "token": "jwt-token", "user": { "id": 1, "email": "user@example.com", "username": "testuser", "createdAt": "2023-01-01T00:00:00.000Z" } }
 */
authRouter.post('/sign-in', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Récupérer l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Générer le token JWT (validité 7 jours)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    // Retourner le token et les infos utilisateur (sans le mot de passe)
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    })
    return
  } catch (error) {
    console.error('Sign-in error:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

// Étendre le type Request pour ajouter user

/**
 * Middleware to authenticate JWT tokens.
 * Verifies the JWT token from the Authorization header and attaches user info to the request.
 * @param {Request} req - Express request object with potential Authorization header
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function to continue to the next middleware
 * @throws {Error} Returns 401 if token is missing or invalid
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Format: "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  try {
    // 2. Vérifier et décoder le token
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: number
      email: string
    }

    // 3. Ajouter user à la requête pour l'utiliser dans les routes
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    }

    // 4. Passer au prochain middleware ou à la route
    next()
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' })
    return
  }
}
