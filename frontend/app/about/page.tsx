import {SidebarItem} from "@/lib/sidebar";

type Props = {
    params: Promise<{ item: SidebarItem }>;
};

export default async function AboutUSPage({ params }: Props) {
    return (<div>
        <span>
            aboutus
        </span>
    </div>);
}