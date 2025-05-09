'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form';
import { Select } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

// Schema for the main form
const formSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobDescription: z.string().optional(),
  jobLocation: z.string().optional(),
  jobPostUrl: z.string().optional(),
  postedAt: z.string().optional(),
  tags: z.string().optional(),
});

// Schema for the company creation form
const companyFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyWebsite: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface Company {
  id: string;
  name: string;
  website: string | null;
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  // Main form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: '',
      jobTitle: '',
      jobDescription: '',
      jobLocation: '',
      jobPostUrl: '',
      postedAt: '',
      tags: '',
    },
  });

  // Company creation form
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: '',
      companyWebsite: '',
    },
  });

  // Fetch companies on mount
  useEffect(() => {
    async function fetchCompanies() {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, website')
        .order('name');
      
      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }
      
      setCompanies(data || []);
    }
    
    fetchCompanies();
  }, []);

  // Handle creating a new company
  async function onCreateCompany(data: CompanyFormValues) {
    setIsCreatingCompany(true);
    
    try {
      const { data: newCompany, error } = await supabase
        .from('companies')
        .insert({
          name: data.companyName,
          website: data.companyWebsite || null,
        })
        .select('id, name, website')
        .single();
      
      if (error) {
        throw new Error('Error creating company');
      }
      
      // Add new company to the list and select it
      setCompanies([...companies, newCompany]);
      form.setValue('companyId', newCompany.id);
      
      // Reset company form
      companyForm.reset();
      
      // Close the dialog by simulating a click on the close button
      const closeButton = document.querySelector('[data-dialog-close="true"]');
      if (closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    } catch (err) {
      console.error('Error creating company:', err);
    } finally {
      setIsCreatingCompany(false);
    }
  }

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the company data using the company ID
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', data.companyId)
        .single();

      if (companyError) {
        throw new Error('Error finding company');
      }
      
      const companyId = companyData.id;

      // Create job position
      const { data: positionData, error: positionError } = await supabase
        .from('job_positions')
        .insert({
          company_id: companyId,
          title: data.jobTitle,
          description: data.jobDescription || null,
          location: data.jobLocation || null,
          post_url: data.jobPostUrl || null,
          posted_at: data.postedAt || null,
        })
        .select('id')
        .single();

      if (positionError) {
        throw new Error('Error creating job position');
      }

      // Create application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          position_id: positionData.id,
          current_status: 'created',
          applied_at: new Date().toISOString(),
        });

      if (applicationError) {
        throw new Error('Error creating application');
      }

      // Process tags if any
      if (data.tags) {
        const tagNames = data.tags.split(',').map(tag => tag.trim());
        
        for (const tagName of tagNames) {
          if (!tagName) continue;
          
          // Find or create tag
          const { data: existingTag, error: tagError } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .maybeSingle();

          if (tagError) {
            console.error('Error finding tag:', tagError);
            continue;
          }

          let tagId;
          if (!existingTag) {
            const { data: newTag, error: createTagError } = await supabase
              .from('tags')
              .insert({ name: tagName })
              .select('id')
              .single();

            if (createTagError) {
              console.error('Error creating tag:', createTagError);
              continue;
            }
            tagId = newTag.id;
          } else {
            tagId = existingTag.id;
          }

          // Associate tag with position
          await supabase
            .from('position_tags')
            .insert({
              position_id: positionData.id,
              tag_id: tagId,
            });
        }
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Error creating application:', err);
      setError('An error occurred while saving the application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add New Application</h1>
        <Link href="/">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg border p-6 space-y-6">
        <h2 className="text-xl font-medium border-b pb-2">Company Information</h2>
        <div className="grid gap-4">
          <FormField
            name="companyId"
            label="Company *"
            error={form.formState.errors.companyId?.message}
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  {...form.register('companyId')}
                  options={companies.map(company => ({
                    value: company.id,
                    label: company.name
                  }))}
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    Create Company
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Company</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <FormField
                      name="companyName"
                      label="Company Name *"
                      error={companyForm.formState.errors.companyName?.message}
                    >
                      <Input
                        {...companyForm.register('companyName')}
                        placeholder="Company Name"
                      />
                    </FormField>
                    <FormField
                      name="companyWebsite"
                      label="Company Website"
                      error={companyForm.formState.errors.companyWebsite?.message}
                    >
                      <Input
                        {...companyForm.register('companyWebsite')}
                        placeholder="https://example.com"
                      />
                    </FormField>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild data-dialog-close="true">
                      <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                    <Button 
                      type="button" 
                      disabled={isCreatingCompany}
                      onClick={companyForm.handleSubmit(onCreateCompany)}
                    >
                      {isCreatingCompany ? 'Creating...' : 'Create Company'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </FormField>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-6 mt-6">
        <h2 className="text-xl font-medium border-b pb-2">Job Information</h2>
        <div className="grid gap-4">
          <FormField
            name="jobTitle"
            label="Job Title *"
            error={form.formState.errors.jobTitle?.message}
          >
            <Input
              {...form.register('jobTitle')}
              placeholder="Software Engineer"
            />
          </FormField>

          <FormField
            name="jobDescription"
            label="Job Description"
            error={form.formState.errors.jobDescription?.message}
          >
            <Textarea
              {...form.register('jobDescription')}
              placeholder="Job description..."
              rows={4}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              name="jobLocation"
              label="Location"
              error={form.formState.errors.jobLocation?.message}
            >
              <Input
                {...form.register('jobLocation')}
                placeholder="Remote, NYC, etc."
              />
            </FormField>
            
            <FormField
              name="postedAt"
              label="Job Posted Date"
              error={form.formState.errors.postedAt?.message}
            >
              <Input
                type="date"
                {...form.register('postedAt')}
              />
            </FormField>
          </div>

          <FormField
            name="jobPostUrl"
            label="Job Posting URL"
            error={form.formState.errors.jobPostUrl?.message}
          >
            <Input
              {...form.register('jobPostUrl')}
              placeholder="https://example.com/jobs/123"
            />
          </FormField>

          <FormField
            name="tags"
            label="Tags (comma separated)"
            error={form.formState.errors.tags?.message}
          >
            <Input
              {...form.register('tags')}
              placeholder="remote, fullstack, javascript"
            />
          </FormField>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Link href="/">
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          onClick={form.handleSubmit(onSubmit)}
        >
          {isSubmitting ? 'Saving...' : 'Save Application'}
        </Button>
      </div>
    </div>
  );
} 