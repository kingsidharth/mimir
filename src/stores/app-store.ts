import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  models: string[];
  total_tokens: number;
  total_cost: number;
  is_bookmarked: boolean;
  is_shared: boolean;
  share_url?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  tokens?: number;
  cost?: number;
  created_at: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  type: 'image' | 'pdf';
  url: string;
  size: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  input_cost: number;
  output_cost: number;
  context_length: number;
  is_expensive: boolean;
  is_reasoning: boolean;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  is_favorite: boolean;
  usage_count: number;
  created_at: string;
}

interface AppState {
  // Current state
  currentChatId: string | null;
  selectedModels: string[];
  isRecording: boolean;
  recordingTime: number;
  sidebarCollapsed: boolean;
  
  // Data
  chats: Chat[];
  messages: Message[];
  models: Model[];
  prompts: Prompt[];
  
  // Settings
  openRouterKey: string;
  budget24h: number;
  transcriptionEnabled: boolean;
  
  // Actions
  setCurrentChatId: (id: string | null) => void;
  setSelectedModels: (models: string[]) => void;
  addModel: (model: string) => void;
  removeModel: (model: string) => void;
  setIsRecording: (recording: boolean) => void;
  setRecordingTime: (time: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Data actions
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  
  // Settings actions
  setOpenRouterKey: (key: string) => void;
  setBudget24h: (budget: number) => void;
  setTranscriptionEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChatId: null,
      selectedModels: ['gpt-3.5-turbo'],
      isRecording: false,
      recordingTime: 0,
      sidebarCollapsed: false,
      
      // Data
      chats: [],
      messages: [],
      models: [
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and efficient for most tasks',
          input_cost: 0.0005,
          output_cost: 0.0015,
          context_length: 16385,
          is_expensive: false,
          is_reasoning: false,
        },
        {
          id: 'gpt-4',
          name: 'GPT-4',
          description: 'Most capable model for complex reasoning',
          input_cost: 0.03,
          output_cost: 0.06,
          context_length: 8192,
          is_expensive: true,
          is_reasoning: false,
        },
        {
          id: 'claude-3-haiku',
          name: 'Claude 3 Haiku',
          description: 'Fast and affordable for simple tasks',
          input_cost: 0.00025,
          output_cost: 0.00125,
          context_length: 200000,
          is_expensive: false,
          is_reasoning: false,
        },
        {
          id: 'claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          description: 'Balanced performance and cost',
          input_cost: 0.003,
          output_cost: 0.015,
          context_length: 200000,
          is_expensive: false,
          is_reasoning: false,
        },
      ],
      prompts: [
        {
          id: '1',
          title: 'Code Review',
          content: 'Please review this code and provide suggestions for improvement:',
          category: 'Development',
          is_favorite: true,
          usage_count: 12,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Explain Concept',
          content: 'Explain the following concept in simple terms:',
          category: 'Education',
          is_favorite: false,
          usage_count: 8,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Writing Assistant',
          content: 'Help me improve this text for clarity and style:',
          category: 'Writing',
          is_favorite: true,
          usage_count: 15,
          created_at: new Date().toISOString(),
        },
      ],
      
      // Settings
      openRouterKey: '',
      budget24h: 10.0,
      transcriptionEnabled: false,
      
      // Actions
      setCurrentChatId: (id) => set({ currentChatId: id }),
      setSelectedModels: (models) => set({ selectedModels: models }),
      addModel: (model) => {
        const { selectedModels } = get();
        if (selectedModels.length < 3 && !selectedModels.includes(model)) {
          set({ selectedModels: [...selectedModels, model] });
        }
      },
      removeModel: (model) => {
        const { selectedModels } = get();
        set({ selectedModels: selectedModels.filter(m => m !== model) });
      },
      setIsRecording: (recording) => set({ isRecording: recording }),
      setRecordingTime: (time) => set({ recordingTime: time }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      // Data actions
      addChat: (chat) => {
        const { chats } = get();
        set({ chats: [chat, ...chats] });
      },
      updateChat: (id, updates) => {
        const { chats } = get();
        set({
          chats: chats.map(chat => 
            chat.id === id ? { ...chat, ...updates } : chat
          )
        });
      },
      deleteChat: (id) => {
        const { chats, messages } = get();
        set({
          chats: chats.filter(chat => chat.id !== id),
          messages: messages.filter(message => message.chat_id !== id),
        });
      },
      addMessage: (message) => {
        const { messages } = get();
        set({ messages: [...messages, message] });
      },
      updateMessage: (id, updates) => {
        const { messages } = get();
        set({
          messages: messages.map(message =>
            message.id === id ? { ...message, ...updates } : message
          )
        });
      },
      
      // Settings actions
      setOpenRouterKey: (key) => set({ openRouterKey: key }),
      setBudget24h: (budget) => set({ budget24h: budget }),
      setTranscriptionEnabled: (enabled) => set({ transcriptionEnabled: enabled }),
    }),
    {
      name: 'mimir-app-store',
      partialize: (state) => ({
        selectedModels: state.selectedModels,
        sidebarCollapsed: state.sidebarCollapsed,
        chats: state.chats,
        messages: state.messages,
        prompts: state.prompts,
        openRouterKey: state.openRouterKey,
        budget24h: state.budget24h,
        transcriptionEnabled: state.transcriptionEnabled,
      }),
    }
  )
);