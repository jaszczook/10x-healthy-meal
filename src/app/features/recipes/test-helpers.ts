import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

export function findElement<T>(
  fixture: ComponentFixture<T>,
  testId: string
): DebugElement {
  return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
}

export function findElements<T>(
  fixture: ComponentFixture<T>,
  testId: string
): DebugElement[] {
  return fixture.debugElement.queryAll(By.css(`[data-testid="${testId}"]`));
}

export function click<T>(fixture: ComponentFixture<T>, testId: string): void {
  const element = findElement(fixture, testId);
  element.triggerEventHandler('click', null);
  fixture.detectChanges();
}

export function setInputValue<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  value: string
): void {
  const element = findElement(fixture, testId);
  element.nativeElement.value = value;
  element.triggerEventHandler('input', { target: element.nativeElement });
  fixture.detectChanges();
}

export function expectText<T>(
  fixture: ComponentFixture<T>,
  testId: string,
  text: string
): void {
  const element = findElement(fixture, testId);
  const actualText = element.nativeElement.textContent;
  expect(actualText).toContain(text);
}

export function expectElement<T>(
  fixture: ComponentFixture<T>,
  testId: string
): void {
  const element = findElement(fixture, testId);
  expect(element).toBeTruthy();
}

export function expectElementNotToExist<T>(
  fixture: ComponentFixture<T>,
  testId: string
): void {
  const element = findElement(fixture, testId);
  expect(element).toBeFalsy();
} 