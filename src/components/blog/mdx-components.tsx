import Image from 'next/image';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const mdxComponents: Record<string, React.ComponentType<any>> = {
  h1: (props: any) => (
    <h1
      className="text-3xl md:text-4xl font-bold mb-6 text-neutral-900 dark:text-neutral-100"
      {...props}
    />
  ),
  h2: (props: any) => (
    <h2
      className="text-xl md:text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-neutral-100"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      className="text-lg md:text-xl font-semibold mt-8 mb-3 text-neutral-900 dark:text-neutral-100"
      {...props}
    />
  ),
  h4: (props: any) => (
    <h4
      className="text-base md:text-lg font-semibold mt-6 mb-2 text-neutral-900 dark:text-neutral-100"
      {...props}
    />
  ),
  p: (props: any) => (
    <p
      className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4"
      {...props}
    />
  ),
  ul: (props: any) => (
    <ul
      className="list-disc list-inside space-y-2 mb-4 text-neutral-700 dark:text-neutral-300"
      {...props}
    />
  ),
  ol: (props: any) => (
    <ol
      className="list-decimal list-inside space-y-2 mb-4 text-neutral-700 dark:text-neutral-300"
      {...props}
    />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-red-500 pl-4 my-6 italic text-neutral-600 dark:text-neutral-400"
      {...props}
    />
  ),
  code: (props: any) => (
    <code
      className="bg-neutral-100 dark:bg-neutral-800 text-red-500 px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    />
  ),
  pre: (props: any) => (
    <pre
      className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 overflow-x-auto mb-4 text-sm font-mono"
      {...props}
    />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto mb-4">
      <table
        className="w-full text-sm text-neutral-700 dark:text-neutral-300 border-collapse"
        {...props}
      />
    </div>
  ),
  th: (props: any) => (
    <th
      className="border border-neutral-200 dark:border-neutral-700 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 font-semibold text-left text-neutral-900 dark:text-neutral-100"
      {...props}
    />
  ),
  td: (props: any) => (
    <td
      className="border border-neutral-200 dark:border-neutral-700 px-4 py-2"
      {...props}
    />
  ),
  img: (props: any) => (
    <Image
      src={props.src ?? ''}
      alt={props.alt ?? ''}
      width={800}
      height={450}
      className="rounded-xl my-6 w-full h-auto"
    />
  ),
  hr: () => (
    <hr className="my-8 border-neutral-200 dark:border-neutral-700" />
  ),
  strong: (props: any) => (
    <strong
      className="font-semibold text-neutral-900 dark:text-neutral-100"
      {...props}
    />
  ),
  a: (props: any) => (
    <Link
      href={props.href ?? '#'}
      className="text-red-500 hover:text-red-600 underline underline-offset-2 transition-colors"
      {...(props.href?.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {props.children}
    </Link>
  ),
};
