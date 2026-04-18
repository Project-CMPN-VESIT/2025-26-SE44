import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone, area } = body

    if (!email || !password || !name || !phone || !area) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Find or create area
    const areaRecord = await prisma.area.upsert({
      where: { name: area },
      update: {},
      create: { name: area }
    })

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'VOLUNTEER',
        volunteerProfile: {
          create: {
            name,
            phone,
            areaId: areaRecord.id
          }
        }
      }
    })

    return NextResponse.json(
      { message: 'Account created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}