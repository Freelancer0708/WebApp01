import { EmailAuthProvider, deleteUser, getAuth, reauthenticateWithCredential, sendEmailVerification, sendPasswordResetEmail, updateEmail, updatePassword, updateProfile } from "firebase/auth";
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
    const [nowError, setNowError] = useState("");
    const [newError, setNewError] = useState("");
    const [sendPassword, setSendPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState("");
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
        setNowError("");
        setNewError("");
        if (currentUser && nowEmail && nowPassword) {
            const credential = EmailAuthProvider.credential(
                nowEmail,
                nowPassword
            )
            reauthenticateWithCredential(currentUser, credential)
                .then(() => {
                    if (newEmail && nowEmail != newEmail) {
                        updateEmail(currentUser, newEmail)
                            .then(() => {
                                sendEmailVerification(currentUser)
                                    .then(() => {
                                        if (currentUser?.uid && newEmail) {
                                            setDoc(doc(db, "users", currentUser.uid), {
                                                displayName: userData?.displayName,
                                                email: newEmail,
                                                avatar: userData?.avatar
                                            });
                                        }
                                        router.push("/profile");
                                    });
                            })
                            .catch((error) => {
                                const errorCode = error.code;
                                if (errorCode == "auth/invalid-email") {
                                    setNewError("有効なメールアドレスを入力してください。");
                                } else if (errorCode == "auth/email-already-in-use") {
                                    setNewError("このメールアドレスは既に登録されています。");
                                } else if (errorCode == "auth/requires-recent-login") {
                                    setNewError("最終サインイン時間がかなり前の為、もう一度ログアウトしてログインしてください。");
                                } else {
                                    setNewError("登録に問題が発生しました。しばらくしてから再度お試しください。");
                                }
                            });
                    } else if (newEmail && nowEmail == newEmail) {
                        setNewError("このメールアドレスは既に登録されています。");
                    }
                })
                .catch((error) => {
                    const errorCode = error.code;
                    if (errorCode == "auth/user-mismatch") {
                        setNowError("登録した内容と一致しません。");
                    } else if (errorCode == "auth/user-not-found") {
                        setNowError("ユーザーが見つかりません。別の情報を入力してください。");
                    } else if (errorCode == "auth/invalid-credential") {
                        setNowError("このユーザーは現在無効になっております。");
                    } else if (errorCode == "auth/invalid-email") {
                        setNowError("メールアドレスの形式が正しくありません。");
                    } else if (errorCode == "auth/wrong-password") {
                        setNowError("パスワードが正しくありません。");
                    } else if (errorCode == "auth/invalid-verification-code") {
                        setNowError("認証情報の検証コードが無効になっております。");
                    } else if (errorCode == "auth/invalid-verification-id") {
                        setNowError("認証情報の検証IDが無効になっております。");
                    } else {
                        setNowError("確認に問題が発生しました。しばらくしてから再度お試しください。");
                    }
                });
        }
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
                avatar: avatar?.name ? avatar?.name : userData?.avatar
            });
        }
        router.push("/profile");
    }

    const handleSubmitPassword = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser?.email) {
            sendPasswordResetEmail(auth, currentUser.email)
                .then(() => {
                    const message = currentUser?.email + "にてパスワードの再設定メールを送信いたしました。";
                    if (currentUser?.email) {
                        setSendPassword(currentUser?.email)
                    }
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode)
                    console.log(errorMessage)
                });
        }
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
                    <p className="text-center text-sm leading-relaxed py-4">※メールアドレスを変更する際は、現在の<br />メールアドレスとパスワードの入力をお願い致します。</p>
                    <form onSubmit={handleSubmitMain} className="flex flex-col justify-start items-center mb-6">
                        <h3 className="text-center text-sm font-semibold">{nowError}</h3>
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
                        <h3 className="text-center text-sm font-semibold">{newError}</h3>
                        <table className="mb-6 flex-table">
                            <tbody>
                                <tr className="border-gray-100 border-solid border-b">
                                    <th className="text-left pr-10 pl-4 py-3">新メールアドレス</th>
                                    <td className="py-3 pr-4"><input type="text" name="email" placeholder={userData?.email} onChange={(e) => setNewEmail(e.target.value)} className="bg-gray-600 border-b outline-none w-80" /></td>
                                </tr>
                            </tbody>
                        </table>
                        <button type="submit" className="bg-blue-800 px-7 py-2">保存</button>
                    </form>
                    <h3 className="text-center text-sm font-semibold">{sendPassword ? <>{sendPassword}<br />にてパスワードの再設定メールを送信いたしました。</> : ""}</h3>
                    <table className="mb-6 flex-table w-full">
                        <tbody>
                            <tr className="border-gray-100 border-solid border-b flex w-full items-center justify-between py-1">
                                <th className="text-left pr-10 pl-4 flex">新パスワード</th>
                                <td className="py-3 pr-4 flex"><button className="bg-blue-800 px-7 py-2" onClick={handleSubmitPassword}>変更</button></td>
                            </tr>
                        </tbody>
                    </table>

                </section>
                <div className="w-full flex items-center justify-between mt-10">
                    <Link href="/profile" className="back bg-gray-800 px-7 py-2">戻る</Link>
                </div>
            </article>
        </>
    )
}