import { FormBuilder } from '@angular/forms';
import { UpdateProjectComponent } from './updateProject.component';

describe('UpdateProjectComponent', () => {
  it('creates with isolated collaborators', () => {
    const dateAdapter = jasmine.createSpyObj('DateAdapter', ['setLocale']);
    const component = new UpdateProjectComponent(
      {} as any, {} as any, {} as any, {} as any,
      { getUser: () => ({ id: 1, roles: ['ROLE_USER'] }) } as any,
      {} as any, dateAdapter, {}, new FormBuilder()
    );
    expect(component).toBeTruthy();
    expect(dateAdapter.setLocale).toHaveBeenCalledWith('en-de');
  });
});
