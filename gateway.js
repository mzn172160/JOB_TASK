
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = 3000;

const JOB_PIPE = String.raw`\\.\pipe\jobtask-job`;
const TASK_PIPE = String.raw`\\.\pipe\jobtask-task`;

app.use(express.json());

app.use('/static', express.static(
    path.join(__dirname, 'public')
));

app.get('/', (req, res) => {
    res.send('Welcome to JobTask Management System');
});

app.get('/app', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'index.html')
    );
});

function createProxy(pipePath, serviceName) {
    return (req, res) => {

        const hasBody =
            req.method === 'POST' || req.method === 'PUT';

        const body = hasBody
            ? JSON.stringify(req.body || {})
            : null;

        const headers = {};

        if (hasBody) {
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] =
                Buffer.byteLength(body);
        }

        const request = http.request({
            socketPath: pipePath,
            path: req.originalUrl,
            method: req.method,
            headers: headers,
            timeout: 5000
        }, (response) => {

            res.status(response.statusCode || 502);

            if (response.headers['content-type']) {
                res.set(
                    'Content-Type',
                    response.headers['content-type']
                );
            }

            response.pipe(res);
        });

        request.on('timeout', () => {
            request.destroy(new Error('Service timeout'));
        });

        request.on('error', (error) => {
            console.error(serviceName, error.message);

            if (!res.headersSent) {
                res.status(503).json({
                    error: `${serviceName} is unavailable`
                });
            } else {
                res.end();
            }
        });

        request.end(body === null ? undefined : body);
    };
}

const jobProxy = createProxy(JOB_PIPE, 'Job Service');
const taskProxy = createProxy(TASK_PIPE, 'Task Service');

app.get('/jobs', jobProxy);
app.post('/jobs', jobProxy);
app.put('/jobs/:id', jobProxy);
app.delete('/jobs/:id', jobProxy);

app.get('/tasks', taskProxy);
app.post('/tasks', taskProxy);
app.put('/tasks/:id', taskProxy);
app.delete('/tasks/:id', taskProxy);


app.all(['/jobs', '/tasks'], (req, res) => {
    res.set('Allow', 'GET, POST');

    res.status(405).json({
        error: 'Method not allowed',
        allowedMethods: ['GET', 'POST']
    });
});


app.all(['/jobs/:id', '/tasks/:id'], (req, res) => {
    res.set('Allow', 'PUT, DELETE');

    res.status(405).json({
        error: 'Method not allowed',
        allowedMethods: ['PUT', 'DELETE']
    });
});


app.listen(PORT, '127.0.0.1', () => {
    console.log(
        `API Gateway running on http://localhost:${PORT}`
    );
});
