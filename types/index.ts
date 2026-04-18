export type User = {
  id: string
  email: string
  role: 'ADMIN' | 'VOLUNTEER'
  createdAt: Date
}

export type VolunteerProfile = {
  id: string
  userId: string
  name: string
  phone: string
  totalHours: number
  isActive: boolean
  areaId: string
  createdAt: Date
}

export type Area = {
  id: string
  name: string
}

export type Skill = {
  id: string
  name: string
}

export type Event = {
  id: string
  title: string
  description: string
  location: string
  date: Date
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  createdAt: Date
}

export type EventAssignment = {
  id: string
  volunteerProfileId: string
  eventId: string
  status: 'ASSIGNED' | 'CONFIRMED' | 'WITHDRAWN'
  assignedAt: Date
}

export type Attendance = {
  id: string
  volunteerProfileId: string
  eventId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE'
  hoursLogged: number
  markedAt: Date
}