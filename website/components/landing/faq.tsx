"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What courses are supported?",
    answer:
      "We support all courses on SWAYAM and NPTEL platforms. You can search for any course and subscribe to notifications for announcements, deadlines, and updates.",
  },
  {
    question: "How do I receive notifications?",
    answer:
      "You can choose to receive notifications via email, Telegram, or both. For Telegram, you'll need to provide your username or chat ID after starting a chat with our bot.",
  },
  {
    question: "Is the Assignment Solver extension safe to use?",
    answer:
      "Yes! The extension runs entirely in your browser and doesn't collect any personal data. Your Gemini API key is stored locally and never sent to our servers. The extension only activates on NPTEL assignment pages.",
  },
  {
    question: "Do I need a Gemini API key for the extension?",
    answer:
      "Yes, the Assignment Solver uses Google's Gemini AI to analyze questions. You'll need to get a free API key from Google AI Studio. The extension will guide you through the setup process.",
  },
  {
    question: "Is this service free?",
    answer:
      "Both tools are completely free to use. The Notice Reminders service and the Assignment Solver extension are open source and community-maintained.",
  },
  {
    question: "Can I unsubscribe from notifications?",
    answer:
      "Yes, you can manage your subscriptions at any time. Each notification email includes an unsubscribe link, and you can also manage subscriptions through our dashboard.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 relative" id="faq">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about our tools
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "rounded-xl border transition-all",
                openIndex === index
                  ? "bg-card border-primary/20"
                  : "bg-card/30 border-border/50 hover:border-border"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4"
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200",
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
