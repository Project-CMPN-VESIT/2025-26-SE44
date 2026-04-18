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
        volunteerSkills: { include: { skill: true } }
      },
      orderBy: { totalHours: 'desc' }
    })

    return NextResponse.json(volunteers)
  } catch (error) {
    console.error('Volunteers error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}