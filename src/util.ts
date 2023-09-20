
import {Balance} from '@polkadot/types/interfaces/runtime';
import {BN} from '@polkadot/util'

export const parseBalance = (balance: Balance, base: BN): number => {
    const dm = new BN(balance).divmod(base);
    return parseFloat(dm.div.toString() + "." + dm.mod.toString());
}
