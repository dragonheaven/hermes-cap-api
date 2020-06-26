import clientsController from '../controllers/clients.controller';
import usersController from '../controllers/users.controller';
import tradesController from '../controllers/trade.controller';
import positionsController from '../controllers/positions.controller';

const passportConfig = require('../config/passport');
const { verifyAuth } = require('../middlewares/verifyAuthentication');
const { onlyHermesCapital, aboveFundSuperAdmin, aboveFundAdmin } = require('../middlewares/role');

exports.initRoutes = (app) => {
  /**
   * Primary app routes.
   */
  app.post('/admin/login', usersController.postLogin);
  app.get('/admin/logout', usersController.logout);
  app.post('/admin/forgot-password', usersController.requestForgotPassword);
  app.post('/admin/reset-password', usersController.resetPassword);

  app.get('/admin/accounts', verifyAuth, usersController.getUsers);
  app.post('/admin/accounts', verifyAuth, aboveFundSuperAdmin, usersController.create);
  app.put('/admin/accounts', verifyAuth, aboveFundSuperAdmin, usersController.update);
  app.post('/admin/accounts/delete', verifyAuth, aboveFundSuperAdmin, usersController.delete);
  app.get('/admin/account/profile', verifyAuth, usersController.getProfile);
  app.post('/admin/account/profile', verifyAuth, usersController.updateProfile);
  app.post('/admin/fetch/totalData', verifyAuth, usersController.getTotalData);
  app.post('/admin/account/password', verifyAuth, usersController.updatePassword);
  app.post('/admin/set-password', usersController.setAdminPassword);

  app.get('/admin/clients', verifyAuth, clientsController.getFetchClients);
  app.get('/admin/clients/special', verifyAuth, clientsController.getFetchSpecialClient);
  app.post('/admin/clients', verifyAuth, aboveFundAdmin, clientsController.create);
  app.put('/admin/clients', verifyAuth, aboveFundAdmin, clientsController.update);
  app.post('/admin/clients/delete', verifyAuth, aboveFundAdmin, clientsController.delete);


  app.post('/admin/trade/fetch/history', verifyAuth, tradesController.getFetchTrades);
  app.post('/admin/trade/fetch/special', verifyAuth, tradesController.fetchSpecialTrades);
  app.post('/admin/trade/fetch/pnlSum', verifyAuth, tradesController.fetchPnlSum);

  app.post('/admin/positions/fetch/history', verifyAuth, positionsController.getFetchPositions);
  app.post('/admin/positions/fetch/special', verifyAuth, positionsController.fetchSpecialPositions);
};
