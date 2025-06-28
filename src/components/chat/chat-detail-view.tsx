import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageInput } from './message-input';
import { MessageCard } from './message-card';
import { useAppStore, type Chat } from '@/stores/app-store';
import { 
  Clock, 
  MessageSquare, 
  Bot, 
  TextCursor, 
  Bookmark,
  Share2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatDetailViewProps {
  chat: Chat;
}

export function ChatDetailView({ chat }: ChatDetailViewProps) {
  const { messages, selectedModels } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatMessages = messages.filter(m => m.chat_id === chat.id);
  
  // Group messages by model for multi-model view
  const messagesByModel = selectedModels.reduce((acc, model) => {
    acc[model] = chatMessages.filter(m => m.model === model || (m.role === 'user' && !m.model));
    return acc;
  }, {} as Record<string, typeof chatMessages>);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <header className="border-b border-border/20 bg-background/50 backdrop-blur-sm p-6 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{chat.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{chat.message_count.toLocaleString()} messages</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Bot className="h-4 w-4" />
                  <span>{chat.models.length} models</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <TextCursor className="h-4 w-4" />
                  <span>{chat.total_tokens.toLocaleString()} tokens</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${chat.total_cost.toFixed(4)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  chat.is_bookmarked && 'text-yellow-500'
                )}
              >
                <Bookmark className={cn(
                  'h-4 w-4',
                  chat.is_bookmarked && 'fill-current'
                )} />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {selectedModels.length === 1 ? (
          // Single model view
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {chatMessages.map(message => (
                <MessageCard 
                  key={message.id} 
                  message={message} 
                  showModel 
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : (
          // Multi-model columns view
          <div className="flex h-full">
            {selectedModels.map((model, index) => (
              <div 
                key={model} 
                className={cn(
                  'flex-1 border-r border-border/20 last:border-r-0',
                  'flex flex-col overflow-hidden'
                )}
              >
                {/* Model header */}
                <div className="p-4 border-b border-border/20 bg-muted/50 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">{model}</span>
                    </div>
                    {/* TODO: Add enable/disable switch */}
                  </div>
                </div>
                
                {/* Messages for this model */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {messagesByModel[model]?.map(message => (
                      <MessageCard 
                        key={`${message.id}-${model}`} 
                        message={message} 
                        compact 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-border/20 bg-background/50 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto p-6">
          <MessageInput chatId={chat.id} />
        </div>
      </div>
    </div>
  );
}