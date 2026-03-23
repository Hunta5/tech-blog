import { getAllPosts } from '@/lib/posts'
import HomeContent from '@/components/HomeContent'

export default function HomePage() {
    const posts = getAllPosts()
    return <HomeContent posts={posts} />
}
