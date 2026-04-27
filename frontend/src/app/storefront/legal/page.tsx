export default function LegalPage() {
  return (
    <div className="flex h-screen flex-col pt-16">
      <iframe
        src="/legal.pdf"
        className="flex-1 w-full"
        title="Legal Conditions"
      />
    </div>
  );
}
