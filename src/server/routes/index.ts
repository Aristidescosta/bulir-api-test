import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ServicesController } from '../controllers';

const router = Router();

/* Rotas para os servicos */

router.post('/services', ServicesController.createValidation, ServicesController.create);
router.get('/services', ServicesController.getAllValidation, ServicesController.getAll);


router.get('/', (req, res) => {
  res.status(StatusCodes.OK).send('Hello, World!');
});

export { router };