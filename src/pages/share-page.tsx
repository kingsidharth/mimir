import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCard } from '@/components/chat/message-card';
import { useAppStore } from '@/stores/app-store';
import { Bird, Calendar, MessageSquare, Bot, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SharePage() {
  const { chatId } = useParams();
  const { chats, messages } = useAppStore();
  
  const chat = chats.find(c => c.id === chatId);
  const chatMessages = chat ? messages.filter(m => m.chat_id === chat.id) : [];

  if (!chat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
        <Card className="glass p-8 text-center max-w-md">
          <Bird className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Chat Not Found</h1>
          <p className="text-muted-foreground">
            This shared chat doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Bird className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mimir
            </span>
            <Badge variant="secondary">Shared Chat</Badge>
          </div>
          
          <div>
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
                <span>{chat.message_count} messages</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Bot className="h-4 w-4" />
                <span>{chat.models.length} models</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-4xl mx-auto p-6">
        {chatMessages.length > 0 ? (
          <div className="space-y-6">
            {chatMessages.map(message => (
              <MessageCard 
                key={message.id} 
                message={message} 
                showModel 
              />
            ))}
          </div>
        ) : (
          <Card className="glass p-8 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Messages</h2>
            <p className="text-muted-foreground">
              This chat doesn't have any messages yet.
            </p>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-background/50 backdrop-blur-sm mt-12">
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mimir AI
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}