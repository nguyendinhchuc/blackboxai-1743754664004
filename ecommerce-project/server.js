const http = require('http');
const fs = require('fs');
const path = require('path');
const { createProxyServer } = require('http-proxy');

// Create proxy instance
const proxy = createProxyServer({
    target: 'https://ecommece-af2a0921deff.herokuapp.com/ecommerce',
    changeOrigin: true,
    secure: false, // Don't verify SSL cert
    proxyTimeout: 30000, // Increase timeout
    timeout: 30000
});

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // Handle OPTIONS requests for CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle API proxy requests
    if (req.url.startsWith('/api')) {
        console.log(`Proxying request to: ${req.url}`);
        
        // Remove /api prefix when proxying
        req.url = req.url.replace(/^\/api/, '');
        
        proxy.web(req, res, {}, (err) => {
            console.error('Proxy error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'API Proxy Error',
                details: err.message 
            }));
        });
        return;
    }

    // Get the file path
    let filePath = req.url === '/' ? 'index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    // Get file extension
    const extname = path.extname(filePath);

    // Default content type
    let contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // For client-side routing, serve index.html for non-file requests
                fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error loading index.html');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        error: 'API Proxy Error',
        details: err.message 
    }));
});

// Log proxy events for debugging
proxy.on('proxyReq', (proxyReq, req, res) => {
    console.log('Proxy request:', proxyReq.path);
});

proxy.on('proxyRes', (proxyRes, req, res) => {
    console.log('Proxy response status:', proxyRes.statusCode);
});
