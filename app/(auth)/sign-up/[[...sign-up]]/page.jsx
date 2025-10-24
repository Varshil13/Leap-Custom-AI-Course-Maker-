import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Join LEAP
          </h1>
        </div>

        <div className="bg-card/80 rounded-lg shadow-xl border border-border p-8 backdrop-blur-sm">
          <div className="flex items-center justify-center">
            <SignUp 
              redirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                  card: "shadow-none border-0 bg-transparent",
                  headerTitle: "text-foreground",
                  headerSubtitle: "text-muted-foreground",
                  socialButtonsBlockButton: 
                    "border-border hover:bg-accent text-foreground",
                  formFieldInput: 
                    "border-border bg-background text-foreground",
                  formFieldLabel: "text-foreground",
                  identityPreviewText: "text-muted-foreground",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                  footerActionText: "text-muted-foreground",
                  footerActionLink: "text-primary hover:text-primary/90"
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}