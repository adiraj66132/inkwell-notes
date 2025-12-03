import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FirebaseSetupBanner() {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground mb-1">Firebase Not Configured</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your notes are being saved locally. To sync across devices and enable cloud storage, 
            add your Firebase configuration to the environment variables.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Setup Firebase
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
