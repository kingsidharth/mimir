import { useState, useEffect, useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useAppStore } from '@/stores/app-store';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Clock, Bot, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const [search, setSearch] = useState('');
  const { chats, messages, setCurrentChatId } = useAppStore();
  const navigate = useNavigate();

  // Parse search filters
  const parseSearch = (query: string) => {
    const filters: {
      before?: Date;
      after?: Date;
      titleHas?: string;
      general?: string;
    } = {};

    const parts = query.split(' ');
    const generalParts: string[] = [];

    parts.forEach(part => {
      if (part.startsWith('before:')) {
        const dateStr = part.replace('before:', '');
        const [day, month, year] = dateStr.split('-');
        if (day && month && year) {
          filters.before = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      } else if (part.startsWith('after:')) {
        const dateStr = part.replace('after:', '');
        const [day, month, year] = dateStr.split('-');
        if (day && month && year) {
          filters.after = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      } else if (part.startsWith('title_has:')) {
        filters.titleHas = part.replace('title_has:', '');
      } else {
        generalParts.push(part);
      }
    });

    if (generalParts.length > 0) {
      filters.general = generalParts.join(' ');
    }

    return filters;
  };

  // Fuzzy search function
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true;
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match
    if (textLower.includes(queryLower)) return true;
    
    // Fuzzy match - allow for typos
    let textIndex = 0;
    let queryIndex = 0;
    let matches = 0;
    
    while (textIndex < textLower.length && queryIndex < queryLower.length) {
      if (textLower[textIndex] === queryLower[queryIndex]) {
        matches++;
        queryIndex++;
      }
      textIndex++;
    }
    
    // Allow for some typos (80% match threshold)
    return matches / queryLower.length >= 0.8;
  };

  // Filter and search chats
  const filteredChats = useMemo(() => {
    if (!search.trim()) return chats.slice(0, 10); // Show recent chats when no search

    const filters = parseSearch(search);
    
    return chats.filter(chat => {
      const chatDate = new Date(chat.updated_at);
      
      // Date filters
      if (filters.before && chatDate > filters.before) return false;
      if (filters.after && chatDate < filters.after) return false;
      
      // Title filter
      if (filters.titleHas && !fuzzyMatch(chat.title, filters.titleHas)) return false;
      
      // General search
      if (filters.general) {
        const chatMessages = messages.filter(m => m.chat_id === chat.id);
        const searchableText = [
          chat.title,
          ...chatMessages.map(m => m.content),
          ...chat.models,
          chat.total_cost.toString(),
          formatDistanceToNow(chatDate)
        ].join(' ');
        
        if (!fuzzyMatch(searchableText, filters.general)) return false;
      }
      
      return true;
    }).slice(0, 20); // Limit results
  }, [search, chats, messages]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    navigate(`/chat/${chatId}`);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTitle>Search Chats</DialogTitle>
      </VisuallyHidden>
      <CommandInput 
        placeholder="Search chats... (try: before:01-01-2024, after:01-12-2023, title_has:project)" 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No chats found.</CommandEmpty>
        <CommandGroup heading="Chats">
          {filteredChats.map(chat => (
            <CommandItem
              key={chat.id}
              value={chat.id}
              onSelect={() => handleSelect(chat.id)}
              className="flex items-center space-x-3 p-3"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{chat.title}</div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{chat.message_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${chat.total_cost.toFixed(4)}</span>
                  </div>
                </div>
                {chat.models.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {chat.models.slice(0, 3).map(model => (
                      <Badge key={model} variant="secondary" className="text-xs">
                        {model.split('-')[0].toUpperCase()}
                      </Badge>
                    ))}
                    {chat.models.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{chat.models.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}