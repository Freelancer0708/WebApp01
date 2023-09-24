import { getAuth, signOut } from "firebase/auth";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { FirebaseError, initializeApp } from 'firebase/app';
import { firebaseConfig } from "@/components/FirebaseConfig";
import { UserData } from "@/components/UserData/UserData";
import { useRouter } from "next/router";
import { useAuthContext } from "@/components/AuthContext";

export default function Profile() {
    const router = useRouter();
    const { user } = useAuthContext()
    if (!user) {
        router.push("/login");
    }
    const handleSignOut = async () => {
        try {
            const auth = getAuth()
            await signOut(auth)
            router.push("/login");
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.log(e)
            }
        }
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

    return (
        <>
            <article className="w-full flex flex-col items-center justify-between px-24 py-10 bg-gray-600 mt-10 profile">
                <h1 className="pt-6 text-3xl mb-2">プロフィール</h1>
                <section className="py-6">
                    <table>
                        <tbody>
                            <tr className="border-gray-100 border-solid border-b">
                                <th className="text-left pr-10 pl-4 py-3">ユーザー名</th>
                                <td className="py-3 pr-4"><p className="w-80">{userData?.displayName}</p></td>
                            </tr>
                            <tr className="border-gray-100 border-solid border-b">
                                <th className="text-left pr-10 pl-4 py-3">メールアドレス</th>
                                <td className="py-3 pr-4"><p className="w-80">{userData?.email}</p></td>
                            </tr>
                            <tr className="border-gray-100 border-solid border-b">
                                <th className="text-left pr-10 pl-4 py-3">パスワード</th>
                                <td className="py-3 pr-4"><p className="w-80">＊＊＊＊＊＊</p></td>
                            </tr>
                            <tr className="border-gray-100 border-solid border-b">
                                <th className="text-left pr-10 pl-4 py-3">認証</th>
                                <td className="py-3 pr-4"><p className="w-80">{userData?.emailVerified ? 'True' : 'False'}</p></td>
                            </tr>
                            <tr className="border-gray-100 border-solid border-b">
                                <th className="text-left pr-10 pl-4 py-3">プロフィール画像</th>
                                <td className="py-3 pr-4"><p className="w-80">{userData?.avatar}</p></td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <Link href="/profile/edit" className="bg-blue-800 px-7 py-2">
                    修正
                </Link>

                <button className='bg-gray-800 px-7 py-2 mt-10 self-end' onClick={handleSignOut}>
                    サインアウト
                </button>
            </article>
            <style jsx>{`
@media screen and (max-width: 800px) {
    .profile table tbody tr th {
        display: block;
        padding-bottom: 0;
        text-align: left;
    }
    .profile table tbody tr td {
        display: block;
        padding-bottom: 1rem;
    }
}
            `}</style>
        </>
    )
}