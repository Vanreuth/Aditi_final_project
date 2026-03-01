"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hook";
import { logIn } from "@/store/slices/authSlice";
import { fetchOAuthProviders, getOAuthAuthorizationUrl, login } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LogIn, User, Lock } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
	username: z.string().min(3, {
		message: "Username must be at least 3 characters.",
	}),
	password: z.string().min(6, {
		message: "Password must be at least 6 characters.",
	}),
});

export default function LoginPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const returnUrl = searchParams.get("returnUrl") || "/dashboard";
	const [oauthProviders, setOauthProviders] = useState<string[]>([]);
	const [isOauthLoading, setIsOauthLoading] = useState(true);
	const [activeOauthProvider, setActiveOauthProvider] = useState<string | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	useEffect(() => {
		let isMounted = true;

		async function loadProviders() {
			try {
				const providers = await fetchOAuthProviders();
				if (isMounted) {
					setOauthProviders(providers);
				}
			} catch {
				if (isMounted) {
					setOauthProviders([]);
				}
			} finally {
				if (isMounted) {
					setIsOauthLoading(false);
				}
			}
		}

		loadProviders();
		return () => {
			isMounted = false;
		};
	}, []);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const response = await login({ username: values.username, password: values.password });
			if (response.id) {
				// Store user info in Redux (no JWT token from this backend)
				dispatch(logIn({
					user: {
						id: String(response.id),
						username: response.username,
						email: response.email,
					},
					token: `session-${response.id}`, // Placeholder - backend uses session auth
				}));
				
				// Store user info in localStorage for persistence
				localStorage.setItem("user", JSON.stringify({
					id: response.id,
					username: response.username,
					email: response.email,
					roles: response.roles,
				}));
				
				toast.success("ចូលប្រើប្រាស់ជោគជ័យ!", {
					description: "សូមស្វាគមន៍មកកាន់ ADUTI Learning!",
				});
				router.push(decodeURIComponent(returnUrl));
			}
		} catch {
			toast.error("ចូលប្រើប្រាស់បរាជ័យ", {
				description: "ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
			});
		}
	}

	async function onOAuthSignIn(provider: string) {
		try {
			setActiveOauthProvider(provider);
			const authUrl = await getOAuthAuthorizationUrl(provider);
			window.location.assign(authUrl);
		} catch {
			setActiveOauthProvider(null);
			toast.error("OAuth sign-in failed", {
				description: "Unable to start OAuth login. Please try again.",
			});
		}
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<LogIn className="mx-auto h-12 w-12 text-gray-400" />
				<CardTitle className="mt-4 text-2xl">Welcome back</CardTitle>
				<CardDescription>
					Enter your credentials to access your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<div className="relative">
											<User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												placeholder="Enter your username"
												className="pl-10"
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												type="password"
												placeholder="Enter your password"
												className="pl-10"
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Sign In
						</Button>
						{oauthProviders.length > 0 && (
							<>
								<div className="relative py-2">
									<div className="absolute inset-0 flex items-center">
										<span className="w-full border-t" />
									</div>
									<div className="relative flex justify-center text-xs uppercase">
										<span className="bg-background px-2 text-muted-foreground">or continue with</span>
									</div>
								</div>
								<div className="space-y-2">
									{oauthProviders.map((provider) => (
										<Button
											key={provider}
											type="button"
											variant="outline"
											className="w-full"
											disabled={isOauthLoading || activeOauthProvider !== null}
											onClick={() => onOAuthSignIn(provider)}
										>
											{activeOauthProvider === provider
												? "Redirecting..."
												: `Continue with ${provider.charAt(0).toUpperCase()}${provider.slice(1)}`}
										</Button>
									))}
								</div>
							</>
						)}
					</form>
				</Form>
			</CardContent>
			<CardFooter className="flex flex-col gap-4">
				<div className="text-center text-sm">
					<Link
						href="/forgot-password"
						className="text-blue-600 hover:text-blue-800 underline"
					>
						Forgot your password?
					</Link>
				</div>
				<div className="text-center text-sm">
					Don&apos;t have an account?{" "}
					<Link
						href="/register"
						className="text-blue-600 hover:text-blue-800 underline"
					>
						Sign up
					</Link>
				</div>
			</CardFooter>
		</Card>
	);
}
