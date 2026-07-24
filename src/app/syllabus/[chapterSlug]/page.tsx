import ChapterDetailPage from './_page.client';

export default function SyllabusChapterPage() {
  return <ChapterDetailPage />;
}

export async function generateStaticParams() {
  const chapters = await import('@/data/seed/chapters.json').then(m => m.default);
  return chapters.map((ch: any) => ({ chapterSlug: ch.slug }));
}
