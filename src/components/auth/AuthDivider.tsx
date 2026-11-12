export default function AuthDivider() {
    return (
        <div aria-hidden="true" className="flex items-center gap-[10px]">
            <span className="h-px flex-1 bg-[#e5e5e5]" />
            <span className="text-[9px] leading-none text-[#b8b8b8]">OR</span>
            <span className="h-px flex-1 bg-[#e5e5e5]" />
        </div>
    );
}
