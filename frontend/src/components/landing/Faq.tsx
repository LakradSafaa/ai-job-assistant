"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Faq() {
  return (
    <section className="bg-[#F8FAFC] py-28">

      <div className="mx-auto max-w-4xl px-6">

        <h2 className="mb-16 text-center text-5xl font-black">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible>

          <AccordionItem value="1">
            <AccordionTrigger>
              Is AI Job Assistant free?
            </AccordionTrigger>
            <AccordionContent>
              Yes. A free plan is available.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="2">
            <AccordionTrigger>
              Can AI improve my CV?
            </AccordionTrigger>
            <AccordionContent>
              Yes. Our AI analyzes your resume and suggests improvements.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="3">
            <AccordionTrigger>
              Which AI model is used?
            </AccordionTrigger>
            <AccordionContent>
              Ollama running locally with open-source LLMs.
            </AccordionContent>
          </AccordionItem>

        </Accordion>

      </div>

    </section>
  );
}