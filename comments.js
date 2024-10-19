//Create web server
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { parse } = require('querystring');

//Read comments from file
function readComments(callback) {
    fs.readFile('comments.json', (err, data) => {
        if (err) {
            callback([]);
        } else {
            callback(JSON.parse(data));
        }
    });
}

//Write comments to file
function writeComments(comments, callback) {
    fs.writeFile('comments.json', JSON.stringify(comments), (err) => {
        callback(err);
    });
}

//Handle POST request
function handlePost(request, response) {
    let body = '';
    request.on('data', (chunk) => {
        body += chunk.toString();
    });
    request.on('end', () => {
        const comment = parse(body);
        readComments((comments) => {
            comments.push(comment);
            writeComments(comments, (err) => {
                if (err) {
                    response.statusCode = 500;
                    response.end('Server error');
                } else {
                    response.statusCode = 201;
                    response.end('Comment added');
                }
            });
        });
    });
}

//Handle GET request
function handleGet(request, response) {
    readComments((comments) => {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(comments));
    });
}

//Create server
const server = http.createServer((request, response) => {
    const method = request.method;
    const urlPath = url.parse(request.url).pathname;
    if (method === 'POST' && urlPath === '/comments') {
        handlePost(request, response);
    } else if (method === 'GET' && urlPath === '/comments') {
        handleGet(request, response);
    } else {
        response.statusCode = 404;
        response.end('Not found');
    }
});

//Start server
server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
});
