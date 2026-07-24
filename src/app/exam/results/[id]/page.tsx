import ExamResultsPage from './_page.client';

export default function ExamResultsPageWrapper() {
  return <ExamResultsPage />;
}

export async function generateStaticParams() {
  // Placeholder IDs — actual exam results are created at runtime.
  return [
    { id: 'placeholder-result-1' },
    { id: 'placeholder-result-2' },
  ];
}
