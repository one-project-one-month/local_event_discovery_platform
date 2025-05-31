import { PlusCircle, Search, Users, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function HelpFooter() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-8 border-t bg-muted/40">
      <div className="container mx-auto px-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-4 hover:bg-muted/20 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </button>

        <div
          className={cn(
            'overflow-hidden transition-all duration-200 ease-in-out',
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <h2 className="text-lg font-semibold mb-6 px-4">Need Help Managing Your Events?</h2>
          <div className="grid gap-8 md:grid-cols-3 pb-8 px-4">
            <div className="flex items-start gap-3">
              <PlusCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1.5">Create an Event</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Click the "Create New Event" button to get started with setting up your next
                  event.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Search className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1.5">Filter and Search</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use the search bar and filters to quickly find specific events in your list.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1.5">Manage Attendees</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  View and manage your event's attendees by clicking on the event details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
