import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoDetectComponent } from './auto-detect.component';

describe('AutoDetectComponent', () => {
  let component: AutoDetectComponent;
  let fixture: ComponentFixture<AutoDetectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoDetectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoDetectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
