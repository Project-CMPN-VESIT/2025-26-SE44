import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { eventId, volunteerProfileId } = await request.json()
    const assignment = await prisma.eventAssignment.upsert({
      where: { volunteerProfileId_eventId: { volunteerProfileId, eventId } },
      update: { status: 'ASSIGNED' },
      create: { volunteerProfileId, eventId, status: 'ASSIGNED' }
    })
    await prisma.attendance.upsert({
      where: { volunteerProfileId_eventId: { volunteerProfileId, eventId } },
      update: {},
      create: { volunteerProfileId, eventId, status: 'ABSENT', hoursLogged: 0 }
    })
    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Assignment error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
