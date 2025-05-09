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
    <main className="container">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-description">Track and manage your job applications in one place</p>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
              <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
            </svg>
            Applications
          </div>
          <div className="stat-value">{totalApplications || 0}</div>
          <div className="stat-meta">
            {totalApplications && totalApplications > 0 
              ? `${totalApplications} total application${totalApplications > 1 ? 's' : ''}` 
              : 'No applications yet'}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"/>
            </svg>
            Interviews
          </div>
          <div className="stat-value">{totalInterviews || 0}</div>
          <div className="stat-meta">
            {totalInterviews && totalInterviews > 0 
              ? `${totalInterviews} interview${totalInterviews > 1 ? 's' : ''} scheduled` 
              : 'No interviews scheduled'}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16.016a7.5 7.5 0 0 0 1.962-14.74A1 1 0 0 0 9 0H7a1 1 0 0 0-.962 1.276A7.5 7.5 0 0 0 8 16.016zm6.5-7.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
              <path d="m6.94 7.44 4.95-2.83-2.83 4.95-4.949 2.83 2.828-4.95z"/>
            </svg>
            Offers
          </div>
          <div className="stat-value">{totalOffers || 0}</div>
          <div className="stat-meta">
            {totalOffers && totalOffers > 0 
              ? `${totalOffers} offer${totalOffers > 1 ? 's' : ''} received` 
              : 'No offers received'}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
            </svg>
            Response Rate
          </div>
          <div className="stat-value">
            {totalApplications && totalApplications > 0 && totalInterviews !== null
              ? `${Math.round((totalInterviews / totalApplications) * 100)}%`
              : '0%'}
          </div>
          <div className="stat-meta">
            {totalInterviews && totalInterviews > 0 
              ? `From ${totalApplications} application${totalApplications && totalApplications > 1 ? 's' : ''}` 
              : 'No responses yet'}
          </div>
        </div>
      </div>
      
      {/* Recent Applications */}
      <div className="section-header">
        <h2 className="section-title">Recent Applications</h2>
        <span>{typedApplications?.length || 0} of {totalApplications || 0} applications</span>
      </div>
      
      {typedApplications && typedApplications.length > 0 ? (
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Company</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {typedApplications.map((application) => (
                <tr key={application.id}>
                  <td>
                    {application.job_positions.title}
                    {application.current_status === 'applied' && (
                      <span className="badge badge-new">New</span>
                    )}
                  </td>
                  <td>{application.job_positions.companies.name}</td>
                  <td>
                    <div className="tag-container">
                      {application.job_positions.position_tags?.map((pt) => (
                        <span key={pt.tags.id} className="tag">{pt.tags.name}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status ${
                      application.current_status === 'offered' ? 'status-success' :
                      application.current_status === 'denied' ? 'status-danger' :
                      application.current_status === 'interview' ? 'status-warning' :
                      'status-applied'
                    }`}>
                      {application.current_status.charAt(0).toUpperCase() + application.current_status.slice(1)}
                    </span>
                  </td>
                  <td>{format(new Date(application.applied_at), 'MMM d, yyyy')}</td>
                  <td>
                    <Link href={`/applications/${application.id}`} className="btn btn-link">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" 
                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" 
                strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          <h3 className="empty-state-title">No applications yet</h3>
          <p className="empty-state-description">
            You haven&apos;t added any job applications yet. Click &quot;Add Application&quot; to get started.
          </p>
          <Link href="/applications/new" className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Add Application
          </Link>
        </div>
      )}
    </main>
  );
}