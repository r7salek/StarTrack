import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { NotificationService } from './notification.service';

export interface ActiveDraft {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

/** Only tracks active editors in memory. No project content is persisted here. */
@Injectable({ providedIn: 'root' })
export class DraftSafetyService {
  private editors = new Set<ActiveDraft>();
  private confirmation?: Promise<boolean>;

  constructor(private notices: NotificationService) {}

  register(editor: ActiveDraft): () => void {
    this.editors.add(editor);
    return () => this.editors.delete(editor);
  }

  shouldProtect(editor: ActiveDraft): boolean {
    return this.editors.has(editor) && (editor.isSaving || editor.hasUnsavedChanges);
  }

  /** Call only after the user has approved a terminal action such as sign-out. */
  releaseForSignOut(): void { this.editors.clear(); }

  confirmLeave(): Promise<boolean> {
    if ([...this.editors].some(editor => editor.isSaving)) {
      this.notices.error('Please wait for the project save to finish before leaving.');
      return Promise.resolve(false);
    }
    if (![...this.editors].some(editor => editor.hasUnsavedChanges)) return Promise.resolve(true);
    if (!this.confirmation) {
      this.confirmation = new Promise<boolean>(resolve => {
        this.notices.confirmation(
          'Your unsaved project changes will be lost. Discard them and leave?',
          () => resolve(![...this.editors].some(editor => editor.isSaving)),
          'Discard unsaved changes?',
          () => resolve(false)
        );
      }).finally(() => { this.confirmation = undefined; });
    }
    return this.confirmation;
  }
}

@Injectable({ providedIn: 'root' })
export class UnsavedProjectGuard implements CanDeactivate<unknown> {
  constructor(private drafts: DraftSafetyService) {}
  canDeactivate(): Promise<boolean> { return this.drafts.confirmLeave(); }
}
