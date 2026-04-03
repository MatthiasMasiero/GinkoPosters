"use client";

import { useState } from "react";
import { ChevronDown, Mail, Package, Globe, Image } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "How long does shipping take?",
    answer:
      "Orders are typically printed and dispatched within 2–4 business days. Delivery times vary depending on your location and local postal service. Once your order ships, you will receive a tracking number within 24 hours so you can follow its progress.",
  },
  {
    question: "What is the print quality like?",
    answer:
      "All posters are printed on premium 200gsm+ matte paper (depending on location) using archival-quality inks to ensure rich colours, sharp detail, and long-lasting durability. Each print is produced to deliver gallery-quality results designed to look great on your wall for years.",
  },
  {
    question: "Can I return or exchange a poster?",
    answer:
      "Because each poster is printed to order, we are unable to accept returns for change of mind. However, if your order arrives damaged or with a printing defect, please contact us within 14 days of delivery, and we will arrange a replacement at no additional cost.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes — we ship worldwide. Shipping cost, availability, and delivery times may vary depending on your location and local postal services.",
  },
  {
    question: "Do you offer bulk or wholesale pricing?",
    answer:
      "Yes. If you are interested in ordering multiple prints for a business, event, or retail location, please contact us, and we can arrange custom pricing for larger orders.",
  },
];

const INFO_CARDS = [
  {
    icon: Package,
    title: "SHIPPING",
    description:
      "We ship worldwide. Shipping costs and delivery times depend on your location and local postal services.",
  },
  {
    icon: Globe,
    title: "TRACKING",
    description:
      "Printed to order and dispatched within 2–4 business days. Tracking is provided within 24 hours after shipment.",
  },
  {
    icon: Image,
    title: "PRODUCT DETAILS",
    description:
      "Printed on premium 200gsm+ matte paper using archival-quality inks for sharp detail and long-lasting colour. Each poster is printed to order and carefully packaged to arrive in perfect condition, ready to frame and display. Frame not included.",
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-sm font-medium transition-colors hover:text-foreground/80"
      >
        {question}
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="page-enter px-6 py-12 md:px-12">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">
          How can we help?
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Find answers to common questions or get in touch with our team.
        </p>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">
            Frequently Asked Questions
          </h2>
          <div className="mt-6">
            {FAQ_ITEMS.map((item) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </section>

        {/* Shipping, Tracking & Product Details */}
        <section className="mt-16">
          <div className="divide-y divide-border overflow-hidden rounded-lg bg-muted/50">
            {INFO_CARDS.map((card) => (
              <div key={card.title} className="flex items-start gap-5 p-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-16">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">
            Contact Us
          </h2>
          <div className="mt-6 border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-foreground text-background">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24 hours.
                </p>
                <a
                  href="mailto:Ginkoposters@gmail.com"
                  className="mt-3 inline-block text-sm font-bold underline transition-colors duration-200 hover:text-foreground/80"
                >
                  Ginkoposters@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
