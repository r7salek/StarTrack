import { FormBuilder } from '@angular/forms';
import { CreateProjectComponent } from './CreateProject.component';

describe('CreateProjectComponent', () => {
  it('creates with isolated collaborators', () => {
    const dateAdapter = jasmine.createSpyObj('DateAdapter', ['setLocale']);
    const component = new CreateProjectComponent(
      new FormBuilder(), {} as any, {} as any,
      { getUser: () => ({ id: 1, roles: ['ROLE_USER'] }) } as any,
      {} as any, dateAdapter, {} as any
    );
    expect(component).toBeTruthy();
    expect(dateAdapter.setLocale).toHaveBeenCalledWith('en-de');
  });
});
