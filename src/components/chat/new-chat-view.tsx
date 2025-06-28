import { MessageInput } from './message-input';
import { useAppStore } from '@/stores/app-store';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BotIcon } from '@/components/animate-ui/icons/bot';
import { SparklesCore } from '@/components/ui/sparkles-core';

export function NewChatView() {
  const { openRouterKey } = useAppStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center px-6 py-12 min-h-full relative">
          {/* Particles background */}
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="tsparticles"
              background="transparent"
              minSize={1}
              maxSize={2}
              particleDensity={80}
              className="w-full h-full"
              particleColor="#0bb2cd"
              speed={2}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center mb-8">
            {/* OpenRouter Key Warning */}
            {!openRouterKey && (
              <Alert className="max-w-2xl mb-8 border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                  Finish Setup to Start using Mimir.{' '}
                  <a 
                    href="/settings" 
                    className="underline hover:no-underline font-medium"
                  >
                    Configure in Settings
                  </a>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mb-6">
              <BotIcon 
                className="h-16 w-16 text-primary mx-auto" 
                animation="default"
                strokeWidth={1.75}
              />
            </div>
            
            <h1 className="text-3xl font-medium mb-8 text-foreground">
              Hello there! Let's chat?
            </h1>
          </div>

          {/* Message input in center */}
          <div className="w-full max-w-4xl relative z-10">
            <MessageInput isNewChat />
          </div>
        </div>
      </div>
    </div>
  );
}