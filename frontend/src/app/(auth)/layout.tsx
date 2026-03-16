 "use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import TopBar from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	const forceScrollTop = () => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
	};

	useLayoutEffect(() => {
		forceScrollTop();
	}, [pathname]);

	useEffect(() => {
		const previous = window.history.scrollRestoration;
		window.history.scrollRestoration = "manual";

		const timer = window.setTimeout(forceScrollTop, 0);
		const laterTimer = window.setTimeout(forceScrollTop, 120);
		const onPageShow = () => forceScrollTop();

		window.addEventListener("pageshow", onPageShow);
		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(forceScrollTop);
		});

		return () => {
			window.clearTimeout(timer);
			window.clearTimeout(laterTimer);
			window.removeEventListener("pageshow", onPageShow);
			window.history.scrollRestoration = previous;
		};
	}, [pathname]);

	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden transition-colors duration-300">
			<div className="pointer-events-none absolute inset-0 -z-30" aria-hidden="true">
				<Image
					src="/backgroud.webp"
					alt=""
					fill
					priority
					className="object-cover object-center select-none"
					sizes="100vw"
					quality={90}
				/>
			</div>

			<div
				className="pointer-events-none absolute inset-0 -z-20 transition-colors duration-300"
				aria-hidden="true"
				style={{ background: "color-mix(in oklch, var(--background) 76%, transparent)" }}
			/>

			<div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
				<div
					className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-40 transition-colors duration-300"
					style={{
						background:
							"radial-gradient(ellipse at center, color-mix(in oklch, var(--ring) 50%, transparent), transparent 70%)",
					}}
				/>
				<div
					className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-35 transition-colors duration-300"
					style={{
						background:
							"radial-gradient(ellipse at center, color-mix(in oklch, var(--ring) 45%, transparent), transparent 70%)",
					}}
				/>
				<div
					className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-15 transition-colors duration-300"
					style={{
						background:
							"radial-gradient(ellipse at center, color-mix(in oklch, var(--ring) 30%, transparent), transparent 75%)",
					}}
				/>
				<div
					className="absolute inset-0 opacity-[0.035]"
					style={{
						backgroundImage:
							"radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
						backgroundSize: "28px 28px",
					}}
				/>
			</div>

			<TopBar />

			<main className="flex flex-1">
				<div className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-7xl flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
						{children}
				</div>
			</main>
			<Toaster />
		</div>
	);
}
