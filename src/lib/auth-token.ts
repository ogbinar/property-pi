import { cookies } from "next/headers";

export async function getServerToken(): Promise<string | null> {
	try {
		const cookieStore = await cookies();
		return cookieStore.get("session")?.value || null;
	} catch {
		return null;
	}
}
