import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-password-reset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule, RouterModule],
  templateUrl: './password-reset-form.component.html',
  styleUrls: ['./password-reset-form.component.scss']
})
export class PasswordResetFormComponent {
  @Output() requestReset = new EventEmitter<{ email: string }>();
  @Output() updatePassword = new EventEmitter<{ password: string }>();

  requestForm: FormGroup;
  resetForm: FormGroup;
  isResetMode = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });

    const token = this.route.snapshot.queryParamMap.get('token');
    this.isResetMode = !!token;
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  onRequestSubmit(): void {
    if (this.requestForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.requestReset.emit(this.requestForm.value);
    this.snackBar.open('Password reset link sent. Check your email.', 'Close', { duration: 5000 });
    setTimeout(() => this.isSubmitting = false, 500);
  }

  onResetSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.updatePassword.emit({ password: this.resetForm.get('password')?.value });
    this.snackBar.open('Password updated successfully.', 'Close', { duration: 5000 });
    setTimeout(() => this.isSubmitting = false, 500);
  }
} 