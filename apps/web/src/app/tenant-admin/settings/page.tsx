'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Bot, Building2, HardDrive, Users } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { currentTenant, updateCurrentTenant } from '@/lib/data/current-user';
import {
  type AiProvider,
  tenantAiSettings,
  updateProviderConfig,
  updateTenantAiSettings,
} from '@/lib/data/ai-settings';

const STORAGE_USED_GB = 3.4;
const STORAGE_TOTAL_GB = 10;

function initials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function TenantSettingsPage() {
  const [name, setName] = useState(currentTenant.name);
  const [logoUrl, setLogoUrl] = useState(currentTenant.logoUrl);

  const [activeProvider, setActiveProvider] = useState<AiProvider>(
    tenantAiSettings.activeProvider,
  );
  const [openrouterModel, setOpenrouterModel] = useState(
    tenantAiSettings.providers.openrouter.model,
  );
  const [openrouterKey, setOpenrouterKey] = useState(
    tenantAiSettings.providers.openrouter.apiKey,
  );
  const [huggingfaceModel, setHuggingfaceModel] = useState(
    tenantAiSettings.providers.huggingface.model,
  );
  const [huggingfaceKey, setHuggingfaceKey] = useState(
    tenantAiSettings.providers.huggingface.apiKey,
  );
  const [temperature, setTemperature] = useState(tenantAiSettings.temperature);
  const [maxTokens, setMaxTokens] = useState(tenantAiSettings.maxTokens);
  const [toolCallingEnabled, setToolCallingEnabled] = useState(
    tenantAiSettings.toolCallingEnabled,
  );
  const [streamingEnabled, setStreamingEnabled] = useState(
    tenantAiSettings.streamingEnabled,
  );

  function handleSave() {
    updateCurrentTenant({ name: name.trim(), logoUrl: logoUrl.trim() });
    toast.success('Organization settings saved');
  }

  function handleSaveAiSettings() {
    updateProviderConfig('openrouter', {
      model: openrouterModel.trim(),
      apiKey: openrouterKey.trim(),
    });
    updateProviderConfig('huggingface', {
      model: huggingfaceModel.trim(),
      apiKey: huggingfaceKey.trim(),
    });
    updateTenantAiSettings({
      activeProvider,
      temperature,
      maxTokens,
      toolCallingEnabled,
      streamingEnabled,
    });
    toast.success('AI provider settings saved');
  }

  const storagePct = Math.round((STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Organization configuration for this tenant."
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="gap-5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Building2 className="size-4.5" />
              </div>
              <div>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Name, branding, and theme for {name || 'this tenant'}.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src={logoUrl || undefined} alt="" />
                <AvatarFallback>{initials(name || '?')}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Label htmlFor="org-logo">Logo URL</Label>
                <Input
                  id="org-logo"
                  placeholder="https://..."
                  value={logoUrl}
                  className="mt-1.5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLogoUrl(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-slug">Slug</Label>
              <Input id="org-slug" defaultValue={currentTenant.slug} disabled />
            </div>

            <Button className="self-start" onClick={handleSave}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Users className="size-4.5" />
                </div>
                <div>
                  <p className="font-medium">Users</p>
                  <p className="text-sm text-muted-foreground">
                    Manage tenant users and their status.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                nativeButton={false}
                render={
                  <Link href="/tenant-admin/users" aria-label="Go to Users" />
                }
              >
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <HardDrive className="size-4.5" />
                </div>
                <div>
                  <CardTitle>Storage</CardTitle>
                  <CardDescription>
                    Usage summary for attachments and generated documents.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Progress value={storagePct} />
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">
                  {STORAGE_USED_GB} GB of {STORAGE_TOTAL_GB} GB used
                </p>
                <p className="text-sm font-medium">{storagePct}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Bot className="size-4.5" />
                </div>
                <div>
                  <CardTitle>AI Provider</CardTitle>
                  <CardDescription>
                    Powers Agentic SOW Editing for this tenant.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ai-provider">Active provider</Label>
                <Select
                  value={activeProvider}
                  onValueChange={(v: string | null) =>
                    v && setActiveProvider(v as AiProvider)
                  }
                >
                  <SelectTrigger id="ai-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                    <SelectItem value="huggingface">Hugging Face</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The AI Agent panel calls whichever provider is active here.
                  Both providers' credentials below are kept saved even when not
                  active, so switching back doesn't lose anything.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">OpenRouter</p>
                  {activeProvider === 'openrouter' && (
                    <span className="text-xs font-medium text-primary">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-openrouter-model">Model</Label>
                  <Input
                    id="ai-openrouter-model"
                    value={openrouterModel}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOpenrouterModel(e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-openrouter-key">API key</Label>
                  <Input
                    id="ai-openrouter-key"
                    type="password"
                    placeholder="sk-or-..."
                    value={openrouterKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOpenrouterKey(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Hugging Face</p>
                  {activeProvider === 'huggingface' && (
                    <span className="text-xs font-medium text-primary">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-huggingface-model">Model</Label>
                  <Input
                    id="ai-huggingface-model"
                    value={huggingfaceModel}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setHuggingfaceModel(e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-huggingface-key">API key</Label>
                  <Input
                    id="ai-huggingface-key"
                    type="password"
                    placeholder="hf_..."
                    value={huggingfaceKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setHuggingfaceKey(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-temp">Temperature</Label>
                  <Input
                    id="ai-temp"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={temperature}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTemperature(Number(e.target.value))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-max-tokens">Max tokens</Label>
                  <Input
                    id="ai-max-tokens"
                    type="number"
                    min="1"
                    value={maxTokens}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMaxTokens(Number(e.target.value))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-tools" className="font-normal">
                  Tool-calling enabled
                </Label>
                <Switch
                  id="ai-tools"
                  checked={toolCallingEnabled}
                  onCheckedChange={(checked) => setToolCallingEnabled(checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-streaming" className="font-normal">
                  Streaming enabled
                </Label>
                <Switch
                  id="ai-streaming"
                  checked={streamingEnabled}
                  onCheckedChange={(checked) => setStreamingEnabled(checked)}
                />
              </div>
              <Button className="self-start" onClick={handleSaveAiSettings}>
                Save AI Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
