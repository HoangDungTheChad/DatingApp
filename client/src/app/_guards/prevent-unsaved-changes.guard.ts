import { CanDeactivateFn } from '@angular/router';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';
import { ConfirmService } from '../_service/confirm.service';
import { inject } from '@angular/core';

export const preventUnsavedChangesGuard: CanDeactivateFn<MemberEditComponent> = (component) => {
  const confirmService = inject(ConfirmService); 

  if (component.editForm.dirty) {
    // return confirm("Are you sure you want to continue, any unsaved changes will be lost")
    // because we're inside a route guard, this is going to automatically subscribe for us 
    return confirmService.confirm(); 
  }
  return true;
};
