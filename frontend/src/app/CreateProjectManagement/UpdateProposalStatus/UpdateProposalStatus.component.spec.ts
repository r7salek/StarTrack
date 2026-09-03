import { UpdateProposalStatusComponent } from './UpdateProposalStatus.component';

describe('UpdateProposalStatusComponent', () => {
  it('creates with isolated collaborators', () => {
    const component = new UpdateProposalStatusComponent(
      {} as any, {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });
});
