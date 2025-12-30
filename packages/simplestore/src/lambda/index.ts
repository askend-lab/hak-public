/**
 * Lambda module exports
 */

export { handler, setAdapter } from './handler';
export { 
  handleSave, 
  handleGet, 
  handleDelete, 
  handleQuery,
  createResponse,
  HTTP_STATUS,
  HTTP_ERRORS
} from './routes';
