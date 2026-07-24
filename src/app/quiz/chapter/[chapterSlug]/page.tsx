import QuizByChapterPage from './_page.client';

export default function QuizChapterPage() {
  return <QuizByChapterPage />;
}

export async function generateStaticParams() {
  const chapters = await import('@/data/seed/chapters.json').then(m => m.default);
  return chapters.map((ch: any) => ({ chapterSlug: ch.slug }));
}
