import {SidebarItem} from "@/lib/sidebar";
import TimestampClient from "@/app/tools/timestamp/TimestampClient";

type Props = {
    params: Promise<{ item: SidebarItem }>;
};

export default async function TimestampPage({params}: Props) {
    return (
        <div className="min-h-screen bg-black-50 flex items-center justify-center">
            <div className="max-w-5xl mx-auto px-6 py-16">

                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Timestamp
                </h1>
                <TimestampClient />
            </div>
        </div>
    );
}