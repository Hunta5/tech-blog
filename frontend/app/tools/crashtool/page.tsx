import {SidebarItem} from "@/lib/sidebar";

type Props = {
    params: Promise<{ item: SidebarItem }>;
};

export default async function CrashPage({ params }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                        Crash 보고서 부호화하는 Tool
                    </h2>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4 text-gray-300 leading-relaxed">
                        <p>
                            <a href="https://github.com/zqqf16/SYM"
                               target="_blank"
                               className="underline"
                            >
                                1: SYM
                            </a>
                        </p>
                        <p >
                            <a
                                href="https://github.com/inket/MacSymbolicator"
                                target="_blank"
                                className="underline"
                            >
                                2: MacSymbolicator
                            </a>
                        </p>
                    </div>
                </section>
            </div>
        </div>);
}