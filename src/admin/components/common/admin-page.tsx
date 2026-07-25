import { AdminPageTitle } from './admin-page-title';

type AdminPageProps = {
  title: string;
  description?: string;
};

export function AdminPage({ title, description }: AdminPageProps) {
  return (
    <section>
      <AdminPageTitle description={description} title={title} />
    </section>
  );
}
