import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8 bg-red-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your job applications in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/applications/new"
            className="mercury-button mercury-button-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Application
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="mercury-stat-card">
          <h3 className="font-medium text-sm mb-2 text-muted-foreground">Applications</h3>
          <p className="text-2xl font-semibold">1</p>
        </div>
        <div className="mercury-stat-card">
          <h3 className="font-medium text-sm mb-2 text-muted-foreground">Interviews</h3>
          <p className="text-2xl font-semibold">0</p>
        </div>
        <div className="mercury-stat-card">
          <h3 className="font-medium text-sm mb-2 text-muted-foreground">Offers</h3>
          <p className="text-2xl font-semibold">0</p>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="rounded-lg border shadow-sm bg-card overflow-hidden">
        <div className="bg-muted/40 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-medium">Recent Applications</h2>
          <div>
            <span className="text-xs text-muted-foreground">1 of 1 applications</span>
          </div>
        </div>
        
        <div className="divide-y">
          <div className="p-4 hover:bg-secondary/30 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-medium">Software Engineer</h3>
                  <span className="mercury-badge mercury-badge-outline">
                    New
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">Example Company</p>
                <div className="flex items-center flex-wrap gap-1.5 mt-3">
                  <span className="mercury-tag">Tech</span>
                  <span className="mercury-tag">Remote</span>
                  <span className="mercury-tag">Full-time</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="mercury-badge mercury-badge-success">
                  Interview Scheduled
                </span>
                <span className="text-xs text-muted-foreground">
                  Applied on Jun 15, 2023
                </span>
                <Link 
                  href="/applications/1" 
                  className="mercury-button mercury-button-outline text-xs h-8 mt-2"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="mercury-card text-center hidden">
        <div className="max-w-md mx-auto py-6">
          <div className="flex justify-center mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-muted-foreground opacity-60"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-medium text-lg mb-2">No applications yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t added any job applications yet. Click &quot;Add Application&quot; to get started.
          </p>
          <Link 
            href="/applications/new"
            className="mercury-button mercury-button-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Application
          </Link>
        </div>
      </div>
    </div>
  );
}
