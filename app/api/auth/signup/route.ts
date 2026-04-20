import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, city, skills } = body

    if (!email || !password || !firstName || !phone || !city) {
      return NextResponse.json({ error: 'All necessary fields are required' }, { status: 400 })
    }

    const name = `${firstName} ${lastName || ''}`.trim()

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Find or create area (using city)
    const areaRecord = await prisma.area.upsert({
      where: { name: city },
      update: {},
      create: { name: city }
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
            areaId: areaRecord.id,
            isActive: false,
            approvalStatus: 'PENDING'
          }
        }
      },
      include: { volunteerProfile: true }
    })

    // Assign skills if provided
    if (skills && Array.isArray(skills) && user.volunteerProfile) {
      for (const skillName of skills) {
        // Uniquely find or create the skill
        const sRecord = await prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName }
        })
        await prisma.volunteerSkill.create({
          data: {
            volunteerProfileId: user.volunteerProfile.id,
            skillId: sRecord.id
          }
        })
      }
    }

    return NextResponse.json(
      { message: 'Account created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}