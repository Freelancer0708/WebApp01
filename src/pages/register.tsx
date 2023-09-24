import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useState, FormEvent } from 'react';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "@/components/FirebaseConfig";
import Link from "next/link";
import { useRouter } from 'next/router';
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default function Register() {
    const router = useRouter();
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setErrer] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                const currentUser = auth.currentUser;
                if(currentUser?.uid) {
                    return setDoc(doc(db, "users", currentUser.uid), {
                        displayName: "UserName",
                        email: email,
                        emailVerified: false,
                        avatar: ""
                    });
                }
            })
            .then(() => {
                setEmail('')
                setPassword('')
                setErrer('')
                auth.signOut();
                router.push("login");
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode == "auth/email-already-in-use") {
                    setErrer("このメールアドレスは既に登録されています。");
                } else if (errorCode == "auth/invalid-email") {
                    setErrer("有効なメールアドレスを入力してください。");
                } else if (errorCode == "auth/weak-password") {
                    setErrer("パスワードは6文字以上、入力する必要があります。");
                } else {
                    setErrer("登録に問題が発生しました。しばらくしてから再度お試しください。");
                }
            });
    };

    return (
        <>
            <article className="w-full flex flex-col items-center justify-between px-24 py-10 bg-gray-600 mt-10">
                <h1 className="pt-6 text-3xl mb-2">ユーザー登録画面</h1>
                <h2>{error}</h2>
                <section className="pt-6">
                    <form onSubmit={handleSubmit} className="flex flex-col justify-start items-center">
                        <table className="mb-6 flex-table">
                            <tbody>
                                <tr>
                                    <th className="p-2">メールアドレス</th>
                                    <td className="p-2"><input className="text-gray-900 p-1 w-80" type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} /></td>
                                </tr>
                                <tr>
                                    <th className="p-2">パスワード</th>
                                    <td className="p-2"><input className="text-gray-900 p-1 w-80" type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} /></td>
                                </tr>
                            </tbody>
                        </table>
                        <button type="submit" className="bg-blue-800 px-7 py-2">登録</button>
                    </form>
                    <div className="flex justify-center items-center mt-10 gap-2">
                        <p>ログインは</p>
                        <Link href="login" className="underline">こちら</Link>
                    </div>
                </section>
            </article>
        </>
    )
}