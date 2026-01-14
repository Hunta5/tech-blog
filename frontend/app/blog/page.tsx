import AuthGate from "@/components/AuthGate";

export default function BlogMaker() {
    return (
        <div className="min-h-screen bg-black-50 flex items-center justify-center">
            <div className="max-w-5xl mx-auto px-6 py-16">
                <AuthGate />
            </div>
        </div>
    );
}