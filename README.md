# Dream Tracker: Job Application Tracking App

A comprehensive web application to track your job applications, interviews, and overall job search process.

## Features

- Track job applications across companies
- Record application statuses and updates
- Manage interviews and interview feedback
- Track interactions with hiring managers and recruiters
- Organize job applications with tags
- Store notes and attachments

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Form Management**: React Hook Form, Zod validation
- **Styling**: TailwindCSS with custom UI components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Setting Up Supabase

1. Create a new Supabase project
2. Run the SQL from the initial schema provided to set up your database
3. Run the seed data from `seeds.sql` to populate reference tables

```sql
-- Run seed data
source seeds.sql
```

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace with your actual Supabase project credentials.

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
dream-tracker/
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   ├── lib/                # Utility functions and libraries
└── public/                 # Static assets
```

## Usage

1. Add companies and job positions
2. Track application status changes
3. Schedule and record interviews
4. Document feedback and follow-ups
5. Organize applications with tags for easier filtering

## License

This project is licensed under the MIT License.
