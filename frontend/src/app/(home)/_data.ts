export type Course = {
	id: number;
	title: string;
	slug: string;
	category: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	duration: string;
	lessons: number;
	students: number;
	rating: number;
	price: string;
	isFree: boolean;
	summary: string;
	skills: string[];
	thumbnail: string; // gradient CSS or image URL
	thumbnailBg: string; // tailwind bg gradient class
	icon: string; // emoji icon for the card
};

export type RoadmapStage = {
	id: string;
	title: string;
	window: string;
	focus: string;
	outcomes: string[];
	project: string;
};

export const platformStats = [
	{ label: "Active Learners", value: "12,500+", icon: "👨‍🎓" },
	{ label: "Guided Courses", value: "180+", icon: "📚" },
	{ label: "Hands-on Projects", value: "95", icon: "🛠️" },
	{ label: "Average Rating", value: "4.8/5", icon: "⭐" },
];

export const courseCategories = [
	"Frontend Engineering",
	"Backend Engineering",
	"DevOps and Cloud",
	"Data and AI",
	"Career and Interview",
];

export const courses: Course[] = [
	{
		id: 101,
		title: "Modern Frontend Foundations",
		slug: "modern-frontend-foundations",
		category: "Frontend Engineering",
		level: "Beginner",
		duration: "6 weeks",
		lessons: 36,
		students: 3100,
		rating: 4.9,
		price: "$29",
		isFree: false,
		summary:
			"Build responsive interfaces with HTML, CSS, JavaScript, and React fundamentals.",
		skills: ["Semantic HTML", "CSS Layouts", "React Components", "State Basics"],
		thumbnail: "from-blue-500 via-cyan-400 to-teal-400",
		thumbnailBg: "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400",
		icon: "⚛️",
	},
	{
		id: 102,
		title: "Spring Boot API and Security",
		slug: "spring-boot-api-security",
		category: "Backend Engineering",
		level: "Intermediate",
		duration: "8 weeks",
		lessons: 42,
		students: 2200,
		rating: 4.8,
		price: "$39",
		isFree: false,
		summary:
			"Design production APIs with JWT, OAuth2, refresh tokens, and role-based access.",
		skills: ["JPA Modeling", "JWT Auth", "OAuth2 Login", "Secure Cookies"],
		thumbnail: "from-green-500 via-emerald-400 to-teal-500",
		thumbnailBg: "bg-gradient-to-br from-green-500 via-emerald-400 to-teal-500",
		icon: "🔐",
	},
	{
		id: 103,
		title: "Deploy Fullstack with Docker",
		slug: "deploy-fullstack-docker",
		category: "DevOps and Cloud",
		level: "Intermediate",
		duration: "5 weeks",
		lessons: 24,
		students: 1400,
		rating: 4.7,
		price: "$34",
		isFree: false,
		summary:
			"Containerize frontend and backend services and ship with repeatable deployment flows.",
		skills: ["Dockerfiles", "Compose", "CI Basics", "Monitoring"],
		thumbnail: "from-orange-500 via-amber-400 to-yellow-400",
		thumbnailBg: "bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-400",
		icon: "🐳",
	},
	{
		id: 104,
		title: "Practical SQL and Analytics",
		slug: "practical-sql-analytics",
		category: "Data and AI",
		level: "Beginner",
		duration: "4 weeks",
		lessons: 21,
		students: 2700,
		rating: 4.8,
		price: "Free",
		isFree: true,
		summary:
			"Learn SQL for reporting, dashboards, and data modeling with real business datasets.",
		skills: ["SQL Queries", "Data Joins", "Aggregation", "Dashboard Inputs"],
		thumbnail: "from-purple-500 via-violet-400 to-indigo-500",
		thumbnailBg: "bg-gradient-to-br from-purple-500 via-violet-400 to-indigo-500",
		icon: "📊",
	},
	{
		id: 105,
		title: "System Design for Developers",
		slug: "system-design-for-developers",
		category: "Career and Interview",
		level: "Advanced",
		duration: "7 weeks",
		lessons: 30,
		students: 900,
		rating: 4.9,
		price: "$49",
		isFree: false,
		summary:
			"Master tradeoffs, architecture patterns, and interview-ready system design answers.",
		skills: ["Scalability", "Caching", "Queues", "Tradeoff Analysis"],
		thumbnail: "from-rose-500 via-pink-400 to-fuchsia-500",
		thumbnailBg: "bg-gradient-to-br from-rose-500 via-pink-400 to-fuchsia-500",
		icon: "🏗️",
	},
	{
		id: 106,
		title: "Advanced React Patterns",
		slug: "advanced-react-patterns",
		category: "Frontend Engineering",
		level: "Advanced",
		duration: "6 weeks",
		lessons: 28,
		students: 1100,
		rating: 4.8,
		price: "$44",
		isFree: false,
		summary:
			"Write scalable React apps with composition patterns, performance tuning, and testing.",
		skills: ["Hooks Patterns", "Rendering Performance", "Testing", "Design Systems"],
		thumbnail: "from-sky-500 via-blue-400 to-indigo-500",
		thumbnailBg: "bg-gradient-to-br from-sky-500 via-blue-400 to-indigo-500",
		icon: "🚀",
	},
];

