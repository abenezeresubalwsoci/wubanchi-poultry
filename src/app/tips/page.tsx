
"use client";

import { useState } from "react";
import { poultryCareAdvisor } from "@/ai/flows/poultry-care-advisor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bird, Send, Loader2, Sparkles, AlertCircle, Quote } from "lucide-react";

export default function PoultryTips() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await poultryCareAdvisor(input);
      setResponse(result);
    } catch (err) {
      setError("I'm sorry, I couldn't connect to my knowledge base right now. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">Wubanchi AI Advisor</h1>
          <p className="text-lg text-muted-foreground mx-auto max-w-2xl">
            Get personalized advice from our expert poultry care system. Ask about nutrition, health, brooder setup, or recipe ideas.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bird className="h-5 w-5 text-primary" />
                  Ask Wubanchi
                </CardTitle>
                <CardDescription>Enter your question about poultry care or products.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder="E.g., How much feed do 10 broiler chicks need in their first week?"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[150px] resize-none rounded-xl"
                  />
                  <Button 
                    type="submit" 
                    className="w-full rounded-full gap-2 font-bold"
                    disabled={loading || !input.trim()}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Get Expert Advice
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground px-1">Common Questions</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Best organic feed for egg layers?",
                  "Signs of a healthy day-old chick",
                  "How to prepare a whole roast chicken",
                  "Managing poultry heat stress",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="rounded-full border bg-background px-4 py-2 text-xs font-medium transition-colors hover:bg-primary/10 hover:border-primary"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {response ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="overflow-hidden border-none bg-primary shadow-xl">
                  <CardContent className="p-0">
                    <div className="bg-white/10 p-4 flex items-center gap-3 border-b border-white/10">
                      <div className="rounded-full bg-white/20 p-1.5">
                        <Bird className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-bold text-white">Wubanchi's Advice</span>
                    </div>
                    <div className="p-8 space-y-6">
                      <Quote className="h-10 w-10 text-white/20" />
                      <div className="prose prose-invert max-w-none">
                        <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                          {response}
                        </p>
                      </div>
                      <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs text-white/60">Generated by Wubanchi AI</span>
                        <Button variant="ghost" size="sm" onClick={() => setResponse(null)} className="text-white hover:bg-white/10">
                          Ask another
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : error ? (
              <Card className="border-destructive/20 bg-destructive/5 text-destructive text-center p-12">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Oops!</h3>
                <p>{error}</p>
                <Button variant="outline" className="mt-6 rounded-full" onClick={() => setError(null)}>
                  Try again
                </Button>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-muted rounded-3xl text-center p-8 space-y-4">
                <div className="bg-muted rounded-full p-6 animate-pulse">
                  <Bird className="h-16 w-16 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground">Expert advice is one click away</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your question will be answered by our AI trained on decades of poultry farming wisdom.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
