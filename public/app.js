
function displayTable(tableId, records, fields) {

    const table = document.getElementById(tableId);

    table.replaceChildren();

    if (records.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = fields.length;
        cell.textContent = 'No records found';

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    records.forEach(record => {

        const row = document.createElement('tr');

        fields.forEach(field => {

            const cell = document.createElement('td');

            if (field === 'completed') {
                cell.textContent = record[field] ? 'Yes' : 'No';
            } else {
                cell.textContent = record[field] ?? '';
            }

            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

async function loadJobs() {
    try {
        const response = await fetch('/jobs');

        if (!response.ok) {
            throw new Error('Failed to retrieve jobs');
        }

        const data = await response.json();
        const jobs = data.jobs;

        document.getElementById('totalJobs').textContent =
            jobs.length;

        displayTable(
            'jobsTable',
            jobs,
            ['id', 'company', 'role', 'status']
        );

    } catch (error) {
        console.error('Job loading error:', error);
        alert('Unable to load job applications');
    }
}

async function loadTasks() {
    try {
        const response = await fetch('/tasks');

        if (!response.ok) {
            throw new Error('Failed to retrieve tasks');
        }

        const data = await response.json();
        const tasks = data.tasks;

        document.getElementById('totalTasks').textContent =
            tasks.length;

        const completed = tasks.filter(
            task => task.completed === true
        ).length;

        document.getElementById('completedTasks').textContent =
            completed;

        displayTable(
            'tasksTable',
            tasks,
            ['id', 'jobId', 'title', 'completed']
        );

    } catch (error) {
        console.error('Task loading error:', error);
        alert('Unable to load tasks');
    }
}

loadJobs();
loadTasks();

document.getElementById('jobForm').addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();

        const company =
            document.getElementById('company').value;

        const role =
            document.getElementById('role').value;

        const status =
            document.getElementById('status').value;

        const message =
            document.getElementById('jobMessage');

        try {

            const response = await fetch('/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    company: company,
                    role: role,
                    status: status
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unable to add job');
            }

            message.textContent = data.message;

            event.target.reset();

            await loadJobs();

        } catch (error) {
            message.textContent = error.message;
        }
    }
);

document.getElementById('taskForm').addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();

        const jobId = Number(
            document.getElementById('taskJobId').value
        );

        const title =
            document.getElementById('taskTitle').value;

        const completed =
            document.getElementById('taskCompleted').checked;

        const message =
            document.getElementById('taskMessage');

        try {

            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jobId: jobId,
                    title: title,
                    completed: completed
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Unable to add task'
                );
            }

            message.textContent = data.message;

            event.target.reset();

            await loadTasks();

        } catch (error) {
            message.textContent = error.message;
        }
    }
);
