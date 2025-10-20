import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BookingController, ServicesController, UserController, WalletController } from '../controllers';
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
router.get('/services/my', authenticate, ServicesController.getAllByProviderValidation, ServicesController.getAllByProvider);
router.get('/services/:id', authenticate, ServicesController.getByIdValidation, ServicesController.getById);
router.delete('/services/:id', authenticate, ServicesController.deleteByIdValidation, ServicesController.deleteById);
router.put('/services/:id', authenticate, ServicesController.updateByIdValidation, ServicesController.updateById);

/* Rotas para os usuarios */
router.post('/users', UserController.createValidation, UserController.create);
/* router.get('/users/:id', authenticate ,UserController.getByIdValidation, UserController.getById);
router.put('/users/:id', UserController.updateByIdValidation, UserController.updateById);
router.delete('/users/:id', UserController.deleteByIdValidation, UserController.deleteById);
router.get('/users/email/:email', UserController.getByEmailValidation, UserController.getByEmail);
router.get('/users', authenticate, UserController.getAllValidation, UserController.getAll); */

/* Booking */
router.post('/booking', authenticate, BookingController.createValidation, BookingController.create);
router.get('/bookings', authenticate, BookingController.getAllValidation, BookingController.getAll);
router.get('/booking/:id', authenticate, BookingController.getByIdValidation, BookingController.getById);
router.patch('/booking/:id/cancel', authenticate, BookingController.cancelValidation, BookingController.cancel);
router.get('/booking/complete/:id', authenticate, BookingController.completeValidation, BookingController.completeValidation);


/* WALLET */
router.get('/wallet/balance', authenticate, WalletController.getBalance);

router.post(
  '/wallet/deposit',
  authenticate,
  WalletController.depositValidation,
  WalletController.deposit
);

router.post(
  '/wallet/withdraw',
  authenticate,
  WalletController.withdrawValidation,
  WalletController.withdraw
);

router.get(
  '/wallet/transactions',
  authenticate,
  WalletController.getTransactionsValidation,
  WalletController.getTransactions
);
router.get('/', (req, res) => {
  res.status(StatusCodes.OK).send('Hello, World!');
});

export { router };