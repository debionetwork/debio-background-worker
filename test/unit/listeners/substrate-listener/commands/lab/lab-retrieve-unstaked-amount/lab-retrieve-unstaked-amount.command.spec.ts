import { LabRetrieveUnstakeAmountCommand } from '../../../../../../../src/listeners/substrate-listener/commands/labs';
import { createMockLab, mockBlockNumber } from '../../../../../mock';
import { Lab } from '@debionetwork/polkadot-provider';
jest.mock('@debionetwork/polkadot-provider');

describe('Lab Retrieve Unstake Amount Command Event', () => {
  it('should called model data and toHuman', () => {
    const lab = createMockLab();

    const _ = new LabRetrieveUnstakeAmountCommand([lab], mockBlockNumber()); // eslint-disable-line
    expect(Lab).toHaveBeenCalled();
    expect(Lab).toHaveBeenCalledWith(lab.toHuman());
    expect(lab.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new LabRetrieveUnstakeAmountCommand([{}], mockBlockNumber()); // eslint-disable-line
    }).toThrowError();
  });
});
