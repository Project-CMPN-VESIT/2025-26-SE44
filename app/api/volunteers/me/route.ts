import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.id },
      include: {
        area: true,
        volunteerSkills: { include: { skill: true } }
      }
    })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const profile = await prisma.volunteerProfile.update({
      where: { userId: session.id },
      data: { isActive: body.isActive }
    })
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
