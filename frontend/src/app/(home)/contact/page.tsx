import { Mail, MapPin, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactChannels, faqs } from "../_data";

const directContacts = [
	{ icon: Mail, label: "Email", value: "hello@adutilearning.com" },
	{ icon: PhoneCall, label: "Phone", value: "+855 12 345 678" },
	{ icon: MapPin, label: "Location", value: "Phnom Penh, Cambodia" },
];

export default function ContactPage() {
	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-200/70 md:p-9 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
				<Badge className="border-cyan-700/25 bg-cyan-500/10 text-cyan-700 dark:border-cyan-200/30 dark:bg-cyan-400/15 dark:text-cyan-100">
					Contact
				</Badge>
				<h1 className="mt-3 text-3xl font-bold md:text-5xl">Let us help you choose the right learning path.</h1>
				<p className="mt-3 max-w-3xl text-slate-600 md:text-lg dark:text-slate-300">
					Send your goals and current skill level. We will propose a course sequence and roadmap that fits your timeline.
				</p>
			</section>

			<section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
				<Card className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
					<CardHeader>
						<CardTitle>Send a message</CardTitle>
						<CardDescription className="text-slate-600 dark:text-slate-300">
							Share your objective, current experience, and preferred timeline.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Full name</Label>
								<Input id="name" placeholder="Your name" className="border-slate-300 bg-white dark:border-white/15 dark:bg-slate-900/70" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" placeholder="you@example.com" className="border-slate-300 bg-white dark:border-white/15 dark:bg-slate-900/70" />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="goal">Primary goal</Label>
							<Input id="goal" placeholder="Example: Become backend engineer in 6 months" className="border-slate-300 bg-white dark:border-white/15 dark:bg-slate-900/70" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="message">Message</Label>
							<Textarea id="message" rows={6} placeholder="Tell us your current level, weekly time commitment, and target role." className="border-slate-300 bg-white dark:border-white/15 dark:bg-slate-900/70" />
						</div>
						<Button className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300">
							Submit request
						</Button>
					</CardContent>
				</Card>

				<div className="space-y-5">
					<Card className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
						<CardHeader>
							<CardTitle>Direct contacts</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{directContacts.map((item) => (
								<div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/70">
									<div className="mb-1 flex items-center gap-2 text-cyan-700 dark:text-cyan-200">
										<item.icon className="h-4 w-4" />
										<p className="text-sm font-medium">{item.label}</p>
									</div>
									<p className="text-sm text-slate-600 dark:text-slate-300">{item.value}</p>
								</div>
							))}
						</CardContent>
					</Card>

					<Card className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
						<CardHeader>
							<CardTitle>Support channels</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{contactChannels.map((channel) => (
								<div key={channel.title} className="rounded-lg border border-cyan-700/20 bg-cyan-500/10 p-3 dark:border-cyan-200/20 dark:bg-cyan-400/10">
									<p className="text-sm font-semibold text-cyan-700 dark:text-cyan-100">{channel.title}</p>
									<p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{channel.value}</p>
									<p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{channel.helper}</p>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</section>

			<section className="space-y-4">
				<div>
					<p className="text-sm uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">FAQ</p>
					<h2 className="mt-2 text-2xl font-semibold">Common questions before enrollment</h2>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					{faqs.map((faq) => (
						<Card key={faq.question} className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
							<CardHeader>
								<CardTitle className="text-lg">{faq.question}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-slate-600 dark:text-slate-300">{faq.answer}</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
}
