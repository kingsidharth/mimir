import { Button } from '@/components/ui/button';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

export function SidebarToggle() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      className="fixed top-4 left-4 z-50 h-8 w-8 glass-0"
    >
      {sidebarCollapsed ? (
        <PanelRightClose className="h-4 w-4" strokeWidth={1.25} />
      ) : (
        <PanelRightOpen className="h-4 w-4" strokeWidth={1.25} />
      )}
    </Button>
  );
}