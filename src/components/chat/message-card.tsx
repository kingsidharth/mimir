import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  RefreshCw, 
  User, 
  Bot, 
  Clock, 
  Type, 
  Brain,
  Braces
} from 'lucide-react';
import { useAppStore, type Message } from '@/stores/app-store';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageCardProps {
  message: Message;
  showModel?: boolean;
  compact?: boolean;
}

export function MessageCard({ message, showModel = false, compact = false }: MessageCardProps) {
  const { models } = useAppStore();
  
  const model = message.model ? models.find(m => m.id === message.model) : null;
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const regenerateMessage = () => {
    // TODO: Implement regeneration
    console.log('Regenerating message:', message.id);
  };

  return (
    <div className={cn('flex gap-4', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message content */}
      <div className={cn('flex-1 max-w-[80%]', compact && 'max-w-full')}>
        <Card className={cn(
          'p-4 relative group',
          isUser ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
        )}>
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {message.attachments.map((attachment, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {attachment.type === 'image' ? '🖼️' : '📄'} {attachment.filename}
                </Badge>
              ))}
            </div>
          )}

          {/* Message text */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
              <Copy className="h-3 w-3" />
            </Button>
            
            {!isUser && (
              <>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={regenerateMessage}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
                
                {message.model && (
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Braces className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Message metadata */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground px-1">
          <div className="flex items-center space-x-3">
            {showModel && model && (
              <div className="flex items-center space-x-1">
                <Brain className="h-3 w-3" />
                <span>{model.name}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Type className="h-3 w-3" />
              <span>{message.content.length.toLocaleString()}</span>
            </div>
            
            {message.tokens && (
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>{message.tokens.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {message.cost && (
            <span className="font-medium text-green-600">
              ${message.cost.toFixed(4)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}