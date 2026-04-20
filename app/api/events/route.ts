import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true'

    // If ?all=true or user is ADMIN, return all events
    if (session.role === 'ADMIN' || showAll) {
      const events = await prisma.event.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          date: true,
          status: true,
          slots: true,
          category: true,
          estimatedHours: true,
          _count: { select: { eventAssignments: true } }
        },
        orderBy: { date: 'asc' }
      })
      return NextResponse.json(events)
    }

    // Volunteer without ?all: return their assignments
    const volunteerProfile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.id }
    })
    if (!volunteerProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    const assignments = await prisma.eventAssignment.findMany({
      where: { volunteerProfileId: volunteerProfile.id },
      include: { event: true },
      orderBy: { event: { date: 'asc' } }
    })
    return NextResponse.json(assignments)

  } catch (error) {
    console.error('Events error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, location, date, category, slots, estimatedHours } = await request.json()

    if (!title || !date || !location) {
      return NextResponse.json({ error: 'Title, date and location are required' }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: { 
        title: String(title), 
        description: description ? String(description) : "", 
        location: String(location), 
        date: new Date(date), 
        category: category ? String(category) : 'Community', 
        slots: slots ? Number(slots) : 20, 
        estimatedHours: estimatedHours ? Number(estimatedHours) : 4, 
        status: 'UPCOMING' 
      }
    })

    return NextResponse.json(event, { status: 201 })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}