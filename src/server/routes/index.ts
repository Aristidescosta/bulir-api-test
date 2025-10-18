import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ServicesController, UserController } from '../controllers';

const router = Router();

/* Rotas para os servicos */

router.post('/services', ServicesController.createValidation, ServicesController.create);
router.get('/services', ServicesController.getAllValidation, ServicesController.getAll);
router.get('/services/:id', ServicesController.getByIdValidation, ServicesController.getById);
router.delete('/services/:id', ServicesController.deleteByIdValidation, ServicesController.deleteById);
router.put('/services/:id', ServicesController.updateByIdValidation, ServicesController.updateById);

/* Rotas para os usuarios */
router.post('/api/auth/register', UserController.createValidation, UserController.create);


router.get('/', (req, res) => {
  res.status(StatusCodes.OK).send('Hello, World!');
});

export { router };