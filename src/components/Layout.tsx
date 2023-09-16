import { ReactNode } from 'react';
import Navbar from './Navbar'

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <div className='flex flex-col items-center'>
                <Navbar />
                <main className='max-w-5xl w-full flex flex-col items-center justify-between '>{children}</main>
            </div>
        </>
    )
}