import Image from "next/image";
import TopBar from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative min-h-screen flex flex-col transition-colors duration-300 overflow-hidden">

			{/* ── Layer 0: Background image ── */}
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

			{/* ── Layer 1: Theme-color wash (blends image with active theme) ── */}
			<div
				className="pointer-events-none absolute inset-0 -z-20 transition-colors duration-300"
				aria-hidden="true"
				 style={{ background: "color-mix(in oklch, var(--background) 65%, transparent)" }}
			/>

			{/* ── Layer 2: Ambient glows ── */}
			<div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
				{/* Top-left primary glow */}
				<div
					className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-40 transition-colors duration-300"
					style={{
						background:
							"radial-gradient(ellipse at center, color-mix(in oklch, var(--ring) 50%, transparent), transparent 70%)",
					}}
				/>
				{/* Bottom-right accent glow */}
				<div
					className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-35 transition-colors duration-300"
					style={{
						background:
							"radial-gradient(ellipse at center, color-mix(in oklch, var(--ring) 45%, transparent), transparent 70%)",
					}}
				/>
				{/* Center vignette */}
				<div
					className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-15 transition-colors duration-300"
					style={{
						background:
							"radial-gradient(ellipse at center, color-mix(in oklch, var(--ring) 30%, transparent), transparent 75%)",
					}}
				/>
				{/* Fine dot grid overlay */}
				<div
					className="absolute inset-0 opacity-[0.035]"
					style={{
						backgroundImage:
							"radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
						backgroundSize: "28px 28px",
					}}
				/>
			</div>

			<header className="sticky top-0 z-50">
				<TopBar />
			</header>

			<main className="flex-1">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex min-h-[70vh] items-center justify-center py-10 sm:py-14">
						{children}
					</div>
				</div>
			</main>
			<Footer />
			<Toaster />
		</div>
	);
}
