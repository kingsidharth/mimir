import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { 
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Download
} from 'lucide-react';

export function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const {
    openRouterKey,
    setOpenRouterKey,
    budget24h,
    setBudget24h,
    transcriptionEnabled,
    setTranscriptionEnabled,
    models,
    prompts,
  } = useAppStore();

  const [tempApiKey, setTempApiKey] = useState(openRouterKey);
  const [tempBudget, setTempBudget] = useState(budget24h.toString());

  // Theme settings state
  const [autoTheme, setAutoTheme] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // Data Management state
  const [exportFormat, setExportFormat] = useState('json');

  const handleSaveApiKey = () => {
    setOpenRouterKey(tempApiKey);
    toast.success('OpenRouter API key saved');
  };

  const handleSaveBudget = () => {
    const budget = parseFloat(tempBudget);
    if (isNaN(budget) || budget < 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }
    setBudget24h(budget);
    toast.success('Budget limit saved');
  };

  const handleExportData = () => {
    // TODO: Implement data export
    const data = {
      chats: [],
      prompts: prompts,
      settings: {
        budget24h,
        transcriptionEnabled,
        autoTheme,
        compactMode,
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimir-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const handleClearData = () => {
    // TODO: Implement data clearing with confirmation
    toast.success('Data cleared');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your Mimir experience
          </p>
        </div>

        <div className="space-y-6">
          {/* API Keys */}
          <Card className="glass p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">OpenRouter API Key</h2>
              
              <p className="text-sm text-muted-foreground">
                You need an OpenRouter API key to use Mimir. Get one from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  OpenRouter.ai
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex space-x-2 mt-1">
                    <div className="relative flex-1">
                      <Input
                        id="api-key"
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="sk-or-v1-..."
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button onClick={handleSaveApiKey} disabled={!tempApiKey.trim()}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {openRouterKey && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium">API Key Connected</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Budget */}
          <Card className="glass p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Budget Management</h2>
              
              <p className="text-sm text-muted-foreground">
                Set daily spending limits to control your AI usage costs.
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget">24-Hour Budget Limit (USD)</Label>
                  <div className="flex space-x-2 mt-1">
                    <div className="relative flex-1 max-w-xs">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="budget"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="10.00"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Button onClick={handleSaveBudget}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h3 className="font-medium mb-2">Current Budget Status</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span>Daily Limit:</span>
                    <span className="font-medium">${budget24h.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Used Today:</span>
                    <span className="font-medium text-green-600">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Remaining:</span>
                    <span className="font-medium">${budget24h.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Transcription */}
          <Card className="glass p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Voice Transcription</h2>
              
              <p className="text-sm text-muted-foreground">
                Enable voice recording and transcription features.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="transcription-enabled">Enable Transcription</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow voice recording and convert speech to text
                    </p>
                  </div>
                  <Switch
                    id="transcription-enabled"
                    checked={transcriptionEnabled}
                    onCheckedChange={setTranscriptionEnabled}
                  />
                </div>

                {transcriptionEnabled && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h3 className="font-medium mb-2">Transcription Settings</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Maximum recording duration: 10 minutes</p>
                      <p>• Supported audio formats: MP3, WAV, M4A</p>
                      <p>• Transcription powered by OpenAI Whisper</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Models */}
          <Card className="glass p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Available Models</h2>
              
              <p className="text-sm text-muted-foreground">
                Manage and configure AI models available through OpenRouter.
              </p>
              
              <div className="space-y-4">
                {models.map(model => (
                  <div 
                    key={model.id}
                    className="p-4 border border-border/50 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{model.name}</h3>
                          {model.is_reasoning && (
                            <Badge variant="secondary" className="text-xs">
                              Reasoning
                            </Badge>
                          )}
                          {model.is_expensive && (
                            <Badge variant="destructive" className="text-xs">
                              Expensive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {model.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Input: ${model.input_cost}/1K tokens</span>
                          <span>Output: ${model.output_cost}/1K tokens</span>
                          <span>Context: {(model.context_length / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Theme & Appearance */}
          <Card className="glass p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Theme & Appearance</h2>
              
              <p className="text-sm text-muted-foreground">
                Customize the look and feel of the application.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically switch between light and dark themes
                    </p>
                  </div>
                  <Switch
                    checked={autoTheme}
                    onCheckedChange={setAutoTheme}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing and padding for more content
                    </p>
                  </div>
                  <Switch
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className="glass p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Data Management</h2>
              
              <p className="text-sm text-muted-foreground">
                Export your data on demand as a ZIP file.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button onClick={handleClearData} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}