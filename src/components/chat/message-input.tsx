import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ModelSelector } from './model-selector';
import { useAppStore } from '@/stores/app-store';
import { 
  Paperclip, 
  Mic, 
  Square, 
  ListPlus,
  FlaskConical,
  X,
  FileText,
  Image as ImageIcon,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SendHorizontalIcon } from '@/components/animate-ui/icons/send-horizontal';

interface MessageInputProps {
  chatId?: string;
  isNewChat?: boolean;
}

export function MessageInput({ chatId, isNewChat }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
    selectedModels,
    transcriptionEnabled,
    openRouterKey,
    models,
    addModel,
    removeModel,
    setSelectedModels,
  } = useAppStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 600) { // 10 minutes max
            setIsRecording(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording, setIsRecording, setRecordingTime]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      
      if (!isImage && !isPdf) {
        toast.error('Only images and PDF files are supported');
        return false;
      }
      if (!isValidSize) {
        toast.error('File size must be less than 10MB');
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    if (!openRouterKey) {
      toast.error('Please set your OpenRouter API key in settings');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement message submission logic
      console.log('Submitting message:', { message, attachments, selectedModels, temperature: temperature[0], maxTokens: maxTokens[0] });
      
      // Clear form
      setMessage('');
      setAttachments([]);
      
      toast.success('Message sent!');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecording = () => {
    if (!transcriptionEnabled) {
      toast.error('Transcription is not enabled. Enable it in settings.');
      return;
    }
    
    setIsRecording(!isRecording);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type === 'application/pdf') return FileText;
    return FileText;
  };

  return (
    <div className="space-y-4">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => {
            const Icon = getFileIcon(file);
            return (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center space-x-1 px-2 py-1"
              >
                <Icon className="h-3 w-3" />
                <span className="text-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center space-x-2 text-sm text-red-500 animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span>Recording... {formatTime(recordingTime)}</span>
          <span className="text-muted-foreground">Max 10:00</span>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit}>
        <div className={cn(
          "relative glass-2 rounded-lg border border-border/50 message-input-glow",
          "transition-all duration-300"
        )}>
          <div className="flex items-start space-x-3 p-4">
            {/* Attachments button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Prompt Library button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
            >
              <ListPlus className="h-4 w-4" />
            </Button>

            {/* Message textarea */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
              disabled={isSubmitting || isRecording}
            />

            {/* Recording/Send buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              {transcriptionEnabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8',
                    isRecording && 'text-red-500 bg-red-500/10'
                  )}
                  onClick={handleRecording}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}

              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 rounded-full brand-mesh-gradient glow-effect text-white border-0 hover:shadow-lg transition-all duration-300 icon-shadow"
              >
                <SendHorizontalIcon className="h-4 w-4" animation="default" />
              </Button>
            </div>
          </div>

          {/* Model selector and cost display for new chat */}
          {isNewChat && (
            <div className="border-t border-border/20 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Models:</span>
                  <ModelSelector
                    selectedModels={selectedModels}
                    onAddModel={addModel}
                    onRemoveModel={removeModel}
                    onSetModels={setSelectedModels}
                  />
                </div>
                
                {/* Cost display */}
                <div className="flex items-center space-x-4 text-sm">
                  {selectedModels.map(modelId => {
                    const model = models.find(m => m.id === modelId);
                    if (!model) return null;
                    return (
                      <div key={modelId} className="flex items-center space-x-1 text-muted-foreground">
                        <Bot className="h-3 w-3" />
                        <span>${model.input_cost.toFixed(4)} / ${model.output_cost.toFixed(4)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Advanced Settings outside message box for new chat */}
      {isNewChat && (
        <div className="flex justify-end">
          <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                <FlaskConical className="h-3 w-3 mr-1" />
                Advanced Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-2">
              <DialogHeader>
                <DialogTitle>Advanced Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Temperature: {temperature[0]}</Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness. Lower values make responses more focused and deterministic.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Max Tokens: {maxTokens[0]}</Label>
                  <Slider
                    value={maxTokens}
                    onValueChange={setMaxTokens}
                    max={4096}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of tokens to generate in the response.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}