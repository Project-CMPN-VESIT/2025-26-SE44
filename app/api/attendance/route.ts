import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventId = request.nextUrl.searchParams.get('eventId')

    if (session.role === 'VOLUNTEER') {
      const volunteerProfile = await prisma.volunteerProfile.findUnique({
        where: { userId: session.id }
      })
      if (!volunteerProfile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      const attendance = await prisma.attendance.findMany({
        where: { volunteerProfileId: volunteerProfile.id },
        include: { event: true },
        orderBy: { markedAt: 'desc' }
      })
      return NextResponse.json(attendance)
    }

    // Admin — filter by eventId if provided
    const where = eventId ? { eventId } : {}
    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        volunteerProfile: {
          include: { user: { select: { email: true } } }
        },
        event: true
      },
      orderBy: { markedAt: 'desc' }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Attendance GET error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { volunteerProfileId, eventId, status, hoursLogged } = await request.json()

    const attendance = await prisma.attendance.upsert({
      where: { volunteerProfileId_eventId: { volunteerProfileId, eventId } },
      update: { status, hoursLogged },
      create: { volunteerProfileId, eventId, status, hoursLogged }
    })

    if (status === 'PRESENT') {
      await prisma.volunteerProfile.update({
        where: { id: volunteerProfileId },
        data: { totalHours: { increment: hoursLogged } }
      })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Attendance POST error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}