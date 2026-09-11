import { UM_approveRequestComponent } from './UM_approveRequest.component';

describe('UM_approveRequestComponent', () => {
  it('creates with isolated collaborators', () => {
    const component = new UM_approveRequestComponent(
      {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });
});
