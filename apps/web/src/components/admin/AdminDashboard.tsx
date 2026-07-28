import { DashboardKpis } from './dashboard/DashboardKpis';

export function AdminDashboard() {
  const navSections = [
    { id: 'sows', label: 'SOWs' },
    { id: 'approval-health', label: 'Approval Health' },
    { id: 'team-management', label: 'Team Management' },
    { id: 'template-workflow', label: 'Templates & Workflows' },
    { id: 'projects-clients', label: 'Projects & Clients' },
    { id: 'recent-audit', label: 'Recent Audit Changes' },
  ];

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur-sm py-4 mb-2 border-b border-border -mx-6 px-6">
        <nav className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-4 py-2 rounded-full transition-colors flex items-center border border-border bg-card shadow-sm"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </div>
      <div>
        <DashboardKpis />
      </div>
    </div>
  );
}
