import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ServicesController, UserController } from '../controllers';
import { AuthController } from '../controllers/auth';
import { authenticate } from '../shared/middlewares/authenticate';

const router = Router();

// Público
router.post('/auth/login', AuthController.loginValidation, AuthController.login);
router.post('/auth/refresh', AuthController.refreshValidation, AuthController.refresh);

// Protegido
router.post('/auth/logout', authenticate, AuthController.logoutValidation, AuthController.logout);
router.get('/auth/me', authenticate, AuthController.me);

/* Rotas para os servicos */

router.post('/services', authenticate, ServicesController.createValidation, ServicesController.create);
router.get('/services', authenticate, ServicesController.getAllValidation, ServicesController.getAll);
router.get('/services/:id', authenticate, ServicesController.getByIdValidation, ServicesController.getById);
router.delete('/services/:id', authenticate, ServicesController.deleteByIdValidation, ServicesController.deleteById);
router.put('/services/:id', authenticate, ServicesController.updateByIdValidation, ServicesController.updateById);

/* Rotas para os usuarios */
router.post('/users', UserController.createValidation, UserController.create);
router.get('/users/:id', UserController.getByIdValidation, UserController.getById);
router.put('/users/:id', UserController.updateByIdValidation, UserController.updateById);
router.delete('/users/:id', UserController.deleteByIdValidation, UserController.deleteById);
router.get('/users/email/:email', UserController.getByEmailValidation, UserController.getByEmail);
router.get('/users', authenticate, UserController.getAllValidation, UserController.getAll);

router.get('/', (req, res) => {
  res.status(StatusCodes.OK).send('Hello, World!');
});
router.get('/teste', (req, res) => {
  res.status(StatusCodes.OK).send('Hello, World for a test!');
});

export { router };