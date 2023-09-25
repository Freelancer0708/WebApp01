import { EmailAuthProvider, deleteUser, getAuth, reauthenticateWithCredential, sendEmailVerification, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "@/components/FirebaseConfig";
import { useRouter } from 'next/router';
import Link from "next/link";
import { UserData } from "@/components/UserData/UserData";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

export default function EditProfile() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [nowEmail, setNowEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [nowPassword, setNowPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
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
            setAvatar(image);
        }
    };

    const handleSubmitMain = (e: FormEvent) => {
        e.preventDefault();
        const auth = getAuth();
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const currentUser = auth.currentUser;
        if (currentUser && nowEmail && nowPassword) {
            const credential = EmailAuthProvider.credential(
                nowEmail,
                nowPassword
            )
            reauthenticateWithCredential(currentUser, credential)
                .then(() => {
                    if (newEmail) {
                        updateEmail(currentUser, newEmail)
                            .then(() => {
                                sendEmailVerification(currentUser);
                            });
                    }

                    if (newPassword) {
                        updatePassword(currentUser, newPassword)
                    }
                });
        }

        if (currentUser?.uid && newEmail) {
            setDoc(doc(db, "users", currentUser.uid), {
                displayName: userData?.displayName,
                email: newEmail,
                emailVerified: userData?.emailVerified ? "True" : "False",
                avatar: userData?.avatar
            });
        }
        router.push("/profile");
    }

    const handleSubmitProfile = (e: FormEvent) => {
        e.preventDefault();
        const auth = getAuth();
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const storage = getStorage(app);
        const currentUser = auth.currentUser;

        async function fetchDataStorage() {
            if (avatar) {
                const mountainImagesRef = ref(storage, 'avatar/' + currentUser?.uid + '/' + avatar.name);
                await uploadBytes(mountainImagesRef, avatar)
            }
            if (avatar && currentUser && currentUser?.uid && userData?.avatar) {
                getDownloadURL(ref(storage, "avatar/" + currentUser?.uid + "/" + userData?.avatar))
                    .then((url) => {
                        updateProfile(currentUser, {
                            photoURL: url
                        });
                    });
            }
        }
        fetchDataStorage();

        if (currentUser && displayName) {
            updateProfile(currentUser, {
                displayName: displayName
            });
        }

        if (currentUser?.uid) {
            setDoc(doc(db, "users", currentUser.uid), {
                displayName: displayName ? displayName : userData?.displayName,
                email: userData?.email,
                emailVerified: emailVerified ? emailVerified : (userData?.emailVerified ? "True" : "False"),
                avatar: avatar?.name ? avatar?.name : userData?.avatar
            });
        }
        router.push("/profile");
    }

    const handleDeleteUser = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
            deleteUser(currentUser);
        }
        router.push("/register");
    }

    return (
        <>
            <article className="w-full flex flex-col items-center justify-between px-24 py-10 bg-gray-600 mt-10">
                <h1 className="pt-6 text-3xl mb-2">プロフィール編集画面</h1>
                <section className="pt-6 px-4">
                    <h2 className="bg-gray-900 px-2 py-2 text-center">Profile</h2>
                    <form onSubmit={handleSubmitProfile} className="flex flex-col justify-start items-center">
                        <table className="mb-6 flex-table">
                            <tbody>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">ユーザー名</th>
                                    <td className="py-3 pr-4"><input type="text" name="displayName" placeholder={userData?.displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                                {/* <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">認証</th>
                                    <td className="py-3 pr-4"><input type="text" name="emailVerified" placeholder={userData?.emailVerified ? 'True' : 'False'} onChange={(e) => setEmailVerified(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr> */}
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">プロフィール画像</th>
                                    <td className="py-3 pr-4"><input type="file" name="avatar" onChange={handleImage} className="bg-gray-600 border-b outline-none w-80" accept="image/*" /></td>
                                </tr>
                            </tbody>
                        </table>
                        <button type="submit" className="bg-blue-800 px-7 py-2">保存</button>
                    </form>
                </section>
                <section className="mt-8 pt-2 pb-4 px-4 bg-gray-900">
                    <h2 className=" px-2 py-2 text-center">MAIN</h2>
                    <p className="text-center text-sm leading-relaxed py-4">※メールアドレスとパスワードを変更する際は、<br />現在のメールアドレスとパスワードの入力をお願い致します。</p>
                    <form onSubmit={handleSubmitMain} className="flex flex-col justify-start items-center">
                        <table className="mb-10 flex-table">
                            <tbody>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">メールアドレス</th>
                                    <td className="py-3 pr-4"><input type="text" name="email" placeholder={userData?.email} onChange={(e) => setNowEmail(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">パスワード</th>
                                    <td className="py-3 pr-4"><input type="text" name="password" placeholder="＊＊＊＊＊＊" onChange={(e) => setNowPassword(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="mb-6 flex-table">
                            <tbody>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">新メールアドレス</th>
                                    <td className="py-3 pr-4"><input type="text" name="email" placeholder={userData?.email} onChange={(e) => setNewEmail(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">新パスワード</th>
                                    <td className="py-3 pr-4"><input type="text" name="password" placeholder="＊＊＊＊＊＊" onChange={(e) => setNewPassword(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                            </tbody>
                        </table>
                        <button type="submit" className="bg-blue-800 px-7 py-2">保存</button>
                    </form>
                </section>
                <div className="w-full flex items-center justify-between mt-10">
                    <Link href="/profile" className="back bg-gray-800 px-7 py-2">戻る</Link>
                    <button className='bg-red-800 px-7 py-2' onClick={handleDeleteUser}>
                        アカウント削除
                    </button>
                </div>
            </article>
        </>
    )
}