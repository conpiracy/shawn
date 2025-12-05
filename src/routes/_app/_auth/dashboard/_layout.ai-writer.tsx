import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Sparkles, Save } from "lucide-react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import siteConfig from "~/site.config";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "~/convex/_generated/api";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/ai-writer")({
  component: AIWriter,
  beforeLoad: () => ({
    title: `${siteConfig.siteTitle} - AI Script Writer`,
    headerTitle: "AI Script Writer",
    headerDescription: "Generate hooks, scripts, and topic ideas for short-form video content.",
  }),
});

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIWriter() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI script writing assistant. I can help you create engaging hooks, complete video scripts, and topic ideas for TikTok, Instagram Reels, and YouTube Shorts.\n\nTo get started, tell me about your niche, target audience, and what kind of content you want to create.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [niche, setNiche] = useState("");
  const [avatar, setAvatar] = useState("");
  const [tone, setTone] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatAction = useConvexMutation(api.ai.chat);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message, timestamp: new Date() },
      ]);

      const response = await chatAction({
        message,
        niche: niche || undefined,
        avatar: avatar || undefined,
        tone: tone || undefined,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response, timestamp: new Date() },
      ]);

      return response;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    sendMessage.mutate(input);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full w-full flex-col bg-secondary px-6 py-8 dark:bg-black">
      <div className="mx-auto flex h-full w-full max-w-screen-xl flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 dark:bg-black">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-medium text-primary">Context (Optional)</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Your niche (e.g., fitness for entrepreneurs)"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Target audience (e.g., busy professionals)"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Brand tone (e.g., casual, professional)"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card dark:bg-black">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary"
                    }`}
                  >
                    {message.role === "user" ? "U" : "AI"}
                  </div>
                  <div
                    className={`flex-1 rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary/10"
                        : "bg-secondary"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-sm text-primary">
                        {message.content}
                      </p>
                    </div>
                    {message.role === "assistant" && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                        >
                          <Save className="mr-1 h-3 w-3" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sendMessage.isPending && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    AI
                  </div>
                  <div className="flex-1 rounded-lg bg-secondary p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message... (e.g., 'Generate 20 hooks about productivity')"
                className="flex-1"
                disabled={sendMessage.isPending}
              />
              <Button
                type="submit"
                disabled={sendMessage.isPending || !input.trim()}
                size="sm"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
