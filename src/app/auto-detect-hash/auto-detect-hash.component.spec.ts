import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoDetectHashComponent } from './auto-detect-hash.component';

describe('AutoDetectComponent', () => {
  let component: AutoDetectHashComponent;
  let fixture: ComponentFixture<AutoDetectHashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoDetectHashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoDetectHashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
