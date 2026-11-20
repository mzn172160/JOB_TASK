
const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();

const PORT = 3002;

app.use(express.json());

const filePath = path.join(__dirname, 'data', 'tasks.json');

app.get('/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');

        const tasks = JSON.parse(data);

        res.json({
            message: 'Tasks retrieved successfully',
            tasks: tasks
        });

    } catch (error) {
        console.error('Error reading tasks:', error.message);

        res.status(500).json({
            error: 'Unable to read tasks database'
        });
    }
});

app.post('/tasks', async (req, res) => {
    const { jobId, title, completed = false } = req.body || {};

    if (
        !Number.isInteger(jobId) ||
        jobId <= 0 ||
        typeof title !== 'string' ||
        !title.trim() ||
        typeof completed !== 'boolean'
    ) {
        return res.status(400).json({
            error: 'Valid jobId, title and completed status are required'
        });
    }

    try {

        const data = await fs.readFile(filePath, 'utf8');
        const tasks = JSON.parse(data);

        const newId = Math.max(0, ...tasks.map(task => task.id)) + 1;

        const newTask = {
            id: newId,
            jobId: jobId,
            title: title.trim(),
            completed: completed
        };

        tasks.push(newTask);

        await fs.writeFile(
            filePath,
            JSON.stringify(tasks, null, 2),
            'utf8'
        );

        res.status(201).json({
            message: 'Task created successfully',
            task: newTask
        });

    } catch (error) {
        console.error('Error creating task:', error.message);

        res.status(500).json({
            error: 'Unable to create task'
        });
    }
});

app.put('/tasks/:id', async (req, res) => {
    const taskId = Number(req.params.id);

    const { jobId, title, completed } = req.body || {};

    if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    if (
        !Number.isInteger(jobId) ||
        jobId <= 0 ||
        typeof title !== 'string' ||
        !title.trim() ||
        typeof completed !== 'boolean'
    ) {
        return res.status(400).json({
            error: 'Valid jobId, title and completed status are required'
        });
    }

    try {

        const data = await fs.readFile(filePath, 'utf8');
        const tasks = JSON.parse(data);

        const taskIndex = tasks.findIndex(
            task => task.id === taskId
        );

        if (taskIndex === -1) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        const updatedTask = {
            id: taskId,
            jobId: jobId,
            title: title.trim(),
            completed: completed
        };

        tasks[taskIndex] = updatedTask;

        await fs.writeFile(
            filePath,
            JSON.stringify(tasks, null, 2),
            'utf8'
        );

        res.status(200).json({
            message: 'Task updated successfully',
            task: updatedTask
        });

    } catch (error) {
        console.error('Error updating task:', error.message);

        res.status(500).json({
            error: 'Unable to update task'
        });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    try {

        const data = await fs.readFile(filePath, 'utf8');
        const tasks = JSON.parse(data);

        const taskIndex = tasks.findIndex(
            task => task.id === taskId
        );

        if (taskIndex === -1) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        const deletedTask = tasks.splice(taskIndex, 1)[0];

        await fs.writeFile(
            filePath,
            JSON.stringify(tasks, null, 2),
            'utf8'
        );

        res.status(200).json({
            message: 'Task deleted successfully',
            task: deletedTask
        });

    } catch (error) {
        console.error('Error deleting task:', error.message);

        res.status(500).json({
            error: 'Unable to delete task'
        });
    }
});


const TASK_PIPE = String.raw`\\.\pipe\jobtask-task`;

app.listen(TASK_PIPE, () => {
    console.log(`Task Service  running on port ${PORT}`);
});
