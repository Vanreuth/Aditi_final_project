"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLocale = "en" | "km";

type LocaleContextValue = {
	locale: AppLocale;
	setLocale: (locale: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocale] = useState<AppLocale>("en");

	useEffect(() => {
		const saved = window.localStorage.getItem("app-locale");
		if (saved === "en" || saved === "km") {
			setLocale(saved);
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem("app-locale", locale);
		document.documentElement.lang = locale === "km" ? "km" : "en";
		document.documentElement.setAttribute("data-locale", locale);
	}, [locale]);

	const value = useMemo(() => ({ locale, setLocale }), [locale]);

	return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
	const context = useContext(LocaleContext);
	if (!context) {
		throw new Error("useLocale must be used within LocaleProvider");
	}
	return context;
}
