# YouTube Thumbnail Mixer RAG Tool

A web-based tool that leverages Retrieval-Augmented Generation (RAG) and artificial intelligence to intelligently mix and combine YouTube thumbnails. This application analyzes visual elements, color schemes, text placement, and design patterns to suggest optimal thumbnail combinations that maximize engagement.

## Overview

The YouTube Thumbnail Mixer RAG Tool is designed to help content creators optimize their video thumbnails by combining the best elements from multiple designs. Using advanced AI analysis and retrieval-augmented generation, the tool provides intelligent suggestions based on successful thumbnail patterns and design principles.

### Key Features

**Intelligent Thumbnail Analysis**: The application uses large language models to analyze uploaded thumbnails, extracting insights about dominant colors, text elements, composition, and overall design structure. Each analysis includes an engagement score and specific improvement suggestions tailored to YouTube's best practices.

**RAG-Powered Mixing Suggestions**: When users select multiple thumbnails, the system retrieves similar successful designs from its knowledge base and generates context-aware mixing recommendations. The LLM considers color harmony, text placement optimization, visual hierarchy, and proven engagement patterns to suggest the best combinations.

**User Dashboard**: Authenticated users can view their upload history, save favorite combinations, track mixing statistics, and manage multiple projects. All data is securely stored in a MySQL database with proper user isolation.

**Real-Time Preview**: The interface provides immediate feedback on selected files and mixing options, allowing users to experiment with different combinations before finalizing their choices.

## Technology Stack

### Frontend
- **React 19**: Modern UI framework with hooks and concurrent features
- **Tailwind CSS 4**: Utility-first CSS framework for responsive design
- **shadcn/ui**: High-quality, accessible component library
- **tRPC**: End-to-end type-safe API communication
- **TypeScript**: Static type checking for robust code

### Backend
- **Express 4**: Lightweight web framework for Node.js
- **tRPC 11**: Type-safe RPC framework with automatic client generation
- **Drizzle ORM**: Lightweight SQL ORM with excellent TypeScript support
- **MySQL/TiDB**: Relational database for storing user data and thumbnails

### AI/ML Integration
- **LLM Integration**: Built-in access to large language models for analysis and suggestions
- **Multimodal Processing**: Support for analyzing images alongside text prompts
- **Structured JSON Output**: Ensures consistent, parseable responses from AI models

### Infrastructure
- **Manus OAuth**: Secure authentication system
- **S3 Storage**: Cloud storage for uploaded thumbnail images
- **Vite**: Fast build tool and development server

## Installation & Setup

### Prerequisites

Before getting started, ensure you have the following installed:

- Node.js 18+ and npm/pnpm
- Git for version control
- A Manus account for deployment (optional, for local development only)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chambtai-sys/thumb-mixing-rag.git
   cd thumb-mixing-rag
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the project root with the following variables:
   ```
   DATABASE_URL=your_mysql_connection_string
   JWT_SECRET=your_jwt_secret_key
   VITE_APP_ID=your_manus_app_id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   BUILT_IN_FORGE_API_URL=https://api.manus.im
   BUILT_IN_FORGE_API_KEY=your_api_key
   VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
   VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
   ```

4. **Initialize the database**:
   ```bash
   pnpm db:push
   ```

5. **Start the development server**:
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Project Structure

```
thumb-mixing-rag/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   ├── components/             # Reusable UI components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/trpc.ts            # tRPC client configuration
│   │   ├── App.tsx                # Main app component with routing
│   │   └── index.css              # Global styles
│   └── public/                     # Static assets
├── server/                          # Backend Express application
│   ├── routers.ts                 # tRPC procedure definitions
│   ├── db.ts                      # Database query helpers
│   ├── storage.ts                 # S3 storage helpers
│   └── _core/                     # Framework core utilities
├── drizzle/                         # Database schema and migrations
│   └── schema.ts                  # Table definitions
├── shared/                          # Shared types and constants
└── package.json                     # Project dependencies
```

## Usage Guide

### For Content Creators

1. **Log In**: Click "Get Started" and authenticate with your Manus account
2. **Upload Thumbnails**: Use the upload tab to drag-and-drop or select multiple thumbnail images
3. **Analyze**: The system automatically analyzes each thumbnail for design elements
4. **Get Suggestions**: Select thumbnails to mix and receive AI-powered combination recommendations
5. **Export**: Download your optimized mixed thumbnail for use in your videos

### For Developers

#### Adding a New Feature

1. **Update the database schema** in `drizzle/schema.ts`
2. **Run migrations**: `pnpm db:push`
3. **Add query helpers** in `server/db.ts`
4. **Create tRPC procedures** in `server/routers.ts`
5. **Build UI components** in `client/src/pages/` or `client/src/components/`
6. **Connect with hooks**: Use `trpc.*.useQuery()` and `trpc.*.useMutation()`

#### Working with the LLM

The application includes built-in LLM integration for thumbnail analysis:

```typescript
import { invokeLLM } from "./server/_core/llm";

const response = await invokeLLM({
  messages: [
    {
      role: "system",
      content: "You are a thumbnail design expert."
    },
    {
      role: "user",
      content: [
        { type: "text", text: "Analyze this thumbnail" },
        {
          type: "image_url",
          image_url: { url: imageUrl, detail: "high" }
        }
      ]
    }
  ],
  response_format: {
    type: "json_schema",
    json_schema: { /* schema definition */ }
  }
});
```

#### Working with S3 Storage

Upload files to S3 using the provided helpers:

```typescript
import { storagePut } from "./server/storage";

const { url } = await storagePut(
  `thumbnails/${userId}/${fileName}`,
  fileBuffer,
  "image/jpeg"
);
```

