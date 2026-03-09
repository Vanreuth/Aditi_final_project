import { Check } from "lucide-react"

export default function OAuthSuccess() {
    return (
        <>
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <Check className="text-green-400 w-6 h-6" />
            </div>

            <p className="text-lg font-medium text-white">
                Welcome back!
            </p>

            <p className="text-sm text-white/40">
                Redirecting to your account
            </p>

            <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 animate-[progress_1.2s_ease_forwards]" />
            </div>
        </>
    )
}