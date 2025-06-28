import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAppStore } from '@/stores/app-store';
import { Check, Plus, X, Brain, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModels: string[];
  onAddModel: (model: string) => void;
  onRemoveModel: (model: string) => void;
  onSetModels: (models: string[]) => void;
}

export function ModelSelector({ 
  selectedModels, 
  onAddModel, 
  onRemoveModel, 
  onSetModels 
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const { models } = useAppStore();

  const availableModels = models.filter(m => !selectedModels.includes(m.id));

  return (
    <div className="flex items-center space-x-2">
      {/* Selected models */}
      <div className="flex items-center space-x-1">
        {selectedModels.map(modelId => {
          const model = models.find(m => m.id === modelId);
          if (!model) return null;

          return (
            <Badge 
              key={modelId} 
              variant="secondary" 
              className={cn(
                'flex items-center space-x-1 px-2 py-1',
                model.is_expensive && 'border-yellow-500/50 bg-yellow-500/10'
              )}
            >
              {model.is_reasoning && <Brain className="h-3 w-3" />}
              {model.is_expensive && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
              <span className="text-xs font-medium">{model.name}</span>
              {selectedModels.length > 1 && (
                <button
                  onClick={() => onRemoveModel(modelId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          );
        })}
      </div>

      {/* Add model button */}
      {selectedModels.length < 3 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 rounded-full"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 glass" align="start">
            <Command>
              <CommandInput placeholder="Search models..." />
              <CommandList>
                <CommandEmpty>No models found.</CommandEmpty>
                <CommandGroup>
                  {availableModels.map(model => (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      onSelect={() => {
                        onAddModel(model.id);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {model.is_reasoning && <Brain className="h-3 w-3 text-blue-500" />}
                          {model.is_expensive && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                          <span className="font-medium">{model.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {model.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>In: ${model.input_cost}/1K</span>
                          <span>Out: ${model.output_cost}/1K</span>
                          <span>{(model.context_length / 1000).toFixed(0)}K context</span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}