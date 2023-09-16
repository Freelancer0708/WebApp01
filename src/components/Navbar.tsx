import Link from 'next/link'
import LoginStatus from './LoginStatus'
import HeaderLink from './Login/HeaderLink'


export default function Navbar() {
    return (
        <>
            <section className='z-10 w-full bg-gray-800 flex items-center justify-center px-10 '>
                <div className='max-w-5xl w-full flex items-center justify-between'>
                    <HeaderLink />
                    <LoginStatus />
                </div>
            </section>
        </>
    )
}