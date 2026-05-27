
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Copy, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Mock submission
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `Phone number ${text} copied to clipboard.` });
  };

  const phoneNumbers = ['+251932224193', '+251920774757', '+251969058626'];

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 animate-in fade-in duration-700">
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
              <Card className="border-none bg-card shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">Call Us</h3>
                  <div className="flex flex-col gap-1 w-full">
                    {phoneNumbers.map((num) => (
                      <div key={num} className="flex items-center justify-center gap-2 group">
                        <a href={`tel:${num}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {num}
                        </a>
                        <button 
                          onClick={() => handleCopy(num)}
                          className="p-1 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none bg-card shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">Email</h3>
                  <p className="text-sm text-muted-foreground">contact@wubanchi.com</p>
                  <p className="text-xs text-muted-foreground">Expect response in 24h</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none bg-card shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary shrink-0" />
                  <div className="space-y-1 text-left">
                    <h3 className="font-bold">Farm Locations</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Bahir Dar, Ethiopia, Bahir Dar Kebele 05 & 08
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Gonder, Ethiopia, Gondar- Piassa Sub City
                    </p>
                    <p className="text-xs text-primary font-bold pt-2 italic">
                      Coming soon in Gorgora and Lalibela
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-4 border-t">
                  <Clock className="h-6 w-6 text-primary shrink-0" />
                  <div className="space-y-1 text-left">
                    <h3 className="font-bold">Farm Shop Hours</h3>
                    <p className="text-muted-foreground">Daily: 7:00 AM — 7:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-card shadow-sm hover:shadow-md transition-all overflow-hidden">
               <Link 
                  href="http://tiktok.com/@twchicken_fish" 
                  target="_blank"
                  className="flex items-center gap-6 p-6 transition-all hover:bg-primary/5 group"
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      className="h-7 w-7 fill-current"
                    >
                      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-foreground">Follow our Journey on TikTok</p>
                    <p className="text-primary font-bold group-hover:underline transition-all">@twchicken_fish</p>
                  </div>
                </Link>
            </Card>
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
