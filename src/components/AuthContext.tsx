import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'
import {User, getAuth, onAuthStateChanged } from 'firebase/auth'
import { firebaseConfig } from './FirebaseConfig'
import { initializeApp } from 'firebase/app'

export type GlobalAuthState = {
    user: User | null | undefined
}
const initialState: GlobalAuthState = {
    user: undefined,
}
const AuthContext = createContext<GlobalAuthState>(initialState)

type Props = { children: ReactNode }

export const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<GlobalAuthState>(initialState)
    const app = initializeApp(firebaseConfig);

    useEffect(() => {
        try {
            const auth = getAuth()
            return onAuthStateChanged(auth, (user) => {
                setUser({
                    user,
                })
            })
        } catch (error) {
            setUser(initialState)
            throw error
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)