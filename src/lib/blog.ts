import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function isPublished(date: string): boolean {
  return new Date(date).getTime() <= Date.now();
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  author: string;
  readingTime: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export function getAllPostsMeta(): BlogPostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '');
    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const stats = readingTime(content);

    return {
      slug,
      title: data.title ?? '',
      date: data.date ?? '',
      excerpt: data.excerpt ?? '',
      tags: data.tags ?? [],
      author: data.author ?? 'Forgia',
      readingTime: stats.text.replace('read', 'lectura'),
    };
  });

  return posts
    .filter((p) => isPublished(p.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  if (!isPublished(data.date ?? '')) return null;

  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? '',
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    tags: data.tags ?? [],
    author: data.author ?? 'Forgia',
    readingTime: stats.text.replace('read', 'lectura'),
    content,
  };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .filter((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8');
      const { data } = matter(raw);
      return isPublished(data.date ?? '');
    })
    .map((f) => f.replace(/\.mdx$/, ''));
}
