import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { Sparkles, Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIAssistantPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setStreaming(true);

    try {
      abortControllerRef.current = new AbortController();

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          contents: conversationHistory,
        },
      });

      if (error) {
        const errorMsg = await error?.context?.text?.();
        console.error('AI chat error:', errorMsg || error?.message);
        throw new Error(errorMsg || error.message || 'Failed to get AI response');
      }

      if (data?.response) {
        setMessages(prev => [...prev, { role: 'model', content: data.response }]);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase gradient-text flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-warning pixel-bounce" />
            AI ASSISTANT
          </h1>
          <p className="text-muted-foreground mt-1">
            Get instant help with your studies and deadlines
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            onClick={clearChat}
            variant="outline"
            className="uppercase pixel-button-press"
          >
            CLEAR CHAT
          </Button>
        )}
      </div>

      <Card className="pixel-border pixel-shadow flex flex-col h-[calc(100%-8rem)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase">
            <Bot className="h-5 w-5" />
            CHAT WITH AI
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <Sparkles className="h-16 w-16 text-warning pixel-bounce" />
                <div>
                  <h3 className="text-xl font-bold uppercase mb-2">
                    WELCOME, {profile?.name || profile?.username}!
                  </h3>
                  <p className="text-muted-foreground">
                    Ask me anything about your deadlines, study tips, or career advice.
                  </p>
                </div>
                <div className="grid gap-2 w-full max-w-md">
                  <Button
                    variant="outline"
                    className="pixel-button-press text-left justify-start"
                    onClick={() => setInput('How can I manage my deadlines better?')}
                  >
                    How can I manage my deadlines better?
                  </Button>
                  <Button
                    variant="outline"
                    className="pixel-button-press text-left justify-start"
                    onClick={() => setInput('Give me study tips for exams')}
                  >
                    Give me study tips for exams
                  </Button>
                  <Button
                    variant="outline"
                    className="pixel-button-press text-left justify-start"
                    onClick={() => setInput('How to prepare for product company interviews?')}
                  >
                    How to prepare for product company interviews?
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'model' && (
                      <div className="shrink-0 w-8 h-8 rounded bg-primary flex items-center justify-center pixel-border-thin">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-4 pixel-border-thin ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent'
                      }`}
                    >
                      {message.role === 'model' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="shrink-0 w-8 h-8 rounded bg-secondary flex items-center justify-center pixel-border-thin">
                        <User className="h-5 w-5 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="shrink-0 w-8 h-8 rounded bg-primary flex items-center justify-center pixel-border-thin">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="max-w-[80%] p-4 pixel-border-thin bg-accent">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="pixel-border-thin resize-none"
                rows={3}
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="uppercase pixel-button-press pixel-shadow-sm shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    SEND
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
