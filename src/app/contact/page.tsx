
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Mock submission
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl font-bold md:text-5xl">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question about our products or want to discuss a wholesale order? We're here to help.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-none bg-card shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">Phone</h3>
                  <p className="text-sm text-muted-foreground">+1 (555) 789-1234</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri 8am-6pm</p>
                </CardContent>
              </Card>
              <Card className="border-none bg-card shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">Email</h3>
                  <p className="text-sm text-muted-foreground">hello@wubanchi-farm.com</p>
                  <p className="text-xs text-muted-foreground">Expect response in 24h</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none bg-card shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary shrink-0" />
                  <div className="space-y-1">
                    <h3 className="font-bold">Farm Location</h3>
                    <p className="text-muted-foreground">123 Goldenrod Lane, Sunshine Valley, SV 90210</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-primary shrink-0" />
                  <div className="space-y-1">
                    <h3 className="font-bold">Farm Shop Hours</h3>
                    <p className="text-muted-foreground">Daily: 7:00 AM — 7:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="relative h-[300px] w-full overflow-hidden rounded-3xl bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                 <div className="text-center space-y-2">
                   <MapPin className="h-12 w-12 text-primary mx-auto opacity-50" />
                   <p className="text-muted-foreground font-medium">Interactive Map Placeholder</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="border-none shadow-xl bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Send a Message</CardTitle>
              <CardDescription>Fill out the form below and our team will get back to you shortly.</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-500">
                  <div className="mb-6 rounded-full bg-green-100 p-6 text-green-600">
                    <CheckCircle2 className="h-16 w-16" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Thank you for reaching out. We've received your message and will be in touch within one business day.
                  </p>
                  <Button variant="outline" className="mt-8 rounded-full" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Wholesale Inquiry" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="How can we help you?" className="min-h-[150px] resize-none" required />
                  </div>
                  <Button type="submit" className="w-full rounded-full py-6 text-lg font-bold gap-2">
                    <Send className="h-5 w-5" />
                    Send Inquiry
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
