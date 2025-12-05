import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Star, Trash2, Copy } from "lucide-react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import siteConfig from "~/site.config";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/scripts")({
  component: Scripts,
  beforeLoad: () => ({
    title: `${siteConfig.siteTitle} - Saved Scripts`,
    headerTitle: "Saved Scripts",
    headerDescription: "View and manage your saved hooks, scripts, and content.",
  }),
});

export default function Scripts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const scripts: any[] = [];

  const filteredScripts: any[] = scripts;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-full w-full flex-col bg-secondary px-6 py-8 dark:bg-black">
      <div className="mx-auto flex h-full w-full max-w-screen-xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 dark:bg-black">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                placeholder="Search your saved content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-primary"
              >
                <option value="all">All Types</option>
                <option value="hook">Hooks</option>
                <option value="script">Scripts</option>
                <option value="topic">Topics</option>
                <option value="full_video">Full Videos</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-primary"
              >
                <option value="all">All Categories</option>
                <option value="educational">Educational</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="opinion">Opinion</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>
          </div>
        </div>

        {filteredScripts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-border bg-card p-12 dark:bg-black">
            <FileText className="h-16 w-16 text-primary/40" />
            <h3 className="mt-4 text-lg font-medium text-primary">
              No saved scripts yet
            </h3>
            <p className="mt-2 text-center text-sm text-primary/60">
              Scripts you save from the AI Writer will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredScripts.map((script: any) => (
              <div
                key={script.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 dark:bg-black"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-primary">{script.title}</h4>
                    <div className="mt-1 flex gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        {script.type}
                      </span>
                      {script.category && (
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-primary">
                          {script.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        script.isFavorite
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-primary/60"
                      }`}
                    />
                  </Button>
                </div>

                <p className="line-clamp-3 text-sm text-primary/80">
                  {script.content}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 text-xs"
                    onClick={() => copyToClipboard(script.content)}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
