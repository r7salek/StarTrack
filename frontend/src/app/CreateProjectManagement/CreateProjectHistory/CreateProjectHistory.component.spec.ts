import { CreateProjectHistoryComponent } from './CreateProjectHistory.component';

describe('CreateProjectHistoryComponent', () => {
  it('creates with isolated collaborators', () => {
    const component = new CreateProjectHistoryComponent(
      {} as any, {} as any, {} as any, {} as any, {} as any, {}
    );
    expect(component).toBeTruthy();
  });
});
