import Layout from '../components/Layout'
import type { AppProps } from 'next/app'
import '../assets/globals.css'
import { AuthProvider } from '@/components/AuthContext'

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </AuthProvider>
    )
}