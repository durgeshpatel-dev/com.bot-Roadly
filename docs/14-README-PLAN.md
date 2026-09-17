# 14 — README PLAN

## README Structure

The final `README.md` should follow this structure:

---

### 1. Project Header
- Project name: **Roadly**
- One-line description: "A customer feedback platform for submitting, voting on, and tracking feature requests through a public Kanban roadmap."
- Badges: Tech stack badges (MongoDB, Express, React, Node, TypeScript)
- Screenshot/hero image of the application

### 2. Table of Contents
- Auto-generated or manual links to all sections

### 3. About the Project
- What Roadly does (2–3 paragraphs)
- Key features list:
  - Feature request submission with Markdown
  - Atomic upvoting with optimistic UI
  - Threaded comments with Markdown
  - Role-based admin controls
  - Public 3-column Kanban roadmap
  - Debounced full-text search
  - Dual-token JWT authentication
  - Responsive design with Coss UI

### 4. Demo
- Link to live deployment
- Link to explanation video
- Screenshots/GIFs of key features:
  - Feature feed
  - Feature detail with comments
  - Roadmap view
  - Voting interaction
  - Admin panel
  - Mobile view

### 5. Technology Stack
- Table with category, technology, and why it was chosen
- List all third-party libraries and their purpose (assessment requires this)

### 6. Architecture Overview
- High-level architecture diagram (Mermaid or image)
- Brief description of frontend/backend separation
- API communication pattern

### 7. Getting Started

#### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

#### Installation
```bash
# Clone the repository
git clone https://github.com/<username>/roadly.git
cd roadly

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

#### Environment Variables
- Server `.env` variables with descriptions
- Client `.env` variables with descriptions
- Reference to `.env.example` files

#### Database Setup
- MongoDB local setup instructions
- MongoDB Atlas setup instructions
- Seed data instructions (`npm run seed:admin`)

#### Running Locally
```bash
# Start server (from server/)
npm run dev

# Start client (from client/)
npm run dev
```

### 8. API Documentation
- Summary table of all endpoints
- Link to detailed API docs (`docs/05-API-SPECIFICATION.md`) or inline

### 9. Key Technical Decisions
- Brief explanation of important architectural choices:
  - JWT dual-token architecture (why, how)
  - Atomic voting with MongoDB operators
  - Optimistic UI pattern
  - Comment threading approach
  - Search implementation

### 10. Testing
- How to run tests
- What is tested
- Manual testing notes

### 11. Deployment
- Brief deployment steps
- Link to live deployment

### 12. Project Structure
- Abbreviated folder tree with key directories explained

### 13. Assumptions & Limitations
- What was assumed (e.g., email verification is simulated)
- Known limitations (e.g., Render cold starts, no real email)
- What would be improved with more time

### 14. Extra Features
- List any optional features implemented
- Brief description of each

### 15. Credits & Third-Party Tools
- All external libraries with links
- Coss UI acknowledgment
- Any AI tools used (if required by assessment)

---

## README Quality Standards

From the Technical Assessment PDF:
> "If you use any external service, library, API, or significant third-party component, clearly mention it in your project documentation and explain why you chose it."

The README must:
- Be professional and well-formatted
- Include working setup instructions
- Document ALL external dependencies
- Be honest about limitations
- Enable someone to clone, configure, and run the project
