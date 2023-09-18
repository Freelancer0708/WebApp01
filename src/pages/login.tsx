import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState, FormEvent } from 'react';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from "@/components/FirebaseConfig";
import Link from "next/link";
import { useRouter } from 'next/router';

export default function Login() {
    const router = useRouter();
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setErrer] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                setEmail('')
                setPassword('')
                router.push("/");
            })
            .catch((error) => {
                setErrer('ログイン情報が正しくありません。再度確認してください。');
            });
    };

    return (
        <>
            <article className="w-full flex flex-col items-center justify-between px-24 py-10 bg-gray-600 mt-10">
                <h1 className="pt-6 text-3xl mb-2">ログイン画面</h1>
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
                        <button type="submit" className="bg-blue-800 px-7 py-2">ログイン</button>
                    </form>
                    <div className="flex justify-center items-center mt-10 gap-2">
                        <p>ユーザー登録は</p>
                        <Link href="register" className="underline">こちら</Link>
                    </div>
                </section>
            </article>
        </>
    )
}