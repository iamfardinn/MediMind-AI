// Firestore CRUD for doctor appointments
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp,
  getDoc,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled'
export type ConsultationType  = 'video' | 'in-person'

export interface Appointment {
  id: string
  userId: string
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  doctorPhoto: string
  consultationType: ConsultationType
  date: string            // 'YYYY-MM-DD'
  time: string            // 'HH:mm'
  fee: number
  status: AppointmentStatus
  notes: string
  createdAt: Date | null
}

const COLLECTION = 'appointments'

/** Book a new appointment */
export async function bookAppointment(data: Omit<Appointment, 'id' | 'createdAt'>) {
  // Generate a doc ref with auto-ID, then use setDoc so we can
  // independently verify the write landed (addDoc can hang silently
  // when Firestore rules deny the write).
  const colRef = collection(db, COLLECTION)
  const docRef = doc(colRef)          // auto-generated ID
  const payload = { ...data, createdAt: serverTimestamp() }

  await setDoc(docRef, payload)

  // Verify the document actually exists (catches silent permission denials)
  const snap = await getDoc(docRef)
  if (!snap.exists()) {
    throw new Error(
      'Firestore write was silently rejected. Please check your Firestore security rules — ' +
      'make sure authenticated users can create documents in the "appointments" collection.'
    )
  }

  return docRef.id
}

/** Cancel an appointment */
export async function cancelAppointment(appointmentId: string) {
  const ref = doc(db, COLLECTION, appointmentId)
  await updateDoc(ref, { status: 'cancelled' })
}

/** Mark appointment as completed */
export async function completeAppointment(appointmentId: string) {
  const ref = doc(db, COLLECTION, appointmentId)
  await updateDoc(ref, { status: 'completed' })
}

/** Delete an appointment */
export async function deleteAppointment(appointmentId: string) {
  const ref = doc(db, COLLECTION, appointmentId)
  await deleteDoc(ref)
}

/** Real-time listener for a user's appointments */
export function onAppointmentsChange(
  userId: string,
  callback: (appointments: Appointment[]) => void,
) {
  // Only filter by userId — sort client-side to avoid requiring a composite index
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
  )

  return onSnapshot(
    q,
    (snap) => {
      const items: Appointment[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          userId:           data.userId,
          doctorId:         data.doctorId,
          doctorName:       data.doctorName,
          doctorSpecialty:  data.doctorSpecialty,
          doctorPhoto:      data.doctorPhoto,
          consultationType: data.consultationType ?? 'video',
          date:             data.date,
          time:             data.time,
          fee:              data.fee,
          status:           data.status ?? 'upcoming',
          notes:            data.notes ?? '',
          createdAt:        (data.createdAt as Timestamp)?.toDate?.() ?? null,
        }
      })
      // Sort by date descending (newest first) — done client-side
      items.sort((a, b) => b.date.localeCompare(a.date))
      callback(items)
    },
    (error) => {
      console.error('[appointments] onSnapshot error:', error)
      // If it's an index error, the link to create it will be in the message
      if (error.message?.includes('index')) {
        console.error('[appointments] A Firestore composite index is required. Check the error above for the link to create it.')
      }
      // Still deliver empty list so the UI isn't stuck loading
      callback([])
    },
  )
}
