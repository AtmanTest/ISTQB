import LessonDetailPage from './_page.client';

export default function SyllabusLessonPage() {
  return <LessonDetailPage />;
}

export async function generateStaticParams() {
  const chapters = await import('@/data/seed/chapters.json').then(m => m.default);
  const params: { chapterSlug: string; lessonSlug: string }[] = [];
  for (const ch of chapters) {
    for (const section of ch.sections) {
      for (const lesson of section.lessons) {
        params.push({ chapterSlug: ch.slug, lessonSlug: lesson.slug });
      }
    }
  }
  return params;
}
