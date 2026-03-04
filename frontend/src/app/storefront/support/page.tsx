"use client";

import { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { SHIPPING_COST } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "How long does shipping take?",
    answer:
      "Orders are typically printed and shipped within 3-5 business days. Delivery takes an additional 3-7 business days depending on your location within Europe.",
  },
  {
    question: "What is the print quality like?",
    answer:
      "All posters are printed on premium 200gsm matte paper using archival-quality inks. Colours are vibrant and long-lasting, designed to look great on your wall for years.",
  },
  {
    question: "Can I return or exchange a poster?",
    answer:
      "Since every poster is printed on demand, we cannot accept returns for change of mind. However, if your order arrives damaged or there is a printing defect, contact us within 14 days and we will send a replacement at no cost.",
  },
  {
    question: "Do you ship outside Europe?",
    answer:
      "Currently we ship within the EU. We are working on expanding to other regions — reach out to us if you have questions about international orders.",
  },
  {
    question: "Can I request a custom size?",
    answer:
      "At the moment we offer A4, A3, A2, and A1 sizes. If you need a custom size, contact us and we will see what we can do.",
  },
  {
    question: "Do you offer bulk or wholesale pricing?",
    answer:
      "Yes! If you are interested in ordering multiple prints for a business, event, or gift, reach out to us and we can arrange special pricing.",
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

        {/* Shipping & Returns */}
        <section className="mt-16">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">
            Shipping &amp; Returns
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Processing:</span>{" "}
              All orders are printed on demand and typically ship within 3-5 business days.
            </p>
            <p>
              <span className="font-medium text-foreground">Shipping cost:</span>{" "}
              Flat rate of {formatCurrency(SHIPPING_COST)} per order within the EU.
            </p>
            <p>
              <span className="font-medium text-foreground">Delivery:</span>{" "}
              3-7 business days after dispatch, depending on your location.
            </p>
            <p>
              <span className="font-medium text-foreground">Returns:</span>{" "}
              Since items are printed on demand, we do not accept returns for change of mind.
              If your order arrives damaged or defective, contact us within 14 days for a free replacement.
            </p>
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
                <p className="text-sm font-medium">Email us</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Have a question, issue, or special request? We typically respond within 24 hours.
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
