'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface Interviewer {
  id: string;
  full_name: string;
  email: string | null;
}

interface Interview {
  id: string;
  application_id: string;
  interview_type: string;
  scheduled_start: string;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  self_feeling: string | null;
  recall_summary: string | null;
  application: {
    id: string;
    current_status: string;
    job_positions: {
      id: string;
      title: string;
      companies: {
        id: string;
        name: string;
      };
    };
  };
  interview_participants: {
    interviewer_id: string;
    role: string;
    interviewer: Interviewer;
  }[];
}

export default function InterviewDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newInterviewer, setNewInterviewer] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [selfFeeling, setSelfFeeling] = useState('');
  const [recallSummary, setRecallSummary] = useState('');
  const [actualStartEnd, setActualStartEnd] = useState({
    start: '',
    end: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch interview data
        const { data, error: fetchError } = await supabase
          .from('interviews')
          .select(`
            id,
            application_id,
            interview_type,
            scheduled_start,
            scheduled_end,
            actual_start,
            actual_end,
            self_feeling,
            recall_summary,
            application (
              id,
              current_status,
              job_positions (
                id,
                title,
                companies (
                  id,
                  name
                )
              )
            ),
            interview_participants (
              interviewer_id,
              role,
              interviewer:interviewers (
                id,
                full_name,
                email
              )
            )
          `)
          .eq('id', params.id)
          .single();

        if (fetchError) throw new Error('Error loading interview data');
        
        setInterview(data as Interview);
        
        if (data.self_feeling) {
          setSelfFeeling(data.self_feeling);
        }
        
        if (data.recall_summary) {
          setRecallSummary(data.recall_summary);
        }
        
        if (data.actual_start) {
          setActualStartEnd(prev => ({
            ...prev,
            start: new Date(data.actual_start!).toISOString().slice(0, 16),
          }));
        }
        
        if (data.actual_end) {
          setActualStartEnd(prev => ({
            ...prev,
            end: new Date(data.actual_end!).toISOString().slice(0, 16),
          }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load interview details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  async function addInterviewer() {
    if (!newInterviewer.name || !newInterviewer.role) {
      setError('Please provide interviewer name and role');
      return;
    }

    if (!interview) return;

    setSubmitting(true);
    try {
      // First check if interviewer already exists
      const { data: existingInterviewer, error: lookupError } = await supabase
        .from('interviewers')
        .select('id')
        .ilike('full_name', newInterviewer.name)
        .maybeSingle();

      if (lookupError) throw new Error('Error looking up interviewer');

      // Create or use existing interviewer
      let interviewerId;
      if (!existingInterviewer) {
        const { data: createdInterviewer, error: createError } = await supabase
          .from('interviewers')
          .insert({
            full_name: newInterviewer.name,
            email: newInterviewer.email || null,
          })
          .select('id')
          .single();

        if (createError) throw new Error('Error creating interviewer');
        interviewerId = createdInterviewer.id;
      } else {
        interviewerId = existingInterviewer.id;
      }

      // Associate interviewer with interview
      const { error: linkError } = await supabase
        .from('interview_participants')
        .insert({
          interview_id: interview.id,
          interviewer_id: interviewerId,
          role: newInterviewer.role,
        });

      if (linkError) throw new Error('Error adding interviewer to interview');

      // Refetch interview data
      const { data, error: refetchError } = await supabase
        .from('interviews')
        .select(`
          id,
          application_id,
          interview_type,
          scheduled_start,
          scheduled_end,
          actual_start,
          actual_end,
          self_feeling,
          recall_summary,
          application (
            id,
            current_status,
            job_positions (
              id,
              title,
              companies (
                id,
                name
              )
            )
          ),
          interview_participants (
            interviewer_id,
            role,
            interviewer:interviewers (
              id,
              full_name,
              email
            )
          )
        `)
        .eq('id', params.id)
        .single();

      if (refetchError) throw new Error('Error refreshing data');
      setInterview(data as Interview);

      // Reset form
      setNewInterviewer({
        name: '',
        email: '',
        role: '',
      });
    } catch (err) {
      console.error('Error adding interviewer:', err);
      setError('Failed to add interviewer');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateInterviewCompletion() {
    if (!interview) return;

    setSubmitting(true);
    try {
      const updates: any = {};
      
      if (actualStartEnd.start) {
        updates.actual_start = actualStartEnd.start;
      }
      
      if (actualStartEnd.end) {
        updates.actual_end = actualStartEnd.end;
      }
      
      if (selfFeeling) {
        updates.self_feeling = selfFeeling;
      }
      
      if (recallSummary) {
        updates.recall_summary = recallSummary;
      }

      // Update interview
      const { data, error: updateError } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', interview.id)
        .select()
        .single();

      if (updateError) throw new Error('Error updating interview');

      // If this is the first time marking complete, add action
      if (actualStartEnd.end && !interview.actual_end) {
        const { error: actionError } = await supabase
          .from('application_actions')
          .insert({
            application_id: interview.application_id,
            action_code: 'interview_completed',
            happened_at: new Date().toISOString(),
            note: `Completed ${interview.interview_type} interview`,
          });

        if (actionError) {
          console.error('Error adding completed action:', actionError);
        } else {
          // Update application status
          await supabase
            .from('applications')
            .update({ current_status: 'interview_completed' })
            .eq('id', interview.application_id);
        }
      }

      // Refresh interview data
      const { data: refreshData, error: refetchError } = await supabase
        .from('interviews')
        .select(`
          id,
          application_id,
          interview_type,
          scheduled_start,
          scheduled_end,
          actual_start,
          actual_end,
          self_feeling,
          recall_summary,
          application (
            id,
            current_status,
            job_positions (
              id,
              title,
              companies (
                id,
                name
              )
            )
          ),
          interview_participants (
            interviewer_id,
            role,
            interviewer:interviewers (
              id,
              full_name,
              email
            )
          )
        `)
        .eq('id', params.id)
        .single();

      if (refetchError) throw new Error('Error refreshing data');
      setInterview(refreshData as Interview);

    } catch (err) {
      console.error('Error updating interview:', err);
      setError('Failed to update interview details');
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP p');
  }

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <p>Loading interview details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <p>Interview not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      <div className="mb-8">
        <Link 
          href={`/applications/${interview.application_id}`} 
          className="text-primary hover:underline mb-2 inline-block"
        >
          &larr; Back to Application
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)} Interview
            </h1>
            <h2 className="text-xl text-muted-foreground">
              {interview.application.job_positions.title} at {interview.application.job_positions.companies.name}
            </h2>
          </div>
          <div className="rounded-full px-4 py-2 bg-primary/10 text-primary font-medium">
            {interview.actual_end ? 'Completed' : 'Scheduled'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Interview Details */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-medium border-b pb-2 mb-4">Interview Details</h2>
            <dl className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <dt className="font-medium">Scheduled Time:</dt>
                <dd className="col-span-2">
                  {formatDate(interview.scheduled_start)}
                  {interview.scheduled_end && ` to ${formatDate(interview.scheduled_end)}`}
                </dd>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <dt className="font-medium">Actual Time:</dt>
                <dd className="col-span-2">
                  {interview.actual_start ? 
                    `${formatDate(interview.actual_start)}${interview.actual_end ? ` to ${formatDate(interview.actual_end)}` : ''}` : 
                    'Not completed yet'}
                </dd>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <dt className="font-medium">Interview Type:</dt>
                <dd className="col-span-2">
                  {interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Interviewers */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-medium border-b pb-2 mb-4">Interviewers</h2>
            
            {interview.interview_participants && interview.interview_participants.length > 0 ? (
              <div className="space-y-4">
                {interview.interview_participants.map((participant) => (
                  <div key={participant.interviewer_id} className="p-4 border rounded-md">
                    <h3 className="font-medium">{participant.interviewer.full_name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Role: {participant.role}
                    </p>
                    {participant.interviewer.email && (
                      <p className="text-sm mt-1">
                        Email: {participant.interviewer.email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No interviewers added yet.</p>
            )}
            
            {/* Add Interviewer Form */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Add Interviewer</h3>
              <div className="space-y-4">
                <FormField name="interviewer_name" label="Interviewer Name">
                  <Input
                    value={newInterviewer.name}
                    onChange={(e) => setNewInterviewer({...newInterviewer, name: e.target.value})}
                    placeholder="Full Name"
                  />
                </FormField>
                
                <FormField name="interviewer_email" label="Interviewer Email (optional)">
                  <Input
                    value={newInterviewer.email}
                    onChange={(e) => setNewInterviewer({...newInterviewer, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </FormField>
                
                <FormField name="interviewer_role" label="Role">
                  <Input
                    value={newInterviewer.role}
                    onChange={(e) => setNewInterviewer({...newInterviewer, role: e.target.value})}
                    placeholder="e.g. Technical Interviewer, Hiring Manager"
                  />
                </FormField>
                
                <Button 
                  onClick={addInterviewer}
                  disabled={submitting || !newInterviewer.name || !newInterviewer.role}
                >
                  Add Interviewer
                </Button>
              </div>
            </div>
          </div>
          
          {/* Self Assessment */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-medium border-b pb-2 mb-4">Self Assessment</h2>
            
            <div className="space-y-4">
              <FormField name="actual_time" label="Actual Interview Time">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm mb-1">Start Time</p>
                    <input
                      type="datetime-local"
                      value={actualStartEnd.start}
                      onChange={(e) => setActualStartEnd({...actualStartEnd, start: e.target.value})}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <p className="text-sm mb-1">End Time</p>
                    <input
                      type="datetime-local"
                      value={actualStartEnd.end}
                      onChange={(e) => setActualStartEnd({...actualStartEnd, end: e.target.value})}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    />
                  </div>
                </div>
              </FormField>
              
              <FormField name="self_feeling" label="How do you feel it went?">
                <Textarea
                  value={selfFeeling}
                  onChange={(e) => setSelfFeeling(e.target.value)}
                  placeholder="Describe your feelings about the interview..."
                  rows={3}
                />
              </FormField>
              
              <FormField name="recall_summary" label="Interview Recap">
                <Textarea
                  value={recallSummary}
                  onChange={(e) => setRecallSummary(e.target.value)}
                  placeholder="Summarize what was discussed and any key points..."
                  rows={6}
                />
              </FormField>
              
              <Button 
                onClick={updateInterviewCompletion}
                disabled={submitting}
                className="w-full"
              >
                Save Interview Details
              </Button>
            </div>
          </div>
        </div>
        
        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Interview Status</h2>
            <div className="space-y-4">
              <p className="text-sm">
                <span className="font-medium">Current Status:</span> {' '}
                {interview.actual_end ? 'Completed' : 'Scheduled'}
              </p>
              
              <Link href={`/applications/${interview.application_id}`}>
                <Button variant="outline" className="w-full">
                  View Application
                </Button>
              </Link>
              
              {interview.actual_end && (
                <div>
                  <p className="text-sm font-medium mt-4 mb-2">Post Interview Actions:</p>
                  <Link href={`/applications/${interview.application_id}`}>
                    <Button className="w-full">
                      Update Application Status
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Tips</h2>
            <ul className="space-y-2 text-sm">
              <li>• Record actual start/end times promptly</li>
              <li>• Note any follow-up tasks discussed</li>
              <li>• Record key technical questions asked</li>
              <li>• Document your performance in different areas</li>
              <li>• Set calendar reminders for follow-ups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 