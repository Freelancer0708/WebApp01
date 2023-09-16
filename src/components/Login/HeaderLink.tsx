import Link from 'next/link'
import { useAuthContext } from '../AuthContext'

export default function HeaderLink() {

    const { user } = useAuthContext()

    if (user) {
        return (
            <>
                <ul className="items-center justify-start font-mono text-sm flex gap-5 py-10">
                    <li>
                        <Link href="/">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="login">
                            Login
                        </Link>
                    </li>
                    <li>
                        <Link href="register">
                            Register
                        </Link>
                    </li>
                    <li>
                        <Link href="profile">
                            Profile
                        </Link>
                    </li>
                </ul>
            </>
        )
    } else {
        return (
            <>
                <ul className="items-center justify-start font-mono text-sm flex gap-5 py-10">
                    <li>
                        <Link href="/">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="login">
                            Login
                        </Link>
                    </li>
                    <li>
                        <Link href="register">
                            Register
                        </Link>
                    </li>
                </ul>
            </>
        )
    }
}