import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST: Admin assigns a volunteer to an event (sends invite)
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { eventId, volunteerProfileId } = await request.json()

    // Check if already assigned
    const existing = await prisma.eventAssignment.findUnique({
      where: { volunteerProfileId_eventId: { volunteerProfileId, eventId } }
    })

    if (existing) {
      return NextResponse.json({ error: 'Volunteer has already been invited to this event' }, { status: 400 })
    }

    const assignment = await prisma.eventAssignment.create({
      data: { volunteerProfileId, eventId, status: 'ASSIGNED' }
    })
    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Assignment error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// PUT: Volunteer accepts or rejects an assignment
export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId, action } = await request.json()

    if (!assignmentId || !['ACCEPT', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const newStatus = action === 'ACCEPT' ? 'CONFIRMED' : 'WITHDRAWN'

    const assignment = await prisma.eventAssignment.update({
      where: { id: assignmentId },
      data: { status: newStatus }
    })

    // If accepted, also create an attendance record
    if (action === 'ACCEPT') {
      await prisma.attendance.upsert({
        where: {
          volunteerProfileId_eventId: {
            volunteerProfileId: assignment.volunteerProfileId,
            eventId: assignment.eventId
          }
        },
        update: {},
        create: {
          volunteerProfileId: assignment.volunteerProfileId,
          eventId: assignment.eventId,
          status: 'UNMARKED',
          hoursLogged: 0
        }
      })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Assignment update error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// GET: Get assignments for the logged-in volunteer
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the volunteer's profile
    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.id }
    })

    if (!profile) {
      return NextResponse.json([])
    }

    // Get all their assignments with event details
    const assignments = await prisma.eventAssignment.findMany({
      where: { volunteerProfileId: profile.id },
      include: {
        event: true
      },
      orderBy: { assignedAt: 'desc' }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Assignments fetch error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
