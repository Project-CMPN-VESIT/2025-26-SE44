import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalVolunteers, activeVolunteers, totalEvents, completedEvents,
      upcomingEvents, hoursData, topVolunteers, areas, presentCount, absentCount] =
      await Promise.all([
        prisma.volunteerProfile.count(),
        prisma.volunteerProfile.count({ where: { isActive: true } }),
        prisma.event.count(),
        prisma.event.count({ where: { status: 'COMPLETED' } }),
        prisma.event.count({ where: { status: 'UPCOMING' } }),
        prisma.volunteerProfile.aggregate({ _sum: { totalHours: true } }),
        prisma.volunteerProfile.findMany({
          take: 5,
          orderBy: { totalHours: 'desc' },
          include: { user: { select: { email: true } }, area: true }
        }),
        prisma.area.findMany({
          include: { _count: { select: { volunteerProfiles: true } } }
        }),
        prisma.attendance.count({ where: { status: 'PRESENT' } }),
        prisma.attendance.count({ where: { status: 'ABSENT' } })
      ])

    return NextResponse.json({
      totalVolunteers,
      activeVolunteers,
      totalEvents,
      completedEvents,
      upcomingEvents,
      totalHours: hoursData._sum.totalHours || 0,
      topVolunteers,
      areas,
      attendance: { present: presentCount, absent: absentCount }
    })
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}