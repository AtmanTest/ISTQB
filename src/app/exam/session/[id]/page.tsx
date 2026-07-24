import ExamSessionPage from './_page.client';

export default function ExamSessionPageWrapper() {
  return <ExamSessionPage />;
}

export async function generateStaticParams() {
  // Placeholder IDs — actual exam sessions are created at runtime.
  return [
    { id: 'placeholder-session-1' },
    { id: 'placeholder-session-2' },
  ];
}
