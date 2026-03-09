import { ReactNode } from "react"
import OAuthLogo from "./OAuthLogo"

export default function OAuthCard({ children }: { children: ReactNode }) {
    return (
        <div className="relative w-[360px] rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40 p-10 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">

            <OAuthLogo />

            {children}

        </div>
    )
}