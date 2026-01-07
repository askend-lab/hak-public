import http from 'http';
import { analyzeHandler, variantsHandler, healthHandler } from './handler';
import { APIGatewayProxyEvent } from 'aws-lambda';

const PORT = process.env.PORT || 8080;

function createEvent(body: string, path: string, method: string): APIGatewayProxyEvent {
  return {
    body,
    headers: {},
    multiValueHeaders: {},
    httpMethod: method,
    isBase64Encoded: false,
    path,
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: ''
  };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', async () => {
    const event = createEvent(body, req.url || '/', req.method || 'GET');
    let result;
    
    try {
      if (req.url === '/analyze' && req.method === 'POST') {
        result = await analyzeHandler(event);
      } else if (req.url === '/variants' && req.method === 'POST') {
        result = await variantsHandler(event);
      } else if (req.url === '/health') {
        result = healthHandler();
      } else {
        result = { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
      }
    } catch (error) {
      result = { statusCode: 500, body: JSON.stringify({ error: String(error) }) };
    }
    
    res.writeHead(result.statusCode);
    res.end(result.body);
  });
});

server.listen(PORT, () => {
  console.log(`Vabamorf API running on http://localhost:${PORT}`);
  console.log('Endpoints: POST /analyze, POST /variants, GET /health');
});
