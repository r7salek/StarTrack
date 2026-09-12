import { RegisterComponent } from './register.component';
import { Subject, of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  it('creates without making a registration request', () => {
    const component = new RegisterComponent(
      {} as any, {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });

  function setup(response: any) {
    const auth = { register: jasmine.createSpy('register').and.returnValue(response) };
    const router = { navigate: jasmine.createSpy('navigate') };
    const component = new RegisterComponent(auth as any, { error: () => {} } as any, null as any, router as any);
    component.form = { password: 'synthetic-password', matchingPassword: 'synthetic-password' };
    return { component, auth, router };
  }

  it('retains the approval-pending confirmation instead of redirecting away', () => {
    const { component, router } = setup(of({}));
    component.onSubmit();
    expect(component.isSuccessful).toBeTrue();
    expect(component.isSubmitting).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not submit mismatched passwords', () => {
    const { component, auth } = setup(of({}));
    component.form.matchingPassword = 'different';
    component.onSubmit();
    expect(auth.register).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('must match');
  });

  it('prevents duplicate requests while awaiting registration', () => {
    const { component, auth } = setup(new Subject());
    component.onSubmit();
    component.onSubmit();
    expect(auth.register).toHaveBeenCalledTimes(1);
  });

  it('retains the form and permits retry after failure', () => {
    const { component } = setup(throwError(() => ({ status: 500 })));
    component.onSubmit();
    expect(component.isSubmitting).toBeFalse();
    expect(component.isSignUpFailed).toBeTrue();
    expect(component.form.password).toBe('synthetic-password');
  });

  it('can cancel a routed registration without a dialog reference', () => {
    const { component, router } = setup(of({}));
    component.onClose();
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  });
});
