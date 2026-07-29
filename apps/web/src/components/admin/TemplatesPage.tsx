'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Copy, FileText, Trash2, X } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { Dialog, DialogContent } from '../ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { useTemplateStore, type TemplateRow } from './sows/templateStore';
import { LivePreview } from './sows/builder/LivePreview';
import { ResizeHandle } from '../ui/resize-handle';
import { useResizableWidth } from '../../lib/useResizableWidth';

export function TemplatesPage() {
  const router = useRouter();
  const templates = useTemplateStore((s) => s.templates);
  const duplicateTemplate = useTemplateStore((s) => s.duplicateTemplate);
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate);
  const toggleActive = useTemplateStore((s) => s.toggleActive);

  const [deleting, setDeleting] = useState<TemplateRow | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRow | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);

  const visible = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())),
  );

  function handleDelete(id: string) {
    deleteTemplate(id);
    setDeleting(null);
  }

  const activeCount = templates.filter((t) => t.isActive).length;

  return (
    <div className="flex items-start gap-6">
    <div className="min-w-0 flex-1">
      <PageHeader
        title="Templates"
        description="Reusable, JSON-Schema-driven forms for starting a new SOW."
        actions={
          <Button onClick={() => router.push('/tenantSlug/admin/sows/new')}>
            <Plus className="h-4 w-4" />
            New template
          </Button>
        }
      />

      <Dialog open={!!deleting} onOpenChange={(val) => !val && setDeleting(null)}>
        <DialogContent title="Delete template" className="max-w-md">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deleting?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleting && handleDelete(deleting.id)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {activeCount} active · {templates.length - activeCount} archived
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState message={search ? 'No templates match your search' : 'No templates yet'} />
      ) : (
        <Table>
          <TableHead>
            <Th>Template</Th>
            <Th>Fields</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th className="text-right">Active</Th>
            <Th className="w-10">&nbsp;</Th>
          </TableHead>
          <TableBody>
            {visible.map((template) => (
              <tr
                key={template.id}
                className={`group cursor-pointer transition-colors hover:bg-muted/40 ${
                  selectedTemplate?.id === template.id ? 'bg-muted/40' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{template.name}</div>
                      {template.description && (
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      )}
                    </div>
                  </div>
                </Td>
                <Td className="text-muted-foreground">{template.fields.length}</Td>
                <Td>
                  <Badge tone={template.isActive ? 'success' : 'neutral'}>
                    {template.isActive ? 'Active' : 'Archived'}
                  </Badge>
                </Td>
                <Td className="text-muted-foreground">{template.createdAt}</Td>
                <Td className="text-right">
                  <span onClick={(e) => e.stopPropagation()}>
                    <Switch checked={template.isActive} onCheckedChange={() => toggleActive(template.id)} />
                  </span>
                </Td>
                <Td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        id={`template-actions-${template.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => router.push(`/tenantSlug/admin/sows/${template.id}/edit`)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateTemplate(template.id)}>
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 hover:text-red-700" onClick={() => setDeleting(template)}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Td>
              </tr>
            ))}
          </TableBody>
        </Table>
      )}
    </div>

    <div
      className="shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out -mt-6 -mb-6 -mr-6"
      style={{ width: selectedTemplate ? sidebarWidth : 0, opacity: selectedTemplate ? 1 : 0 }}
    >
      {selectedTemplate && (
        <div
          className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col border-l border-border bg-muted/40"
          style={{ width: sidebarWidth }}
        >
          <ResizeHandle onPointerDown={startResize} />
          <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{selectedTemplate.name}</h2>
              {selectedTemplate.description && (
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Status</h3>
                <Badge tone={selectedTemplate.isActive ? 'success' : 'neutral'}>
                  {selectedTemplate.isActive ? 'Active' : 'Archived'}
                </Badge>
              </div>
              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Fields</h3>
                <p className="text-sm font-medium text-foreground">{selectedTemplate.fields.length}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Created</h3>
                <p className="text-sm font-medium text-foreground">{selectedTemplate.createdAt}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Template Document</h3>
              {selectedTemplate.fields.length === 0 ? (
                <EmptyState message="This template has no fields yet" />
              ) : (
                <LivePreview
                  schema={selectedTemplate.jsonSchema}
                  uiSchema={selectedTemplate.uiSchema}
                  defaultValues={selectedTemplate.defaultValues}
                />
              )}
            </div>
          </div>

          <div className="border-t border-border p-4 flex items-center justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Close
            </Button>
            <Button onClick={() => router.push(`/tenantSlug/admin/sows/${selectedTemplate.id}/edit`)}>
              Edit Template
            </Button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
