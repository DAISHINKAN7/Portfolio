import type { Metadata } from 'next';
import { ProjectIndex } from '@/components/project-index';
import { ProvKey, SectionHead } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Five AI/ML engineering case studies: multi-agent RAG, multimodal galaxy classification, regime-aware portfolio construction, counterfactual ecosystem forecasting and space-domain NER.',
  alternates: { canonical: '/projects' },
};

export default function ProjectsPage() {
  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-12 max-w-3xl">
        <p className="eyebrow">Work</p>
        <h1 className="display-xl mt-6">Five systems</h1>
        <p className="lede mt-7">
          Each of these began somewhere awkward — a dataset that did not exist, a benchmark that was not available, or a
          target quantity that cannot be observed at all. The case studies cover the architecture, the experiments, the
          results and the limitations, in that order.
        </p>
      </header>

      <ProjectIndex />

      <div className="mt-16">
        <ProvKey />
      </div>
    </div>
  );
}
