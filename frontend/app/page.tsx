import { getAllPosts } from '@/lib/posts'
import LandingContent from '@/components/LandingContent'

export default function LandingPage() {
    const posts = getAllPosts()
    return <LandingContent posts={posts} />
}
