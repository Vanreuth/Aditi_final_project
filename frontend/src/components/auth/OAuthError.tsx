import { X } from "lucide-react"

export default function OAuthError({
                                       message,
                                       onRetry
                                   }: {
    message: string
    onRetry: () => void
}) {
    return (
        <>
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <X className="text-red-400 w-6 h-6" />
            </div>

            <p className="text-lg font-medium text-white">
                Sign in failed
            </p>

            <p className="text-sm text-red-400 text-center">
                {message}
            </p>

            <button
                onClick={onRetry}
                className="mt-3 px-6 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition"
            >
                Back to login
            </button>
        </>
    )
}