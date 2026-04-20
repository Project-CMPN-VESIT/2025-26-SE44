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
      upcomingEvents, hoursData, topVolunteers, areas, presentCount, absentCount,
      upcomingEventsList, recentVolunteers, last30DaysSignups, eventsByCategory, weeklyAttendance] =
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
        prisma.attendance.count({ where: { status: 'ABSENT' } }),
        prisma.event.findMany({
          where: { status: 'UPCOMING' },
          orderBy: { date: 'asc' },
          take: 4
        }),
        prisma.volunteerProfile.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { user: { select: { email: true } }, area: true }
        }),
        prisma.volunteerProfile.findMany({
          select: { createdAt: true },
          where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } }
        }),
        prisma.event.groupBy({
          by: ['category'],
          _count: { _all: true }
        }),
        prisma.attendance.findMany({
          where: { status: 'PRESENT', markedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 28)) } },
          select: { hoursLogged: true, markedAt: true }
        })
      ])

    // Group signups by date manually for simple bar chart data
    const signupsMap: Record<string, number> = {}
    last30DaysSignups.forEach(s => {
      const d = s.createdAt.toISOString().split('T')[0]
      signupsMap[d] = (signupsMap[d] || 0) + 1
    })

    const chartData = Object.entries(signupsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10) // Last 10 days of signups

    return NextResponse.json({
      totalVolunteers,
      activeVolunteers,
      totalEvents,
      completedEvents,
      upcomingEvents,
      totalHours: hoursData._sum.totalHours || 0,
      topVolunteers,
      areas,
      attendance: { present: presentCount, absent: absentCount },
      upcomingEventsList,
      recentVolunteers,
      signupsChartData: chartData,
      eventsByCategory,
      weeklyAttendance
    })
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}