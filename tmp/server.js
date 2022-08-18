const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    handleRequest(req,res)
});

server.listen(5500, () => console.log(`Server running on port 5500`));

function handleRequest(req,res) {
    
    
    if(req.method.toLowerCase() === 'get'){
    
        console.log(req.url);
        const filepath = path.join(__dirname, 'index.html')
        const fileStats = fs.statSync(filepath);

        res.setHeader('Content-Length', fileStats.size);
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        
        const readStream = fs.createReadStream(filepath);
        readStream.pipe(res);
    }
    else {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        const resMsg = JSON.stringify({
            error: 'Method not allowed'
        })

        res.end(resMsg);
    }
    
    
}
