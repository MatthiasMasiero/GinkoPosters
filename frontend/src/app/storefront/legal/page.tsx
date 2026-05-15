import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

function LegalSection({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group border-b border-foreground/10 py-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">
            {number}
          </span>
          <h3 className="text-base font-bold uppercase tracking-tight">
            {title}
          </h3>
        </div>
        <Plus className="h-4 w-4 shrink-0 text-foreground/40 group-open:hidden" />
        <Minus className="hidden h-4 w-4 shrink-0 text-foreground/40 group-open:block" />
      </summary>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
        {children}
      </div>
    </details>
  );
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background px-6 pb-24 pt-28 md:px-16 lg:px-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-12 text-3xl font-extrabold uppercase tracking-tight">
          Legal Conditions
        </h1>

        <div className="border-t border-foreground/10">
          <LegalSection number={1} title="Platform Role Disclaimer">
            <p>
              Ginko Posters operates solely as an online marketplace and technical platform that allows
              independent creators ("Creators") to upload, list, and sell their own artwork and designs.
              Ginko Posters does not create, design, manufacture, or own the artwork sold through the
              platform unless explicitly stated otherwise.
            </p>
            <p>
              All artwork, designs, and creative content are submitted by independent creators, who retain
              responsibility for their content. Ginko Posters functions as a facilitator of transactions
              between creators and buyers and is not the publisher, producer, or legal owner of
              third-party creative content.
            </p>
          </LegalSection>

          <LegalSection number={2} title="Creator Representations and Warranties">
            <p>
              By uploading, listing, or selling content through Ginko Posters, creators represent and warrant that:
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>They own all intellectual property rights to the artwork or have obtained all necessary licenses.</li>
              <li>The content does not infringe on any copyright, trademark, patent, trade secret, publicity rights, or other intellectual property rights.</li>
              <li>The content does not violate any law or third-party rights.</li>
              <li>The content is not defamatory, obscene, or unlawful.</li>
              <li>They have the legal authority to sell and distribute the artwork.</li>
            </ol>
            <p>Creators agree that they are solely responsible for the content they upload and sell.</p>
          </LegalSection>

          <LegalSection number={3} title="Intellectual Property Responsibility">
            <p>
              Creators are solely responsible for ensuring that their uploaded artwork does not infringe on the
              rights of third parties. Ginko Posters does not independently verify the ownership or legality
              of user-submitted content. If a creator uploads content that infringes on third-party rights,
              the creator is solely liable for any resulting legal claims.
            </p>
          </LegalSection>

          <LegalSection number={4} title="Indemnification Clause">
            <p>
              Creators agree to defend, indemnify, and hold harmless Ginko Posters, its owners, employees,
              affiliates, contractors, and partners from any claims, damages, liabilities, losses, legal fees,
              or expenses arising from:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Copyright infringement</li>
              <li>Trademark infringement</li>
              <li>Intellectual property violations</li>
              <li>Defamation claims</li>
              <li>Violations of law</li>
              <li>Any disputes related to uploaded content</li>
            </ul>
            <p>This indemnification includes legal defense costs and attorney fees.</p>
          </LegalSection>

          <LegalSection number={5} title="DMCA Copyright Policy">
            <p>
              Ginko Posters complies with the Digital Millennium Copyright Act (DMCA). If a copyright owner
              believes that content on the platform infringes their rights, they may submit a DMCA takedown request.
            </p>
            <p>Upon receiving a valid DMCA notice, Ginko Posters may:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Remove the allegedly infringing content</li>
              <li>Notify the creator</li>
              <li>Suspend or terminate repeat infringers</li>
            </ul>
            <p>
              Creators who believe their content was removed in error may submit a counter-notification under the DMCA.
            </p>
          </LegalSection>

          <LegalSection number={6} title="Repeat Infringer Policy">
            <p>
              Ginko Posters maintains a repeat infringer policy. Creators who repeatedly upload infringing
              content may have their accounts permanently suspended.
            </p>
          </LegalSection>

          <LegalSection number={7} title="Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Ginko Posters shall not be liable for any indirect,
              incidental, consequential, or punitive damages arising from:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>User-generated content</li>
              <li>Marketplace transactions</li>
              <li>Creator disputes</li>
              <li>Copyright claims</li>
            </ul>
            <p>
              The total liability of Ginko Posters for any claim shall not exceed the amount of fees collected
              by the platform related to the transaction in question.
            </p>
          </LegalSection>

          <LegalSection number={8} title="No Guarantee of Content Legality">
            <p>
              Ginko Posters does not guarantee that any artwork uploaded by creators is free from intellectual
              property claims. Buyers purchase artwork at their own discretion, and creators remain responsible
              for their submissions.
            </p>
          </LegalSection>

          <LegalSection number={9} title="Platform Content License">
            <p>Creators grant Ginko Posters a non-exclusive license to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Display</li>
              <li>Promote</li>
              <li>Market</li>
              <li>Distribute</li>
            </ul>
            <p>
              their artwork solely for the purpose of operating the platform and facilitating sales.
              Creators retain ownership of their intellectual property.
            </p>
          </LegalSection>

          <LegalSection number={10} title="Product Manufacturing Disclaimer">
            <p>
              Posters sold through Ginko Posters may be manufactured by third-party print providers.
              Ginko Posters is not responsible for manufacturing defects, shipping delays, or third-party
              production issues.
            </p>
          </LegalSection>

          <LegalSection number={11} title="Marketplace Payment and Fee Structure">
            <p>
              Ginko Posters may collect platform fees, transaction fees, or commissions from sales.
              Creators acknowledge that Ginko Posters acts as a marketplace facilitator, not the seller
              of record unless explicitly stated.
            </p>
          </LegalSection>

          <LegalSection number={12} title="Governing Law">
            <p>
              These terms shall be governed by the laws of the jurisdiction in which Ginko Posters operates.
            </p>
          </LegalSection>

          <LegalSection number={13} title="Arbitration Clause">
            <p>
              Any disputes arising from use of the platform shall be resolved through binding arbitration,
              except where prohibited by law.
            </p>
          </LegalSection>

          <LegalSection number={14} title="Account Termination">
            <p>Ginko Posters reserves the right to suspend or terminate accounts that:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Upload infringing content</li>
              <li>Violate platform policies</li>
              <li>Engage in fraudulent activity</li>
            </ul>
          </LegalSection>

          <LegalSection number={15} title="Platform Modification Rights">
            <p>Ginko Posters may modify platform policies and terms at any time.</p>
          </LegalSection>
        </div>
      </div>
    </div>
  );
}
