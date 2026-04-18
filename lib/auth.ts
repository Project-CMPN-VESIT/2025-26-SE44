import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET as string

// Create a token for a user after login
export function createToken(payload: {
  id: string
  email: string
  role: 'ADMIN' | 'VOLUNTEER'
}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Read and verify the token from the browser cookie
export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      role: 'ADMIN' | 'VOLUNTEER'
    }
    return decoded
  } catch {
    return null
  }
}