import { useAuthContext } from '../AuthContext'
import { FirebaseError } from '@firebase/util'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/router';
import { UserData } from '../UserData/UserData';
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "@/components/FirebaseConfig";
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export default function LoginStatus() {
    const router = useRouter();
    const { user } = useAuthContext()

    const handleProfile = async () => {
        router.push("/profile");
    }

    const [userData, setUserData] = useState<UserData | null>(null);
    useEffect(() => {
        async function fetchData() {
            const auth = getAuth();
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const querySnapshot = await getDocs(collection(db, "users"));
            querySnapshot.forEach((doc) => {
                const currentUser = auth.currentUser;
                if (currentUser && currentUser.uid === doc.id) {
                    setUserData({
                        displayName: doc.data().displayName,
                        email: doc.data().email,
                        emailVerified: doc.data().emailVerified,
                        avatar: doc.data().avatar
                    });
                }
            });
        }
        fetchData();
    }, []);

    const storage = getStorage();
    const [avatarUrl, setAvatarUrl] = useState("");
    useEffect(() => {
        getDownloadURL(ref(storage, "avatar/" + user?.uid + "/" + userData?.avatar))
        .then((url) => {
            console.log("url::"+url)
            setAvatarUrl(url)
          })
          .catch((error) => {
          });
    }, [user, userData, storage]);

    if (user) {
        return (
            <>
                <article className='flex flex-col items-end'>
                    <p className='cursor-pointer'>
                        {avatarUrl? <img src={avatarUrl} alt="" className='w-10 h-10 rounded-full align-middle border-none object-cover ' onClick={handleProfile} /> :userData?.displayName}
                    </p>
                </article>
            </>
        )
    }
}