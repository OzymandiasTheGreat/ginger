import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserGridComponent } from '@src/app/core/components/browser-grid/browser-grid.component';

describe('BrowserGridComponent', () => {
  let component: BrowserGridComponent;
  let fixture: ComponentFixture<BrowserGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowserGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
