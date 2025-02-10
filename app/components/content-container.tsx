export default function ContentContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex justify-center w-full">
            <div className="w-full max-w-2xl">
                {children}
            </div>
            <div className="w-[350px] hidden lg:block" />
        </div>
    );
} 