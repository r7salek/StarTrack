import { UpdateProposalStatusComponent } from './UpdateProposalStatus.component';
import { of, throwError, Subject } from 'rxjs';

describe('UpdateProposalStatusComponent', () => {
  it('prevents duplicate saves and cancellation until a pending request completes', () => {
    const pending = new Subject<any>();
    const service = jasmine.createSpyObj('CreateProjectService', ['updateProposalPerm']);
    service.updateProposalPerm.and.returnValue(pending);
    const ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    const notices = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    const component = new UpdateProposalStatusComponent(ref, notices, service, {} as any);
    component.onUpdateUserPerm(12, 'ACCEPTED');
    component.onUpdateUserPerm(12, 'CLOSED');
    component.onClose();
    expect(service.updateProposalPerm).toHaveBeenCalledTimes(1);
    expect(ref.disableClose).toBeTrue();
    expect(ref.close).not.toHaveBeenCalled();
    pending.error({ status: 500 });
    expect(component.isSaving).toBeFalse();
    expect(component.error).toContain('try again');
    component.onClose();
    expect(ref.close).toHaveBeenCalled();
  });
  it('does not submit a missing or unsupported status', () => {
    const service = jasmine.createSpyObj('CreateProjectService', ['updateProposalPerm']);
    const component = new UpdateProposalStatusComponent({} as any, {} as any, service, {} as any);
    component.onUpdateUserPerm(12, '');
    component.onUpdateUserPerm(12, 'UNKNOWN');
    expect(service.updateProposalPerm).not.toHaveBeenCalled();
    expect(component.error).toBe('Choose a project status.');
  });
  it('creates with isolated collaborators', () => {
    const component = new UpdateProposalStatusComponent(
      {} as any, {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });
  it('closes after an appended status snapshot to refresh the latest list', () => {
    const service = jasmine.createSpyObj('CreateProjectService', ['updateProposalPerm']);
    service.updateProposalPerm.and.returnValue(of(null));
    const ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    const notices = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    const component = new UpdateProposalStatusComponent(ref, notices, service, {} as any);
    component.onUpdateUserPerm(12, 'ACCEPTED');
    expect(service.updateProposalPerm).toHaveBeenCalledWith(12, 'ACCEPTED');
    expect(ref.close).toHaveBeenCalledWith(true);
  });
  it('keeps the status dialog open when its source version is stale', () => {
    const service = { updateProposalPerm: () => throwError(() => ({ status: 409 })) };
    const ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    const notices = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    const component = new UpdateProposalStatusComponent(ref, notices, service as any, {} as any);
    component.onUpdateUserPerm(12, 'ACCEPTED');
    expect(ref.close).not.toHaveBeenCalled();
    expect(notices.error).toHaveBeenCalledWith(jasmine.stringMatching('latest version'));
  });
});
