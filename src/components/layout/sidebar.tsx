import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatCard } from '@/components/chat/chat-card';
import { Calendar } from '@/components/ui/calendar';
import { SearchCommand } from '@/components/search/search-command';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAppStore } from '@/stores/app-store';
import { 
  Search, 
  Calendar as CalendarIcon, 
  MessageSquare,
  X,
  Settings,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isSameDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { LoaderPinwheelIcon } from '@/components/animate-ui/icons/loader-pinwheel';

export function Sidebar() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  
  const {
    sidebarCollapsed,
    chats,
    currentChatId,
    setCurrentChatId,
  } = useAppStore();

  const filteredChats = chats.filter(chat => {
    const matchesDate = dateFilter ? isSameDay(new Date(chat.updated_at), dateFilter) : true;
    return matchesDate;
  });

  // Group chats by time
  const groupChatsByTime = (chats: typeof filteredChats) => {
    const now = new Date();
    const groups: { [key: string]: typeof chats } = {
      Today: [],
      Yesterday: [],
      'Last 7 days': [],
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.updated_at);
      const diffInHours = (now.getTime() - chatDate.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        groups.Today.push(chat);
      } else if (diffInHours < 48) {
        groups.Yesterday.push(chat);
      } else if (diffInHours < 168) {
        groups['Last 7 days'].push(chat);
      } else {
        const monthYear = chatDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByTime(filteredChats);

  // Get chat counts by date for calendar dots
  const getChatCountForDate = (date: Date) => {
    return chats.filter(chat => isSameDay(new Date(chat.updated_at), date)).length;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setDateFilter(date);
    }
  };

  const clearDateFilter = () => {
    setDateFilter(null);
    setShowCalendar(false);
  };

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-80 glass-1 border-r border-border/20 z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border/20">
            <div className="flex items-center space-x-2">
              <LoaderPinwheelIcon 
                className="h-6 w-6 text-primary" 
                animation="default"
              />
              <span className="text-xl font-normal text-foreground">
                Mimir
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-b border-border/20">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-9"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4 mr-2" strokeWidth={1.25} />
                Search
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start h-9"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {showCalendar ? (
                  <>
                    <X className="h-4 w-4 mr-2" strokeWidth={1.25} />
                    Close
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4 mr-2" strokeWidth={1.25} />
                    Calendar
                  </>
                )}
              </Button>
            </div>

            {/* Calendar */}
            {showCalendar && (
              <div className="mt-4 animate-in slide-in-from-top-2">
                <div className="w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border p-2 w-full"
                    classNames={{
                      day_button: "rounded-full relative w-8 h-8",
                      table: "w-full",
                      head_row: "flex w-full",
                      head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1",
                      row: "flex w-full mt-2",
                      cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md flex-1",
                    }}
                    components={{
                      DayContent: ({ date }) => {
                        const chatCount = getChatCountForDate(date);
                        return (
                          <div className="relative w-full h-full flex items-center justify-center">
                            {date.getDate()}
                            {chatCount > 0 && (
                              <div 
                                className={cn(
                                  "absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full",
                                  chatCount <= 2 ? "bg-primary/40" :
                                  chatCount <= 5 ? "bg-primary/70" : "bg-primary"
                                )}
                              />
                            )}
                          </div>
                        );
                      }
                    }}
                  />
                </div>
                {dateFilter && (
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    Showing chats from {format(dateFilter, 'MMM d, yyyy')}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearDateFilter}
                      className="ml-2 h-auto p-0 text-xs underline"
                    >
                      Clear filter
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {Object.entries(groupedChats).map(([group, groupChats]) => {
                if (groupChats.length === 0) return null;
                
                return (
                  <div key={group}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {group}
                    </h3>
                    <div className="space-y-2">
                      {groupChats.map(chat => (
                        <ChatCard
                          key={chat.id}
                          chat={chat}
                          isActive={chat.id === currentChatId}
                          onClick={() => setCurrentChatId(chat.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredChats.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.25} />
                  <p className="text-muted-foreground">
                    {dateFilter ? 'No chats found' : 'No chats yet'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/20 space-y-2">
            <Button variant="ghost" className="w-full justify-start h-9" asChild>
              <Link to="/settings">
                <Palette className="h-4 w-4 mr-2" strokeWidth={1.25} />
                Appearance
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-9" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" strokeWidth={1.25} />
                Settings
              </Link>
            </Button>

            <div className="flex justify-center pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Search Command */}
      <SearchCommand open={showSearch} onOpenChange={setShowSearch} />
    </>
  );
}