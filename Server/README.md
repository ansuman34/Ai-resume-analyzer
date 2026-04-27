# ResuMax Backend Server

Backend API server for the ResuMax AI Resume Analyzer application.

## Features

- User authentication (register/login)
- Resume CRUD operations
- Resume analysis with ATS readiness, content quality, impact scoring, and job-description keyword matching
- Template management
- Contact form submissions
- Secure API with JWT authentication
- MongoDB database integration

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Navigate to the server directory:
   ```bash
   cd Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` file and update the values
   - Make sure MongoDB is running

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Resumes
- `GET /api/resumes` - Get all user resumes
- `GET /api/resumes/:id` - Get single resume
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resumes/:id/analyze` - Analyze saved resume
- `POST /api/resumes/analyze` - Analyze unsaved resume content

Analysis requests can optionally include:

```json
{
  "targetRole": "Software Engineer",
  "jobDescription": "Paste the job description here..."
}
```

The response includes `score`, `jobMatch`, `analysis.strengths`, `analysis.suggestions`, keyword gaps, metrics, and category-level score breakdowns.

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get single template
- `POST /api/templates` - Create template (admin only)
- `PUT /api/templates/:id` - Update template (admin only)
- `DELETE /api/templates/:id` - Delete template (admin only)

### Contacts
- `POST /api/contacts/submit` - Submit contact form
- `GET /api/contacts/all` - Get contact submissions (admin only)
- `GET /api/contacts/:id` - Get contact submission by ID (admin only)

Admin access is granted by setting a user's `role` to `admin`, setting `isAdmin` to `true`, or adding the email to the `ADMIN_EMAILS` environment variable.

## Project Structure

```
Server/
├── models/          # Database models
│   ├── User.js
│   ├── Resume.js
│   └── Template.js
├── routes/          # API routes
│   ├── auth.js
│   ├── resumes.js
│   └── templates.js
├── middleware/      # Custom middleware
│   └── auth.js
├── server.js        # Main server file
├── package.json     # Dependencies
├── .env            # Environment variables
└── README.md       # This file
```

## Database Models

### User
- email (unique)
- password (hashed)
- firstName, lastName
- profilePicture
- timestamps

### Resume
- user (reference to User)
- name
- template
- content (JSON)
- score (0-100)
- analysis (JSON)
- jobMatch
- timestamps

### Template
- name (unique)
- category
- image, description
- features (array)
- isPremium, price
- timestamps

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Admin authorization for management routes
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## Future Enhancements

- File upload for resume documents
- Optional LLM-powered rewrite suggestions
- Email notifications
- Payment integration for premium features
- Advanced analytics
