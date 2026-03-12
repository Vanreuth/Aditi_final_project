import { Loader2 } from "lucide-react"

export default function OAuthLoading({ dots }: { dots: string }) {
    return (
        <>
            <Loader2 className="w-10 h-10 animate-spin text-blue-400" />

            <p className="text-lg font-medium text-white">
                Signing you in{dots}
            </p>

            <p className="text-sm text-white/40 text-center">
                Verifying your OAuth account
            </p>

            <div className="space-y-2 mt-2 w-full text-sm text-white/40">
                <div className="flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    Authenticating
                </div>

                <div className="flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    Loading profile
                </div>

                <div className="flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    Preparing workspace
                </div>
            </div>
        </>
    )
}