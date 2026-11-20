# Job Task Management System

A Node.js and Express application for managing job applications and related tasks.

The services communicate through Windows named pipes:

- API Gateway: `http://localhost:3000`
- Job Service: named pipe `\\.\pipe\jobtask-job`
- Task Service: named pipe `\\.\pipe\jobtask-task`

## Prerequisites

- Windows
- Node.js 18 or newer
- npm

## Installation

Open a terminal in the project folder and install the dependencies:

```powershell
npm install
```

## Running the Application

This project requires three terminals. Start the services in the order below.

### Terminal 1: Start the Job Service

```powershell
node jobService.js
```

Keep this terminal running. The Job Service listens on `\\.\pipe\jobtask-job`.

### Terminal 2: Start the Task Service

```powershell
node taskService.js
```

Keep this terminal running. The Task Service listens on `\\.\pipe\jobtask-task`.

### Terminal 3: Start the API Gateway

```powershell
node gateway.js
```

When all three services are running, open:

- Gateway status: http://localhost:3000
- Web app route: http://localhost:3000/app
- Jobs API: http://localhost:3000/jobs
- Tasks API: http://localhost:3000/tasks

## API Endpoints

### Jobs

| Method | URL | Description |
|---|---|---|
| `GET` | `/jobs` | Retrieve all jobs |
| `POST` | `/jobs` | Add a job |
| `PUT` | `/jobs/:id` | Update a job |
| `DELETE` | `/jobs/:id` | Delete a job |

Example request:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/jobs" `
  -ContentType "application/json" `
  -Body '{"company":"Example Company","role":"Developer","status":"Applied"}'
```

### Tasks

| Method | URL | Description |
|---|---|---|
| `GET` | `/tasks` | Retrieve all tasks |
| `POST` | `/tasks` | Add a task |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |

Example request:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/tasks" `
  -ContentType "application/json" `
  -Body '{"jobId":1,"title":"Prepare CV","completed":false}'
```

## Stopping the Application

Press `Ctrl+C` in each terminal to stop the services.

## Troubleshooting

- **Service unavailable:** Make sure the Job Service and Task Service were started before the API Gateway.
- **Port already in use:** Stop another process using port `3000`.
- **Named pipe errors:** This application uses Windows named pipes and must be run on Windows.
- **Cannot find a module:** Run `npm install` again in the project folder.
