import { CreateProjectManagementComponent } from './CreateProjectManagement.component';

describe('CreateProjectManagementComponent', () => {
  it('creates with isolated collaborators', () => {
    const component = new CreateProjectManagementComponent(
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });
});
