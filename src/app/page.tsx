import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types based on the actual return structure from Supabase
interface Tag {
  id: string;
  name: string;
}

interface PositionTag {
  tags: Tag;
}

interface Company {
  id: string;
  name: string;
}

interface JobPosition {
  id: string;
  title: string;
  companies: Company;
  position_tags: PositionTag[];
}

interface Application {
  id: string;
  current_status: string;
  applied_at: string;
  job_positions: JobPosition;
}

export default async function Home() {
  // Fetch applications data
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      current_status,
      applied_at,
      job_positions (
        id,
        title,
        companies (
          id,
          name
        ),
        position_tags (
          tags (
            id,
            name
          )
        )
      )
    `)
    .order('applied_at', { ascending: false });

  // Get total counts for stats
  const { count: totalApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalInterviews } = await supabase
    .from('interviews')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalOffers } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('current_status', 'offered');

  // Type-safe applications data
  const typedApplications = applications as unknown as Application[];

  return (
    <div className="space-y-8">
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
          <p className="text-2xl font-semibold">{totalApplications || 0}</p>
        </div>
        <div className="mercury-stat-card">
          <h3 className="font-medium text-sm mb-2 text-muted-foreground">Interviews</h3>
          <p className="text-2xl font-semibold">{totalInterviews || 0}</p>
        </div>
        <div className="mercury-stat-card">
          <h3 className="font-medium text-sm mb-2 text-muted-foreground">Offers</h3>
          <p className="text-2xl font-semibold">{totalOffers || 0}</p>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="rounded-lg border shadow-sm bg-card overflow-hidden">
        <div className="bg-muted/40 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-medium">Recent Applications</h2>
          <div>
            <span className="text-xs text-muted-foreground">
              {typedApplications?.length || 0} of {totalApplications || 0} applications
            </span>
          </div>
        </div>
        
        <div className="divide-y">
          {typedApplications && typedApplications.length > 0 ? (
            typedApplications.map((application) => (
              <div key={application.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-medium">{application.job_positions.title}</h3>
                      {application.current_status === 'applied' && (
                        <span className="mercury-badge mercury-badge-outline">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{application.job_positions.companies.name}</p>
                    <div className="flex items-center flex-wrap gap-1.5 mt-3">
                      {application.job_positions.position_tags?.map((pt) => (
                        <span key={pt.tags.id} className="mercury-tag">{pt.tags.name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`mercury-badge ${
                      application.current_status === 'offered' ? 'mercury-badge-success' :
                      application.current_status === 'denied' ? 'mercury-badge-destructive' :
                      'mercury-badge-outline'
                    }`}>
                      {application.current_status.charAt(0).toUpperCase() + application.current_status.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Applied on {format(new Date(application.applied_at), 'MMM d, yyyy')}
                    </span>
                    <Link 
                      href={`/applications/${application.id}`}
                      className="mercury-button mercury-button-outline text-xs h-8 mt-2"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No applications found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Empty State - show when there are no applications */}
      {!typedApplications || typedApplications.length === 0 ? (
        <div className="mercury-card text-center">
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
      ) : null}
    </div>
  );
}
