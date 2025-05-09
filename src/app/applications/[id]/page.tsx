'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

// Updated interfaces to match Supabase's response structure
interface Company {
  id: string;
  name: string;
  website: string | null;
}

interface JobPosition {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  post_url: string | null;
  posted_at: string | null;
  companies: Company[];
}

interface ApplicationAction {
  id: string;
  action_code: string;
  happened_at: string;
  note: string | null;
}

interface InterviewData {
  id: string;
  interview_type: string;
  scheduled_start: string;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  self_feeling: string | null;
  recall_summary: string | null;
}

interface ApplicationData {
  id: string;
  applied_at: string;
  current_status: string;
  job_positions: JobPosition[];
  application_actions: ApplicationAction[];
  interviews: InterviewData[];
}

export default function ApplicationDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionTypes, setActionTypes] = useState<Array<{ code: string; label: string }>>([]);
  const [interviewTypes, setInterviewTypes] = useState<Array<{ code: string; label: string }>>([]);
  const [newAction, setNewAction] = useState<{ action_code: string; note: string }>({
    action_code: '',
    note: '',
  });
  const [newInterview, setNewInterview] = useState<{
    interview_type: string;
    scheduled_start: string;
    scheduled_end: string;
    note: string;
  }>({
    interview_type: '',
    scheduled_start: '',
    scheduled_end: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch application data with related information
        const { data, error: appError } = await supabase
          .from('applications')
          .select(`
            id,
            applied_at,
            current_status,
            job_positions (
              id,
              title,
              description,
              location,
              post_url,
              posted_at,
              companies (
                id,
                name,
                website
              )
            ),
            application_actions (
              id,
              action_code,
              happened_at,
              note
            ),
            interviews (
              id,
              interview_type,
              scheduled_start,
              scheduled_end,
              actual_start,
              actual_end,
              self_feeling,
              recall_summary
            )
          `)
          .eq('id', params.id)
          .single();

        if (appError) throw new Error('Error loading application data');
        setApplication(data);

        // Fetch action types
        const { data: actionsData, error: actionsError } = await supabase
          .from('action_types')
          .select('*');

        if (actionsError) throw new Error('Error loading action types');
        setActionTypes(actionsData);

        // Fetch interview types
        const { data: interviewData, error: interviewError } = await supabase
          .from('interview_types')
          .select('*');

        if (interviewError) throw new Error('Error loading interview types');
        setInterviewTypes(interviewData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load application details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  async function addAction() {
    if (!newAction.action_code) {
      setError('Please select an action type');
      return;
    }

    setSubmitting(true);
    try {
      // Add new action
      const { error: actionError } = await supabase
        .from('application_actions')
        .insert({
          application_id: params.id,
          action_code: newAction.action_code,
          happened_at: new Date().toISOString(),
          note: newAction.note,
        });

      if (actionError) throw new Error('Error adding action');

      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ current_status: newAction.action_code })
        .eq('id', params.id);

      if (updateError) throw new Error('Error updating status');

      // Refresh application data
      const { data, error: refetchError } = await supabase
        .from('applications')
        .select(`
          id,
          applied_at,
          current_status,
          job_positions (
            id,
            title,
            description,
            location,
            post_url,
            posted_at,
            companies (
              id,
              name,
              website
            )
          ),
          application_actions (
            id,
            action_code,
            happened_at,
            note
          ),
          interviews (
            id,
            interview_type,
            scheduled_start,
            scheduled_end,
            actual_start,
            actual_end,
            self_feeling,
            recall_summary
          )
        `)
        .eq('id', params.id)
        .single();

      if (refetchError) throw new Error('Error refreshing data');
      setApplication(data);

      // Reset form
      setNewAction({ action_code: '', note: '' });
    } catch (err) {
      console.error('Error adding action:', err);
      setError('Failed to add action');
    } finally {
      setSubmitting(false);
    }
  }

  async function addInterview() {
    if (!newInterview.interview_type || !newInterview.scheduled_start) {
      setError('Please fill in all required interview fields');
      return;
    }

    setSubmitting(true);
    try {
      // Add new interview
      const { error: interviewError } = await supabase
        .from('interviews')
        .insert({
          application_id: params.id,
          interview_type: newInterview.interview_type,
          scheduled_start: newInterview.scheduled_start,
          scheduled_end: newInterview.scheduled_end || null,
        });

      if (interviewError) throw new Error('Error scheduling interview');

      // Add corresponding action if not already set
      if (application && application.current_status !== 'interview_scheduled') {
        const { error: actionError } = await supabase
          .from('application_actions')
          .insert({
            application_id: params.id,
            action_code: 'interview_scheduled',
            happened_at: new Date().toISOString(),
            note: `Scheduled ${newInterview.interview_type} interview for ${newInterview.scheduled_start}`,
          });

        if (actionError) throw new Error('Error adding interview action');

        // Update application status
        const { error: updateError } = await supabase
          .from('applications')
          .update({ current_status: 'interview_scheduled' })
          .eq('id', params.id);

        if (updateError) throw new Error('Error updating status');
      }

      // Refresh application data
      const { data, error: refetchError } = await supabase
        .from('applications')
        .select(`
          id,
          applied_at,
          current_status,
          job_positions (
            id,
            title,
            description,
            location,
            post_url,
            posted_at,
            companies (
              id,
              name,
              website
            )
          ),
          application_actions (
            id,
            action_code,
            happened_at,
            note
          ),
          interviews (
            id,
            interview_type,
            scheduled_start,
            scheduled_end,
            actual_start,
            actual_end,
            self_feeling,
            recall_summary
          )
        `)
        .eq('id', params.id)
        .single();

      if (refetchError) throw new Error('Error refreshing data');
      setApplication(data);

      // Reset form
      setNewInterview({
        interview_type: '',
        scheduled_start: '',
        scheduled_end: '',
        note: '',
      });
    } catch (err) {
      console.error('Error adding interview:', err);
      setError('Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="inline-block relative w-12 h-12 mb-3">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-3 h-3 rounded-full bg-primary absolute top-0 left-0 animate-[mercuryload_1.5s_infinite_ease-in-out]" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 rounded-full bg-primary absolute top-0 right-0 animate-[mercuryload_1.5s_infinite_ease-in-out]" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full bg-primary absolute bottom-0 right-0 animate-[mercuryload_1.5s_infinite_ease-in-out]" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-3 h-3 rounded-full bg-primary absolute bottom-0 left-0 animate-[mercuryload_1.5s_infinite_ease-in-out]" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-1">Loading</h3>
          <p className="text-sm text-muted-foreground">Retrieving application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-destructive mt-0.5 mr-3">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-destructive">Error</h3>
            <p className="mt-1 text-sm text-destructive/80">{error}</p>
            <div className="mt-3">
              <Button onClick={() => router.push('/')} variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="mercury-card text-center">
        <h3 className="font-medium mb-2">Application not found</h3>
        <p className="text-muted-foreground mb-4">
          The application you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button onClick={() => router.push('/')} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Get the position and company data from the arrays
  const position = application.job_positions[0];
  const company = position.companies[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="mb-2">
            <Link href="/" className="text-sm font-medium text-primary inline-flex items-center hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Applications
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{position.title}</h1>
          <p className="text-muted-foreground mt-1">{company.name}</p>
        </div>
        <div className="mercury-badge mercury-badge-outline text-sm py-1 px-4 font-medium">
          {actionTypes.find(t => t.code === application.current_status)?.label || application.current_status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Job Details */}
          <div className="mercury-card hover:shadow-none">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">Job Details</h2>
            </div>
            <dl className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <dt className="font-medium text-muted-foreground">Location</dt>
                <dd className="col-span-2">{position.location || 'Not specified'}</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="font-medium text-muted-foreground">Company Website</dt>
                <dd className="col-span-2">
                  {company.website ? (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="font-medium text-muted-foreground">Job Posting</dt>
                <dd className="col-span-2">
                  {position.post_url ? (
                    <a 
                      href={position.post_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View original posting
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="font-medium text-muted-foreground">Posted Date</dt>
                <dd className="col-span-2">{formatDate(position.posted_at)}</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="font-medium text-muted-foreground">Applied On</dt>
                <dd className="col-span-2">{formatDate(application.applied_at)}</dd>
              </div>
            </dl>

            {position.description && (
              <div className="mt-5 pt-5 border-t">
                <h3 className="font-medium mb-3 text-muted-foreground text-sm">Description</h3>
                <p className="whitespace-pre-line text-sm">{position.description}</p>
              </div>
            )}
          </div>
          
          {/* Timeline */}
          <div className="mercury-card hover:shadow-none">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">Application Timeline</h2>
            </div>
            {application.application_actions && application.application_actions.length > 0 ? (
              <ol className="relative border-l border-border/60 ml-3 space-y-6">
                {[...application.application_actions]
                  .sort((a, b) => new Date(b.happened_at).getTime() - new Date(a.happened_at).getTime())
                  .map((action) => (
                    <li className="ml-6" key={action.id}>
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full -left-3 ring-4 ring-white dark:ring-gray-900">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-primary"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <time className="block text-xs font-normal leading-none text-muted-foreground mb-1">
                        {formatDate(action.happened_at)}
                      </time>
                      <h3 className="text-base font-medium">
                        {actionTypes.find(t => t.code === action.action_code)?.label || action.action_code}
                      </h3>
                      {action.note && <p className="mt-2 text-sm text-muted-foreground">{action.note}</p>}
                    </li>
                  ))}
              </ol>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No actions recorded yet.</p>
              </div>
            )}
          </div>
          
          {/* Interviews */}
          <div className="mercury-card hover:shadow-none">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium">Interviews</h2>
              <div>
                <span className="text-xs text-muted-foreground">
                  {application.interviews?.length || 0} {application.interviews?.length === 1 ? 'interview' : 'interviews'}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {application.interviews && application.interviews.length > 0 ? (
                application.interviews.map((interview) => (
                  <div key={interview.id} className="p-4 rounded-md bg-secondary/40 hover:bg-secondary/60 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-base">
                          {interviewTypes.find(t => t.code === interview.interview_type)?.label || 
                            interview.interview_type}
                        </h3>
                        <div className="flex flex-col gap-1 mt-2">
                          <p className="text-sm text-muted-foreground">
                            <span className="inline-block w-20">Scheduled:</span> 
                            {formatDate(interview.scheduled_start)}
                            {interview.scheduled_end && ` to ${formatDate(interview.scheduled_end)}`}
                          </p>
                          {interview.actual_start && (
                            <p className="text-sm text-muted-foreground">
                              <span className="inline-block w-20">Completed:</span> 
                              {formatDate(interview.actual_start)}
                            </p>
                          )}
                        </div>
                        {interview.self_feeling && (
                          <div className="mt-3 text-sm">
                            <span className="font-medium">Self Assessment:</span> 
                            <p className="mt-1 text-muted-foreground">{interview.self_feeling}</p>
                          </div>
                        )}
                      </div>
                      <Link 
                        href={`/interviews/${interview.id}`}
                        className="mercury-button mercury-button-outline text-xs h-8"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No interviews scheduled yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="mercury-card hover:shadow-none">
            <h2 className="font-medium mb-4">Update Status</h2>
            <FormField name="action_type" label="Status">
              <Select
                options={actionTypes.map(type => ({ value: type.code, label: type.label }))}
                value={newAction.action_code}
                onChange={(e) => setNewAction({...newAction, action_code: e.target.value})}
              />
            </FormField>
            <FormField name="action_note" label="Notes" className="mt-3">
              <Textarea
                value={newAction.note}
                onChange={(e) => setNewAction({...newAction, note: e.target.value})}
                placeholder="Add any relevant notes..."
                rows={3}
              />
            </FormField>
            <Button 
              className="w-full mt-4" 
              onClick={addAction} 
              disabled={submitting || !newAction.action_code}
            >
              Update Status
            </Button>
          </div>
          
          <div className="mercury-card hover:shadow-none">
            <h2 className="font-medium mb-4">Schedule Interview</h2>
            <FormField name="interview_type" label="Interview Type">
              <Select
                options={interviewTypes.map(type => ({ value: type.code, label: type.label }))}
                value={newInterview.interview_type}
                onChange={(e) => setNewInterview({...newInterview, interview_type: e.target.value})}
              />
            </FormField>
            <FormField name="scheduled_start" label="Date & Time" className="mt-3">
              <input
                type="datetime-local"
                value={newInterview.scheduled_start}
                onChange={(e) => setNewInterview({...newInterview, scheduled_start: e.target.value})}
                className="mercury-input"
              />
            </FormField>
            <FormField name="scheduled_end" label="End Time (optional)" className="mt-3">
              <input
                type="datetime-local"
                value={newInterview.scheduled_end}
                onChange={(e) => setNewInterview({...newInterview, scheduled_end: e.target.value})}
                className="mercury-input"
              />
            </FormField>
            <FormField name="interview_note" label="Notes" className="mt-3">
              <Textarea
                value={newInterview.note}
                onChange={(e) => setNewInterview({...newInterview, note: e.target.value})}
                placeholder="Add any preparation notes..."
                rows={3}
              />
            </FormField>
            <Button 
              className="w-full mt-4" 
              onClick={addInterview} 
              disabled={submitting || !newInterview.interview_type || !newInterview.scheduled_start}
            >
              Schedule Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 