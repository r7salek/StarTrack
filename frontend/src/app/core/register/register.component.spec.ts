import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  it('creates without making a registration request', () => {
    const component = new RegisterComponent(
      {} as any, {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });
});