## API Reference

### Thumbnails

**List User Thumbnails**
```
GET /api/trpc/thumbnails.list
```
Returns all thumbnails uploaded by the authenticated user.

**Get Thumbnail Details**
```
GET /api/trpc/thumbnails.getById?id=<id>
```
Returns detailed information about a specific thumbnail.

**Analyze Thumbnail**
```
POST /api/trpc/thumbnails.analyze
Body: { thumbnailId: number }
```
Triggers LLM analysis of a thumbnail and stores results.

### Mixes

**List User Mixes**
```
GET /api/trpc/mixes.list
```
Returns all thumbnail mixes created by the user.

**Get Mix Suggestions**
```
POST /api/trpc/mixes.getSuggestions
Body: { thumbnailIds: number[] }
```
Generates AI-powered mixing suggestions for selected thumbnails.

**Create Mix**
```
POST /api/trpc/mixes.create
Body: {
  name: string,
  description?: string,
  sourceThumbIds: number[],
  blendingMethod?: string
}
```
Creates a new thumbnail mix project.

## Database Schema

### Users Table
Stores user account information and authentication details.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| openId | VARCHAR | Manus OAuth identifier |
| name | TEXT | User's display name |
| email | VARCHAR | User's email address |
| role | ENUM | User role (user/admin) |
| createdAt | TIMESTAMP | Account creation time |

### Thumbnails Table
Stores uploaded thumbnail images and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| userId | INT | Foreign key to users |
| fileName | VARCHAR | Original filename |
| fileKey | VARCHAR | S3 storage key |
| fileUrl | TEXT | S3 public URL |
| width | INT | Image width in pixels |
| height | INT | Image height in pixels |
| analysis | TEXT | JSON analysis results |
| createdAt | TIMESTAMP | Upload time |

### Mixes Table
Stores thumbnail combination projects.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| userId | INT | Foreign key to users |
| name | VARCHAR | Mix project name |
| sourceThumbIds | TEXT | JSON array of thumbnail IDs |
| resultFileUrl | TEXT | S3 URL of blended result |
| blendingMethod | VARCHAR | Blending algorithm used |
| ragSuggestions | TEXT | JSON with LLM suggestions |
| createdAt | TIMESTAMP | Creation time |

### Analyses Table
Stores detailed analysis results for each thumbnail.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| thumbnailId | INT | Foreign key to thumbnails |
| dominantColors | TEXT | JSON array of hex colors |
| textElements | TEXT | JSON array of text data |
| composition | TEXT | Composition analysis |
| engagementScore | INT | 1-10 engagement rating |
| suggestions | TEXT | JSON improvement suggestions |

## Development Workflow

### Making Changes

1. **Create a feature branch**: `git checkout -b feature/your-feature`
2. **Make your changes** following the code structure
3. **Test locally**: `pnpm dev` and verify in browser
4. **Commit with clear messages**: `git commit -m "feat: add thumbnail blending"`
5. **Push to GitHub**: `git push origin feature/your-feature`
6. **Create a Pull Request** for review

### Code Style

The project uses TypeScript with strict type checking. Follow these conventions:

- Use `const` for variables, `let` for reassignments
- Name React components with PascalCase
- Name functions and variables with camelCase
- Use descriptive names that explain intent
- Add JSDoc comments for complex functions
- Keep components under 300 lines when possible

### Testing

While this template doesn't include a test framework by default, you can add one:

```bash
pnpm add -D vitest @testing-library/react
```

## Deployment

### To Manus Platform

1. **Save a checkpoint**: The application automatically creates checkpoints
2. **Click Publish**: Use the Management UI to publish your changes
3. **Configure domain**: Set up a custom domain or use the provided subdomain

### To Other Platforms

The application can be deployed to any Node.js hosting platform:

1. **Build the project**: `pnpm build`
2. **Set environment variables** on your hosting platform
3. **Run the server**: `node server/index.js`
4. **Configure database** connection string for your platform

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify your `DATABASE_URL` environment variable
2. Ensure your database server is running
3. Check that credentials are correct
4. Run `pnpm db:push` to apply migrations

### LLM Analysis Failures

If thumbnail analysis fails:

1. Check that the image URL is publicly accessible
2. Verify your `BUILT_IN_FORGE_API_KEY` is valid
3. Ensure the image format is supported (JPEG, PNG, WebP)
4. Check server logs for detailed error messages

### Authentication Issues

If login doesn't work:

1. Verify OAuth credentials in environment variables
2. Clear browser cookies and try again
3. Check that the redirect URL matches your configuration
4. Review browser console for error messages

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Ensure code follows project style guidelines
5. Submit a pull request with a description of changes

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting section
- Contact the development team

## Roadmap

Future enhancements planned for the YouTube Thumbnail Mixer RAG Tool:

- **Batch Processing**: Analyze and mix multiple thumbnail sets simultaneously
- **Template Library**: Pre-designed templates for common video categories
- **A/B Testing**: Built-in tools to compare thumbnail performance
- **Analytics Integration**: Connect with YouTube Analytics for real performance data
- **Collaborative Features**: Share and collaborate on thumbnail designs with team members
- **Advanced Blending**: More sophisticated image blending algorithms
- **Mobile App**: Native mobile applications for iOS and Android
- **API Access**: RESTful API for third-party integrations

## Acknowledgments

This project was built with modern web technologies and leverages the power of retrieval-augmented generation for intelligent thumbnail analysis and suggestions. Special thanks to the open-source community for the excellent tools and libraries that made this possible.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintainer**: Manus AI
