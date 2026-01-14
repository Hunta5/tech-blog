import {SidebarItem} from "@/lib/sidebar";
import AuthGate from "@/components/AuthGate";
type Props = {
    params: Promise<{ item: SidebarItem }>;
};

export default async function BlogMaker({params}: Props) {
    const  handleClick = () =>{
      alert("hello");
    };

    return (
        <div className="min-h-screen bg-black-50 flex items-center justify-center">
            <div className="max-w-5xl mx-auto px-6 py-16">

                <AuthGate />
            </div>
        </div>
    );
}