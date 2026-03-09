import Image from "next/image"

export default function OAuthLogo() {
    return (
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            <Image
                src="/growth.png"
                alt="Website logo"
                width={32}
                height={32}
                className="object-contain"
                priority
            />
        </div>
    )
}