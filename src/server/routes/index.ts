import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ServicesController } from '../controllers';

const router = Router();

/* Rotas para os servicos */

router.post('/', ServicesController.createBodyValidator, ServicesController.create);


router.get('/', (req, res) => {
  res.status(StatusCodes.OK).send('Hello, World!');
});

export { router };