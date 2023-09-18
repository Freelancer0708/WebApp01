import { useAuthContext } from '../AuthContext'
import { FirebaseError } from '@firebase/util'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/router';

export default function LoginStatus() {
    const router = useRouter();
    const { user } = useAuthContext()
    const handleSignOut = async () => {
        try {
            const auth = getAuth()
            await signOut(auth)
            router.push("login");
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.log(e)
            }
        }
    }

    if(user){
        return (
            <>
                <article className='flex flex-col items-end'>
                    <p className='mb-2'>
                        {user.email}
                    </p>
                    <div>
                        <button className='bg-blue-800 px-7 py-2' onClick={handleSignOut}>
                            サインアウト
                        </button>
                    </div>
                </article>
            </>
        )
    }
}