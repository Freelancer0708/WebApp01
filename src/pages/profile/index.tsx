import { getAuth } from "firebase/auth";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "@/components/FirebaseConfig";

interface UserData {
    displayName: string;
    email: string;
    emailVerified: boolean;
    photoURL: string;
}

export default function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    useEffect(() => {
        async function fetchData() {
            const auth = getAuth();
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const querySnapshot = await getDocs(collection(db, "users"));
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                const user = auth.currentUser;
                console.log(doc.id, " => ", doc.data());
                if (user && user.uid === doc.id) {
                    setUserData({
                        displayName: doc.data().displayName,
                        email: doc.data().email,
                        emailVerified: doc.data().emailVerified,
                        photoURL: doc.data().photoURL
                    });
                    console.log("displayName: " + doc.data().displayName)
                    console.log("email: " + doc.data().email)
                    console.log("emailVerified: " + doc.data().emailVerified)
                    console.log("photoURL: " + doc.data().photoURL)
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
                                {/* <td className="py-3 pr-4">{userData?.email}</td> */}
                                <td className="py-3 pr-4"><p className="w-80">＊＊＊＊＊＊</p></td>
                            </tr>
                            <tr className="border-gray-100 border-solid border-b">
                                <th className="text-left pr-10 pl-4 py-3">認証</th>
                                <td className="py-3 pr-4"><p className="w-80">{userData?.emailVerified ? 'True' : 'False'}</p></td>
                            </tr>
                            <tr className="border-gray-100 border-solid border-b">
                                <th className="text-left pr-10 pl-4 py-3">プロフィール画像</th>
                                <td className="py-3 pr-4"><p className="w-80">{userData?.photoURL}</p></td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <Link href="/profile/edit" className="bg-blue-800 px-7 py-2">
                    修正
                </Link>
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