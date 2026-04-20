import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: eventId } = await Promise.resolve(params)
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventAssignments: {
          include: {
            volunteerProfile: {
              include: { user: { select: { email: true } } }
            }
          }
        },
        _count: { select: { eventAssignments: true } }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Event details error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: eventId } = await Promise.resolve(params)
    const { title, description, location, date, status, category, slots, estimatedHours } = await request.json()

    const event = await prisma.event.update({
      where: { id: eventId },
      data: { 
        title: title ? String(title) : undefined, 
        description: description !== undefined ? String(description) : undefined, 
        location: location ? String(location) : undefined, 
        date: date ? new Date(date) : undefined,
        status: status || 'UPCOMING',
        category: category !== undefined ? String(category) : undefined,
        slots: slots !== undefined ? Number(slots) : undefined,
        estimatedHours: estimatedHours !== undefined ? Number(estimatedHours) : undefined
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: eventId } = await Promise.resolve(params)
    await prisma.event.delete({ where: { id: eventId } })

    return NextResponse.json({ message: 'Event deleted' })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
