import { HomeComponent } from './Home.component';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('HomeComponent', () => {
  it('creates', () => {
    expect(new HomeComponent()).toBeTruthy();
  });

  it('renders a synthetic preview and retained logos without any HTTP requests', async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent], imports: [RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('h1')?.textContent).toContain('OTR Project');
    expect(page.textContent).toContain('Synthetic examples only');
    expect(page.textContent).toContain('Reza Salek');
    expect(page.querySelectorAll('.partner-logos img').length).toBe(3);
    for (const logo of Array.from(page.querySelectorAll('img'))) {
      expect(logo.getAttribute('alt')?.length).toBeGreaterThan(0);
    }
    expect(page.querySelector('a[href="/register"]')).toBeTruthy();
    expect(page.querySelector('a[href="/login"]')).toBeTruthy();
    TestBed.inject(HttpTestingController).expectNone(() => true);
    TestBed.inject(HttpTestingController).verify();
  });
});
