import { CreateProjectHistoryComponent } from './CreateProjectHistory.component';
import { of } from 'rxjs';

describe('CreateProjectHistoryComponent', () => {
  it('creates with isolated collaborators', () => {
    const component = new CreateProjectHistoryComponent(
      {} as any, {} as any, {} as any, {} as any, {} as any, {}
    );
    expect(component).toBeTruthy();
  });
  it('fetches history using the stable UUID passed by the list', () => {
    const service = jasmine.createSpyObj('CreateProjectService', ['getCreateProjectDataHistory']);
    service.getCreateProjectDataHistory.and.returnValue(of([{ projectId: 'uuid', versionNumber: 2 }]));
    const component = new CreateProjectHistoryComponent({} as any, {} as any,
      service, {} as any, {} as any, { dataKey: 'uuid' });
    component.getProjectDataLatest();
    expect(service.getCreateProjectDataHistory).toHaveBeenCalledWith('uuid');
    expect(component.dataSource[0].versionNumber).toBe(2);
  });
});
