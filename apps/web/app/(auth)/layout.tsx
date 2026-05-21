import { Brain } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Brain className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold">VoiceMind</h2>
          <p className="mt-4 text-muted-foreground">
            AI-powered voice analysis for mental health professionals. Gain
            deeper insights into your patients&apos; emotional well-being.
          </p>
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
