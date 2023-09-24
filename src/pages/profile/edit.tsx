import { getAuth } from "firebase/auth";
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "@/components/FirebaseConfig";
import { useRouter } from 'next/router';
import Link from "next/link";
import { UserData } from "@/components/UserData/UserData";
import { getStorage, ref, uploadBytes } from "firebase/storage";

export default function EditProfile() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailVerified, setEmailVerified] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);

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

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const image = e.target.files[0];
            console.log(image);
            setAvatar(image);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const auth = getAuth();
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const storage = getStorage(app);
        const currentUser = auth.currentUser;

        async function fetchData() {
            if (avatar) {
                const mountainImagesRef = ref(storage, 'avatar/' + currentUser?.uid + '/' + avatar.name);
                await uploadBytes(mountainImagesRef, avatar)
            }
        }
        fetchData();

        if (displayName == "" && userData?.displayName) {
            setDisplayName(userData.displayName)
        }
        if (email == "" && userData?.email) {
            setEmail(userData.email)
        }
        if (emailVerified == "" && userData?.emailVerified) {
            if (userData?.emailVerified == true) {
                setEmailVerified("True")
            } else if (userData?.emailVerified == false) {
                setEmailVerified("False")
            }
        }

        if (currentUser?.uid && displayName != "" && email != "" && emailVerified != "" && avatar != null) {
            return setDoc(doc(db, "users", currentUser.uid), {
                displayName: displayName,
                email: email,
                emailVerified: emailVerified,
                avatar: avatar?.name
            });
        }

        router.push("/profile");
    }

    return (
        <>
            <article className="w-full flex flex-col items-center justify-between px-24 py-10 bg-gray-600 mt-10">
                <h1 className="pt-6 text-3xl mb-2">プロフィール編集画面</h1>
                <Link href="/profile" className="back">戻る</Link>
                <section className="pt-6">
                    <form onSubmit={handleSubmit} className="flex flex-col justify-start items-center">
                        <table className="mb-6 flex-table">
                            <tbody>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">ユーザー名</th>
                                    <td className="py-3 pr-4"><input type="text" name="displayName" value={displayName || ''} placeholder={userData?.displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">メールアドレス</th>
                                    <td className="py-3 pr-4"><input type="text" name="email" value={email || ''} placeholder={userData?.email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">パスワード</th>
                                    <td className="py-3 pr-4"><input type="text" name="password" value={password || ''} placeholder="＊＊＊＊＊＊" onChange={(e) => setPassword(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">認証</th>
                                    <td className="py-3 pr-4"><input type="text" name="emailVerified" value={emailVerified} placeholder={userData?.emailVerified ? 'True' : 'False'} onChange={(e) => setEmailVerified(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">プロフィール画像</th>
                                    <td className="py-3 pr-4"><input type="file" name="avatar" onChange={handleImage} className="bg-gray-600 border-b outline-none w-80" accept="image/*" /></td>
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