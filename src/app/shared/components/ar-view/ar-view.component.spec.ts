import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ArViewComponent } from './ar-view.component';

class MockTargetsService {
  subject = new BehaviorSubject<any>({
    id: 1,
    name: 'Hiro',
    type: 'preset',
    pattern: 'hiro',
    modelUrl: '',
    scale: '1 1 1'
  });
  getActiveTarget() { return this.subject.asObservable(); }
}

describe('ArViewComponent', () => {
  let fixture: ComponentFixture<ArViewComponent>;
  let component: ArViewComponent;
  let service: MockTargetsService;

  beforeEach(async () => {
    service = new MockTargetsService();
    await TestBed.configureTestingModule({
      declarations: [ArViewComponent],
      providers: [{ provide: (ArViewComponent as any).ɵprov.token, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(ArViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería configurar marker con preset hiro', (done) => {
    setTimeout(() => {
      const marker: any = document.querySelector('#dynamic-marker');
      expect(marker).toBeTruthy();
      expect(marker.getAttribute('preset')).toBe('hiro');
      done();
    }, 0);
  });

  it('debería configurar marker con pattern URL y modelo gltf', (done) => {
    const target = {
      id: 2,
      name: 'Logo',
      type: 'pattern',
      pattern: 'https://example.com/logo.patt',
      modelUrl: 'https://example.com/model.glb',
      scale: '0.5 0.5 0.5'
    };
    service.subject.next(target);
    setTimeout(() => {
      const marker: any = document.querySelector('#dynamic-marker');
      const model: any = document.querySelector('#model-container');
      expect(marker.getAttribute('type')).toBe('pattern');
      expect(marker.getAttribute('url')).toBe(target.pattern);
      expect(model.getAttribute('gltf-model')).toBe(target.modelUrl);
      expect(model.getAttribute('scale')).toBe(target.scale);
      done();
    }, 0);
  });
});
