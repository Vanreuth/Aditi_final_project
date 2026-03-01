"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getAuthProfile, setAccessToken } from "@/lib/api";
import { useAppDispatch } from "@/store/hook";
import { logIn } from "@/store/slices/authSlice";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const DEFAULT_RETURN_URL = "/dashboard";

function resolveReturnUrl(rawReturnUrl: string | null): string {
	if (!rawReturnUrl) {
		return DEFAULT_RETURN_URL;
	}

	try {
		const decoded = decodeURIComponent(rawReturnUrl);
		return decoded.startsWith("/") ? decoded : DEFAULT_RETURN_URL;
	} catch {
		return DEFAULT_RETURN_URL;
	}
}

export default function OAuthRedirectPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const dispatch = useAppDispatch();

	useEffect(() => {
		let isMounted = true;

		async function completeOAuthLogin() {
			const accessToken = searchParams.get("accessToken");
			const refreshToken = searchParams.get("refreshToken");
			const returnUrl = resolveReturnUrl(searchParams.get("returnUrl"));
			const loginUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;

			if (!accessToken) {
				toast.error("OAuth callback is missing an access token.");
				router.replace(loginUrl);
				return;
			}

			try {
				setAccessToken(accessToken);
				if (refreshToken) {
					localStorage.setItem("refreshToken", refreshToken);
				}

				const profile = await getAuthProfile();
				if (!isMounted) {
					return;
				}

				dispatch(
					logIn({
						user: {
							id: String(profile.id),
							username: profile.username,
							email: profile.email,
						},
						token: accessToken,
					})
				);

				localStorage.setItem(
					"user",
					JSON.stringify({
						id: profile.id,
						username: profile.username,
						email: profile.email,
						roles: profile.roles,
					})
				);

				toast.success("OAuth login successful");
				router.replace(returnUrl);
			} catch {
				if (!isMounted) {
					return;
				}
				setAccessToken(null);
				localStorage.removeItem("refreshToken");
				toast.error("Unable to complete OAuth login. Please try again.");
				router.replace(loginUrl);
			}
		}

		completeOAuthLogin();
		return () => {
			isMounted = false;
		};
	}, [dispatch, router, searchParams]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle>Finishing sign in</CardTitle>
					<CardDescription>
						Completing your OAuth login and redirecting you now.
					</CardDescription>
				</CardHeader>
				<CardContent className="text-center text-sm text-muted-foreground">
					Please wait...
				</CardContent>
			</Card>
		</div>
	);
}
