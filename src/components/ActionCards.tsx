'use client';

import type { ClientAction, CalendarEventAction, MapsAction } from '@/hooks/useVoiceAgent';

interface ActionCardsProps {
  actions: ClientAction[];
  onDismiss: (index: number) => void;
}

export function ActionCards({ actions, onDismiss }: ActionCardsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {actions.map((action, index) => (
        <ActionCard
          key={`${action.type}-${index}`}
          action={action}
          onDismiss={() => onDismiss(index)}
        />
      ))}
    </div>
  );
}

interface ActionCardProps {
  action: ClientAction;
  onDismiss: () => void;
}

function ActionCard({ action, onDismiss }: ActionCardProps) {
  switch (action.type) {
    case 'show_calendar_event':
      return <CalendarEventCard action={action as CalendarEventAction} onDismiss={onDismiss} />;
    case 'Maps':
      return <MapsCard action={action as MapsAction} onDismiss={onDismiss} />;
    default:
      return <GenericCard action={action} onDismiss={onDismiss} />;
  }
}

// Calendar Event Card
function CalendarEventCard({
  action,
  onDismiss,
}: {
  action: CalendarEventAction;
  onDismiss: () => void;
}) {
  const { title, time, date, description, location } = action.payload;

  return (
    <div className="relative group animate-slide-up">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
      
      {/* Card content */}
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Calendar icon with gradient background */}
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30">
              <svg
                className="w-5 h-5 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
                Event Scheduled
              </p>
              <h3 className="text-lg font-semibold text-white mt-0.5">{title}</h3>
            </div>
          </div>
          
          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{date}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{time}</span>
            </div>
          </div>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{location}</span>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-slate-400 mt-2 pt-2 border-t border-slate-700/50">
              {description}
            </p>
          )}
        </div>

        {/* Success indicator */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
      </div>
    </div>
  );
}

// Maps Card
function MapsCard({
  action,
  onDismiss,
}: {
  action: MapsAction;
  onDismiss: () => void;
}) {
  const { url, title } = action.payload;

  const handleOpenMap = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative group animate-slide-up">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
      
      {/* Card content */}
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Map icon */}
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                Location
              </p>
              <h3 className="text-lg font-semibold text-white mt-0.5">
                {title || 'View on Maps'}
              </h3>
            </div>
          </div>
          
          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Open Map Button */}
        <button
          onClick={handleOpenMap}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 
                     bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                     border border-blue-500/30 rounded-xl
                     text-blue-400 font-medium text-sm
                     hover:from-blue-500/20 hover:to-purple-500/20
                     transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in Maps
        </button>
      </div>
    </div>
  );
}

// Generic Action Card (fallback)
function GenericCard({
  action,
  onDismiss,
}: {
  action: ClientAction;
  onDismiss: () => void;
}) {
  return (
    <div className="relative group animate-slide-up">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-500 to-slate-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300" />
      
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-700/50 border border-slate-600/50">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Action
              </p>
              <h3 className="text-lg font-semibold text-white mt-0.5 capitalize">
                {action.type.replace(/_/g, ' ')}
              </h3>
            </div>
          </div>
          
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Show payload data */}
        <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
          <pre className="text-xs text-slate-400 overflow-auto">
            {JSON.stringify(action.payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
