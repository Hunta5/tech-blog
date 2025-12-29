import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'posts');

export type Post = {
    slug: string;
    title: string;
    date: string;
};

export function getAllPosts(): Post[] {
    const fileNames = fs.readdirSync(postsDirectory);

    return fileNames.map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const {data} = matter(fileContents);
        return {
            slug,
            title: data.title,
            date: data.date instanceof Date
                ? data.date.toISOString().split('T')[0]
                : data.date,
        };
    });
}
