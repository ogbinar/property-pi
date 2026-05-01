import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardPage from './(dashboard)/page'

export default async function Home() {
	const cookieStore = await cookies()
	const token = cookieStore.get('session')?.value

	if (!token) {
		redirect('/login')
	}

	return <DashboardPage />
}
