
const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();

const PORT = 3001;

app.use(express.json());

const filePath = path.join(__dirname, 'data', 'jobs.json');

app.get('/jobs', async (req, res) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');

        const jobs = JSON.parse(data);

        res.json({
            message: 'Jobs retrieved successfully',
            jobs: jobs
        });

    } catch (error) {
        console.error('Error reading jobs:', error.message);

        res.status(500).json({
            error: 'Unable to read jobs database'
        });
    }
});

app.post('/jobs', async (req, res) => {
    const { company, role, status = 'Applied' } = req.body || {};

    if (
        typeof company !== 'string' || !company.trim() ||
        typeof role !== 'string' || !role.trim() ||
        typeof status !== 'string' || !status.trim()
    ) {
        return res.status(400).json({
            error: 'Valid company, role and status are required'
        });
    }

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const jobs = JSON.parse(data);

        const newId = Math.max(0, ...jobs.map(job => job.id)) + 1;

        const newJob = {
            id: newId,
            company: company.trim(),
            role: role.trim(),
            status: status.trim()
        };

        jobs.push(newJob);

        await fs.writeFile(
            filePath,
            JSON.stringify(jobs, null, 2),
            'utf8'
        );

        res.status(201).json({
            message: 'Job created successfully',
            job: newJob
        });

    } catch (error) {
        console.error('Error creating job:', error.message);

        res.status(500).json({
            error: 'Unable to create job'
        });
    }
});

app.put('/jobs/:id', async (req, res) => {
    const jobId = Number(req.params.id);

    const { company, role, status } = req.body || {};

    if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
            error: 'Invalid job ID'
        });
    }

    if (
        typeof company !== 'string' || !company.trim() ||
        typeof role !== 'string' || !role.trim() ||
        typeof status !== 'string' || !status.trim()
    ) {
        return res.status(400).json({
            error: 'Valid company, role and status are required'
        });
    }

    try {

        const data = await fs.readFile(filePath, 'utf8');
        const jobs = JSON.parse(data);

        const jobIndex = jobs.findIndex(job => job.id === jobId);

        if (jobIndex === -1) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

        const updatedJob = {
            id: jobId,
            company: company.trim(),
            role: role.trim(),
            status: status.trim()
        };

        jobs[jobIndex] = updatedJob;

        await fs.writeFile(
            filePath,
            JSON.stringify(jobs, null, 2),
            'utf8'
        );

        res.status(200).json({
            message: 'Job updated successfully',
            job: updatedJob
        });

    } catch (error) {
        console.error('Error updating job:', error.message);

        res.status(500).json({
            error: 'Unable to update job'
        });
    }
});

app.delete('/jobs/:id', async (req, res) => {
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
            error: 'Invalid job ID'
        });
    }

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const jobs = JSON.parse(data);

        const jobIndex = jobs.findIndex(job => job.id === jobId);

        if (jobIndex === -1) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }

        const deletedJob = jobs.splice(jobIndex, 1)[0];

        await fs.writeFile(
            filePath,
            JSON.stringify(jobs, null, 2),
            'utf8'
        );

        res.status(200).json({
            message: 'Job deleted successfully',
            job: deletedJob
        });

    } catch (error) {
        console.error('Error deleting job:', error.message);

        res.status(500).json({
            error: 'Unable to delete job'
        });
    }
});


const JOB_PIPE = String.raw`\\.\pipe\jobtask-job`;

app.listen(JOB_PIPE, () => {
    console.log(`Task Service running on port ${PORT}`);
});
