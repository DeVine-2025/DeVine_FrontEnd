import { FileCode2 } from 'lucide-react';

/** Shared visual for a GitHub analysis report, independent of repository content. */
export default function DeveloperReportThumbnail() {
  return <span className="developer-report-thumbnail" aria-hidden="true"><FileCode2 strokeWidth={1.4} /></span>;
}