export const roadmapStages: RoadmapStage[] = [
	{
		id: "phase-01",
		title: "Phase 01: Core Coding Basics",
		window: "Weeks 1-4",
		focus: "Programming foundations and problem solving",
		outcomes: [
			"Write clean code with variables, control flow, and reusable functions",
			"Understand Git workflow for version control",
			"Build simple command-line projects",
		],
		project: "Build a CLI task manager with persistent storage",
	},
	{
		id: "phase-02",
		title: "Phase 02: Frontend Application Skills",
		window: "Weeks 5-10",
		focus: "Modern UI development and client-side architecture",
		outcomes: [
			"Create responsive layouts and accessible components",
			"Manage state and data fetching in React",
			"Implement forms, validation, and UX feedback",
		],
		project: "Build a portfolio-grade e-learning frontend dashboard",
	},
	{
		id: "phase-03",
		title: "Phase 03: Backend and API Engineering",
		window: "Weeks 11-16",
		focus: "Secure APIs, data modeling, and authentication",
		outcomes: [
			"Model entities and relationships with Spring Data JPA",
			"Build REST APIs with validation and error handling",
			"Implement JWT and OAuth2 authentication",
		],
		project: "Ship a secure course management backend",
	},
	{
		id: "phase-04",
		title: "Phase 04: Deployment and Career Prep",
		window: "Weeks 17-20",
		focus: "Production delivery and job readiness",
		outcomes: [
			"Containerize apps and deploy to cloud environments",
			"Set up monitoring and release workflows",
			"Prepare interview-ready case studies",
		],
		project: "Deploy fullstack capstone and present architecture review",
	},
];

export const teamHighlights = [
	{
		name: "Aditi Dara",
		role: "Lead Backend Instructor",
		summary: "Focuses on API security, OAuth workflows, and scalable Java architecture.",
	},
	{
		name: "Nita Sok",
		role: "Frontend Mentor",
		summary: "Guides UI engineering, accessibility, and performance-first React design.",
	},
	{
		name: "Vanna Lim",
		role: "DevOps Coach",
		summary: "Teaches deployment automation and production reliability patterns.",
	},
];

export const contactChannels = [
	{
		title: "Student Support",
		value: "support@adutilearning.com",
		helper: "Replies within 24 hours",
	},
	{
		title: "Partnerships",
		value: "partners@adutilearning.com",
		helper: "For schools and training centers",
	},
	{
		title: "Office Hours",
		value: "Mon - Fri, 09:00 - 18:00 ICT",
		helper: "Live chat available during office hours",
	},
];

export const faqs = [
	{
		question: "Are the courses beginner friendly?",
		answer:
			"Yes. We organize courses by level and provide clear prerequisites before enrollment.",
	},
	{
		question: "Can I follow the roadmap while working full-time?",
		answer:
			"Yes. The roadmap is designed with part-time pacing and includes weekly checkpoints.",
	},
	{
		question: "Do you provide project feedback?",
		answer:
			"Yes. Mentors review submissions and provide practical feedback on structure and code quality.",
	},
];
