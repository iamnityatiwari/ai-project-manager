# MERN AI Project Manager

A full-stack **MERN (MongoDB, Express, React, Node.js)** project management application that uses **AI** to suggest task assignments, deadlines, and priorities based on team workload and history.

## Features

- **Task CRUD**: Create, Read, Update, Delete tasks
- **Team Dashboard**: View team members, workloads, and project progress
- **AI Recommendation Engine**: Suggests task assignments, priorities, and deadlines
- **Notifications**: Get alerts for deadlines, updates, and task changes

## Tech Stack

- **Frontend**: React.js, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI**: OpenAI API

## Installation

1. Clone the repository:

```bash
git clone https://github.com/username/mern-ai-project-manager.git
````

2. Install dependencies:

```bash
cd client
npm install

cd ../server
npm install
```

3. Run the application:

```bash
# Start server
cd server
npm start

# Start client
cd ../client
npm start
```

## Folder Structure

```
project-root/
├─ client/       # React frontend
├─ server/       # Node.js + Express backend
├─ .gitignore
├─ README.md
```

## Notes

* Make sure to create a `.env` file in the server folder with your **MongoDB URI** and **OpenAI API key**
* `node_modules` are ignored in Git. Install dependencies locally before running.

```
