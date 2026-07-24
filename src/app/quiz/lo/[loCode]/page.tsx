import QuizByLoPage from './_page.client';

export default function QuizLoPage() {
  return <QuizByLoPage />;
}

export async function generateStaticParams() {
  const chapters = await import('@/data/seed/chapters.json').then(m => m.default);
  const codes: string[] = [];
  for (const ch of chapters) {
    for (const lo of ch.learningObjectives) {
      if (!codes.includes(lo.code)) codes.push(lo.code);
    }
  }
  return codes.map((code) => ({ loCode: code }));
}
