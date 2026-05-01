import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import DashboardPage from './(dashboard)/page'
import LoginRedirectClient from './login-redirect-client'

export default async function Home() {
	const cookieStore = await cookies()
	const token = cookieStore.get('session')?.value

	if (!token) {
		return <LoginRedirectClient />
	}

	return <DashboardPage />
}
