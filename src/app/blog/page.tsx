import type { Metadata } from 'next';
import { getAllPostsMeta } from '@/lib/blog';
import BlogPostCard from '@/components/blog/BlogPostCard';

export const metadata: Metadata = {
  title: 'Blog — Forgia',
  description:
    'Aprende sobre CrossFit, periodización, records personales y más. Contenido educativo para atletas de todos los niveles.',
  openGraph: {
    title: 'Blog — Forgia',
    description:
      'Aprende sobre CrossFit, periodización, records personales y más.',
    url: 'https://forgia.fit/blog',
    type: 'website',
  },
};

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();

  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Blog
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Contenido educativo sobre CrossFit, entrenamiento y rendimiento.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-neutral-500">Próximamente: nuevos artículos.</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
