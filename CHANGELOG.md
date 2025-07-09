# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Implemented enhanced exam management system:
    - Created a configuration-driven approach for managing exam files
    - Added automatic file detection and validation for exams
    - Implemented centralized exam configuration with strong typing
    - Added support for validating exam files before seeding
    - Created utilities for parsing exam filenames and extracting metadata
    - Improved error handling and reporting for exam seeding
    - Added backward compatibility with existing exam functions

### Changed

- Reorganized admin routes structure:
    - Moved admin routes from `(admin)` to `super` directory for better organization
    - Added new teacher route structure
    - Updated auth actions for improved functionality

### Fixed

- Fixed accessibility issue in Sheet component by adding required DialogTitle for screen readers
- Fixed import error in begrouts section page by using absolute path for Badge component
- Fixed error in begrouts level page by replacing client-side `useParams` hook with server-side params prop to comply with Next.js 15 server component requirements

- Fixed Badge variant type error by replacing unsupported "success" variant with "default"
- Fixed TypeScript errors preventing build:
    - Changed 'any' type to 'React.ElementType' in FeatureCard component in begrouts level page
    - Removed unused 'cn' import in courses.tsx
    - Removed unused 'Separator' import and 'activeTab'/'setActiveTab' state in study-planner-concept.tsx
    - Removed unused 'initials' variable in testimonials.tsx
- Fixed routing error in 2FA setup actions by correcting the redirect path to recovery-code page
- Updated Begrouts page to fetch topics and levels directly from the database instead of using hardcoded data

### Added

- Added Study Planner & Exam Countdown concept:

    - Created a concept UI for a personalized study planner feature
    - Designed countdown timers for upcoming Bagrut exams
    - Added daily study task tracking interface
    - Included progress tracking for each subject
    - Implemented tabs for calendar, subjects, and detailed progress views

- Enhanced Begrouts (Bagrut Exams) section:

    - Completely redesigned the UI for better user experience
    - Implemented a dynamic file-based system for exam retrieval using server actions
    - Created a streamlined navigation structure with direct links from subjects to levels
    - Enhanced level pages with feature cards and detailed information
    - Added search functionality for exams
    - Organized exams by year with clear visual indicators
    - Added support for viewing, downloading, and previewing exams and solutions
    - Added a tabbed interface with detailed exam information and study tips
    - Improved mobile responsiveness and added animations

- Implemented Teacher Dashboard:

    - Created new teacher layout with custom sidebar
    - Added quick action buttons for common tasks
    - Added daily schedule widget
    - Implemented proper RTL support for Hebrew text
    - Updated theme with new purple color scheme for teacher section
    - Added proper navigation structure for teacher routes

- Added comprehensive Bagrut exam data structure:
    - Implemented detailed exam data for multiple subjects and levels (3, 4, and 5 points)
    - Added support for different exam variants (winter and summer)
    - Included exam links and solution links where available
    - Organized exams by year and variant
    - Added support for multiple exam versions (A and B variants)

## [0.2.3] - 2025-03-31

### Added

- Enhanced landing page with comprehensive educational website sections:
    - Added Courses section showcasing the four main subjects (Math, English, Computer Science, Physics)
    - Added How It Works section explaining the learning process
    - Added Testimonials section with student feedback
    - Added Call to Action section to encourage sign-ups
    - Added Footer section with About Us, Quick Links, Legal Information, and Contact details
    - Improved Partners section with educational institutions
    - Reorganized page layout for better user experience and flow

### Fixed

- Fixed hydration mismatch in header.tsx by ensuring consistent conditional rendering between server and client for both desktop and mobile navigation sections

## [0.2.0] - 2025-03-19

### Added

- Created directory structure for mini-game components in Bosalieh
- Copied necessary files from mini-game to Bosalieh
- Created game route pages with adjusted import paths
- Updated sound file paths to work in the new environment
- Added navigation links to the game in the main header
- Created custom layout for the game section
- Updated tailwind configuration with math mini-game color variables and animations

### Notes

-still need to add achievements/leaderboards form mini-game and fine tune the design/layout

## [0.2.0] - 2025-03-18

## Added

-added CHANGELOG.md file to inform about everything we update/add..

### Changed

- changed the video in video-preview.tsx
- updated the landingPage_pic.svg file to adapt to dark mode (fill="#background")

## [0.2.1] - 2025-03-19

##Added

###Changed

- added the begrouts to the database schema
- added the name Bosalieh 2fa to the QR auth
