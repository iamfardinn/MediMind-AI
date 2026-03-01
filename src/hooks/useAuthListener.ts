import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuthStore } from '../store/useAuthStore'

export function useAuthListener() {
  const setUser    = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    setLoading(true)
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {        setUser({
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL:    firebaseUser.photoURL,
          createdAt:   firebaseUser.metadata.creationTime ?? null,
        })
      } else {
        setUser(null)
        setLoading(false)
      }
    })
    return () => unsub()
  }, [setUser, setLoading])
}
