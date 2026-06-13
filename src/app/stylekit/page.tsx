"use client";

/**
 * Lighten Stylekit — a living reference for the shadcn/ui + AI Elements
 * foundation, themed with the Lighten brand tokens (sage green, warm
 * neutrals, Instrument Serif / Plus Jakarta). View at /stylekit.
 * Safe to delete once the team is comfortable with the building blocks.
 */

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Suggestions,
  Suggestion,
} from "@/components/ai-elements/suggestion";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function StylekitPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-14">
        {/* Header */}
        <header className="space-y-3">
          <Badge variant="secondary" className="rounded-full">
            Lighten Stylekit
          </Badge>
          <h1 className="font-serif text-5xl italic leading-tight">
            Building blocks, the Lighten way.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            shadcn/ui primitives and Vercel AI Elements, themed with our sage
            palette and type. Repeatable, accessible, and consistent — so the
            app never feels janky.
          </p>
        </header>

        <Separator />

        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button onClick={() => toast.success("That's a Lighten toast 🌿")}>
              Fire a toast
            </Button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </Section>

        {/* Cards + form */}
        <Section title="Cards & inputs">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>
                  A simple form composed from primitives.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea id="note" placeholder="What are you working on?" />
                </div>
              </CardContent>
              <CardFooter className="gap-3">
                <Button>Subscribe</Button>
                <Button variant="ghost">Cancel</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tabs</CardTitle>
                <CardDescription>View switching, themed.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">
                    Summary metrics and highlights live here.
                  </TabsContent>
                  <TabsContent value="activity" className="pt-4 text-sm text-muted-foreground">
                    A feed of recent events.
                  </TabsContent>
                  <TabsContent value="settings" className="pt-4 text-sm text-muted-foreground">
                    Preferences and configuration.
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* AI Elements */}
        <Section title="AI Elements — chat">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Conversation className="h-[280px]">
                <ConversationContent>
                  <Message from="user">
                    <MessageContent>
                      Draft a short post about AI agents for small businesses.
                    </MessageContent>
                  </Message>
                  <Message from="assistant">
                    <MessageContent>
                      Here&apos;s a punchy opener: *&ldquo;Your team&apos;s best
                      new hire doesn&apos;t need a desk.&rdquo;* Want me to keep
                      going with three concrete use cases?
                    </MessageContent>
                  </Message>
                </ConversationContent>
              </Conversation>
            </CardContent>
          </Card>
          <Suggestions>
            <Suggestion suggestion="Add three use cases" onClick={(s) => toast(s)} />
            <Suggestion suggestion="Make it more formal" onClick={(s) => toast(s)} />
            <Suggestion suggestion="Shorten to a tweet" onClick={(s) => toast(s)} />
          </Suggestions>
        </Section>
      </div>
    </div>
  );
}
