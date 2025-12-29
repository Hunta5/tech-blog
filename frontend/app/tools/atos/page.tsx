import {SidebarItem} from "@/lib/sidebar";

type Props = {
    params: Promise<{ item: SidebarItem }>;
};

export default async function ATOSPage({ params }: Props) {
    return (<div>
        <span>
            hello
        </span>
    </div>);
}