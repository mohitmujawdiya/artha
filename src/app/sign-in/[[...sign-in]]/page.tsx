import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "bg-artha-surface border border-white/10 shadow-xl",
            headerTitle: "text-artha-text",
            headerSubtitle: "text-artha-muted",
            formButtonPrimary: "bg-artha-accent hover:bg-artha-accent/90",
            formFieldInput: "bg-artha-bg border-white/10 text-artha-text",
            formFieldLabel: "text-artha-muted",
            footerActionLink: "text-artha-accent",
          },
        }}
      />
    </main>
  );
}
