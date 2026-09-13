import { DraftSafetyService, UnsavedProjectGuard } from './draft-safety.service';

describe('DraftSafetyService', () => {
  let notices: any;
  let drafts: DraftSafetyService;
  beforeEach(() => {
    notices = jasmine.createSpyObj('NotificationService', ['confirmation', 'error']);
    drafts = new DraftSafetyService(notices);
  });

  it('allows pristine editors and unregisters destroyed editors', async () => {
    const editor = { isSaving: false, hasUnsavedChanges: false };
    const unregister = drafts.register(editor);
    expect(await new UnsavedProjectGuard(drafts).canDeactivate()).toBeTrue();
    editor.hasUnsavedChanges = true;
    unregister();
    expect(await drafts.confirmLeave()).toBeTrue();
    expect(notices.confirmation).not.toHaveBeenCalled();
  });

  it('preserves drafts on cancellation and combines repeated navigation requests', async () => {
    const editor = { isSaving: false, hasUnsavedChanges: true };
    drafts.register(editor);
    const first = drafts.confirmLeave();
    expect(drafts.confirmLeave()).toBe(first);
    notices.confirmation.calls.mostRecent().args[3]();
    expect(await first).toBeFalse();
    expect(drafts.shouldProtect(editor)).toBeTrue();
    const second = drafts.confirmLeave();
    notices.confirmation.calls.mostRecent().args[1]();
    expect(await second).toBeTrue();
    expect(notices.confirmation).toHaveBeenCalledTimes(2);
  });

  it('does not allow discarding a pending save, including one started during confirmation', async () => {
    const editor = { isSaving: true, hasUnsavedChanges: true };
    drafts.register(editor);
    expect(await drafts.confirmLeave()).toBeFalse();
    expect(notices.error).toHaveBeenCalled();
    expect(notices.confirmation).not.toHaveBeenCalled();
    editor.isSaving = false;
    const result = drafts.confirmLeave();
    editor.isSaving = true;
    notices.confirmation.calls.mostRecent().args[1]();
    expect(await result).toBeFalse();
  });

  it('releases approved sign-out without a second browser or navigation warning', async () => {
    const editor = { isSaving: false, hasUnsavedChanges: true };
    drafts.register(editor);
    drafts.releaseForSignOut();
    expect(drafts.shouldProtect(editor)).toBeFalse();
    expect(await drafts.confirmLeave()).toBeTrue();
  });
});
