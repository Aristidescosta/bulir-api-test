import * as deposit from './Deposit';
import * as getBalance from './GetBalance';
import * as getTransactions from './GetTransactions';
import * as withdraw from './Withdraw';

export const WalletController = {
  ...deposit,
  ...getBalance,
  ...getTransactions,
  ...withdraw,
};