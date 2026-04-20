import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pendingVolunteers = await prisma.volunteerProfile.findMany({
      where: { approvalStatus: 'PENDING' },
      include: {
        user: { select: { email: true } },
        area: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(pendingVolunteers)
  } catch (error) {
    console.error('Pending volunteers GET error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { volunteerProfileId, action } = await request.json()

    if (!volunteerProfileId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const updatedProfile = await prisma.volunteerProfile.update({
      where: { id: volunteerProfileId },
      data: {
        approvalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        isActive: action === 'APPROVE'
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Pending volunteers PUT error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
