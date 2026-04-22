import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const volunteers = await prisma.volunteerProfile.findMany({
      include: {
        user: { select: { email: true, role: true } },
        area: true,
        volunteerSkills: { include: { skill: true } },
        eventAssignments: {
          where: { status: 'CONFIRMED' },
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(volunteers)
  } catch (error) {
    console.error('Volunteers error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, approvalStatus } = await request.json()

    if (!id || !approvalStatus) {
      return NextResponse.json({ error: 'Missing id or approvalStatus' }, { status: 400 })
    }

    const updated = await prisma.volunteerProfile.update({
      where: { id },
      data: { 
        approvalStatus,
        isActive: approvalStatus === 'APPROVED' ? true : false
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Volunteer update error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}