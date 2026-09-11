import { ProjectCreateDetailsComponent } from './ProjectCreateDetails.component';

describe('ProjectCreateDetailsComponent', () => {
  it('creates with isolated collaborators', () => {
    const dateAdapter = jasmine.createSpyObj('DateAdapter', ['setLocale']);
    const component = new ProjectCreateDetailsComponent(
      {} as any, {} as any, {} as any, dateAdapter,
      {} as any, {} as any, {} as any, {}
    );
    expect(component).toBeTruthy();
    expect(dateAdapter.setLocale).toHaveBeenCalledWith('en-de');
  });
});
