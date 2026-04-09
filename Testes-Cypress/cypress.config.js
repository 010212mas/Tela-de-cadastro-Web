const fs = require('fs');
const http = require('http');
const path = require('path');
const { defineConfig } = require("cypress");

const appRoot = path.resolve(__dirname, '..');
const serverPort = 4173;
const baseUrl = `http://127.0.0.1:${serverPort}`;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

let server;

function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  });
}

function startServer() {
  if (server) {
    return Promise.resolve();
  }

  server = http.createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const normalizedPath = requestPath === '/' ? '/index.html' : requestPath;
    const safePath = path.normalize(normalizedPath).replace(/^([.]{2}[\/])+/, '');
    const filePath = path.join(appRoot, safePath);

    if (!filePath.startsWith(appRoot)) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }

    fs.stat(filePath, (error, stats) => {
      if (!error && stats.isFile()) {
        sendFile(response, filePath);
        return;
      }

      if (!path.extname(filePath)) {
        const htmlPath = `${filePath}.html`;

        fs.stat(htmlPath, (htmlError, htmlStats) => {
          if (!htmlError && htmlStats.isFile()) {
            sendFile(response, htmlPath);
            return;
          }

          response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          response.end('Not found');
        });
        return;
      }

      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    });
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(serverPort, '127.0.0.1', () => resolve());
  });
}

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl,

    async setupNodeEvents(on, config) {
      await startServer();

      on('before:run', () => startServer());
      on('after:run', () => {
        if (!server) {
          return;
        }

        server.close();
        server = undefined;
      });

      return config;
    },
  },
});
