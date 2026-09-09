import { UpdateProposalStatusComponent } from './UpdateProposalStatus.component';
import { of, throwError } from 'rxjs';

describe('UpdateProposalStatusComponent', () => {
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
