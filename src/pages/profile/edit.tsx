import { getAuth } from "firebase/auth";
import { useState, useEffect, FormEvent } from 'react';
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "@/components/FirebaseConfig";
import { useRouter } from 'next/router';

interface UserData {
    displayName: string;
    email: string;
    emailVerified: boolean;
    photoURL: string;
}

interface EditUserData {
    displayName: string;
    email: string;
    password: string;
    emailVerified: boolean;
    photoURL: string;
}

export default function EditProfile() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [editUserData, setEditUserData] = useState<EditUserData | null>(null);
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
                    console.log("displayName: "+doc.data().displayName)
                    console.log("email: "+doc.data().email)
                    console.log("emailVerified: "+doc.data().emailVerified)
                    console.log("photoURL: "+doc.data().photoURL)
                }


            });
        }
        fetchData();
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const auth = getAuth();
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const user = auth.currentUser;
        if(user?.uid) {
            return setDoc(doc(db, "users", user.uid), {
                // displayName: "None",
                // email: email,
                // emailVerified: false,
                // photoURL: ""
            });
        }

        router.push("/profile");
    }

    return (
        <>
            <article className="w-full flex flex-col items-center justify-between px-24 py-10 bg-gray-600 mt-10">
                <h1 className="pt-6 text-3xl mb-2">プロフィール編集画面</h1>
                <section className="pt-6">
                    <form onSubmit={handleSubmit} className="flex flex-col justify-start items-center">
                        <table className="mb-6 flex-table">
                            <tbody>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">ユーザー名</th>
                                    <td className="py-3 pr-4"><input type="text" name="displayName" value={editUserData?.displayName} placeholder={userData?.displayName} className="bg-gray-600 border-b outline-none w-80"/></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">メールアドレス</th>
                                    <td className="py-3 pr-4"><input type="text" name="email" value={editUserData?.email} placeholder={userData?.email} className="bg-gray-600 border-b outline-none w-80"/></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">パスワード</th>
                                    <td className="py-3 pr-4"><input type="text" name="password" value={editUserData?.password} placeholder="＊＊＊＊＊＊" className="bg-gray-600 border-b outline-none w-80"/></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">認証</th>
                                    <td className="py-3 pr-4"><input type="text" name="emailVerified" placeholder={editUserData?.emailVerified ? 'True' : 'False'} className="bg-gray-600 border-b outline-none w-80"/></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">プロフィール画像</th>
                                    <td className="py-3 pr-4"><input type="text" name="photoURL" placeholder={editUserData?.photoURL} className="bg-gray-600 border-b outline-none w-80"/></td>
                                </tr>
                            </tbody>
                        </table>
                        <button type="submit" className="bg-blue-800 px-7 py-2">保存</button>
                    </form>

                </section>
            </article>
        </>
    )
}