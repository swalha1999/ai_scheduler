import { getCurrentSession } from "@/core/auth/session";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

export async function goHome() {
	const locale = await getLocale();
	const { user } = await getCurrentSession();
	if (user === null) {
		return redirect({ href: '/login', locale: locale ?? 'he' });
	}

	if (user.is_admin || user.is_super_admin) {
		return redirect({ href: '/super', locale: locale ?? 'he' });
	}

	return redirect({ href: '/dashboard', locale: locale ?? 'he' });
}