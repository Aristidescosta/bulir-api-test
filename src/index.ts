import { server } from './server/Server';

interface Teste {
    
}

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});