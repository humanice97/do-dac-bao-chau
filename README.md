# BCMS - Business Content Management System

BCMS is a Next.js-based web application designed for managing engineers and projects within an organization. It features an admin panel for CRUD operations on engineers and projects, user authentication via Supabase, and a public-facing marketing site with various components like hero, services, contact form, and more.

## Features

- **Admin Panel**: Secure login and management of engineers and projects.
- **Project Tracking**: Dedicated page for tracking project progress.
- **Marketing Site**: Public pages showcasing services, commitments, FAQs, gallery, and contact information.
- **Authentication**: Integrated with Supabase for user auth and role-based access.
- **Responsive Design**: Built with Tailwind CSS for mobile-first responsive UI.
- **Animations**: Smooth animations using Framer Motion.
- **Charts**: Data visualization with Recharts.
- **TypeScript**: Fully typed for better development experience.

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bcms
```

bcms/
├── app/                    # Next.js app directory
│   ├── admin/              # Admin pages
│   │   ├── engineers/      # Engineer management
│   │   ├── projects/       # Project management
│   │   └── login/          # Admin login
│   ├── track/              # Project tracking page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable components
│   ├── admin/              # Admin-specific components
│   └── marketing/          # Marketing site components
├── lib/                    # Utility libraries
│   ├── auth.ts             # Authentication helpers
│   ├── role.ts             # Role management
│   └── supabase*.ts        # Supabase client setup
├── middleware.ts           # Next.js middleware
├── next.config.js          # Next.js configuration
├── [package.json](http://_vscodecontentref_/0)            # Dependencies and scripts
├── schema.sql              # Database schema
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration