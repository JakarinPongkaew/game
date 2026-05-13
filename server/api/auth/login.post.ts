import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../utils/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing credentials',
    })
  }

  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  )

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  }
})
