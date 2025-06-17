/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiPhotoUploadComponent } from './si-photo-upload.component';

const redPng = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAj4AAAKOCAIAAAApmoSOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHYcAAB2HAY/l8WUAAAlhSURBVHhe7dVBCQAwDACxCemz/p3Vw3QcBOIh72YBIERdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQIy6AIhRFwAx6gIgRl0AxKgLgBh1ARCjLgBi1AVAjLoAiFEXADHqAiBGXQDEqAuAGHUBEKMuAGLUBUCMugCIURcAMeoCIEZdAMSoC4AYdQEQoy4AYtQFQMrsB0SbjJl5mZYbAAAAAElFTkSuQmCC`;
const redCropped = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM8AAADOCAYAAACZ3Vb6AAAAAXNSR0IArs4c6QAABIdJREFUeF7t07ENwDAMBDF7D5fZf7PMkADeQFdT/TeEbr/n+ZYjQGAssMUzNjMgcAXE4xEIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZERCPHyAQBcQT4cwIiMcPEIgC4olwZgTE4wcIRAHxRDgzAuLxAwSigHginBkB8fgBAlFAPBHOjIB4/ACBKCCeCGdGQDx+gEAUEE+EMyMgHj9AIAqIJ8KZEfgB2mLARou5DyEAAAAASUVORK5CYII=`;

describe(`SiPhotoUploadComponent`, () => {
  let component: SiPhotoUploadComponent;
  let componentRef: ComponentRef<SiPhotoUploadComponent>;
  let fixture: ComponentFixture<SiPhotoUploadComponent>;
  let callback: (e: any) => void;

  const mockFileReader = (data: string): jasmine.Spy => {
    const readerSpy = jasmine.createSpyObj(
      'FileReader',
      {
        addEventListener: jasmine.createSpy('addEventListener'),
        readAsDataURL: jasmine.createSpy('readAsDataURL')
      },
      {
        result: data
      }
    );
    readerSpy.addEventListener.and.callFake(
      (event: string, cb: (e: any) => void) => (callback = cb)
    );
    readerSpy.readAsDataURL.and.callFake(() => callback(data));

    spyOn(window, 'FileReader').and.returnValue(readerSpy);
    return readerSpy;
  };

  const generateImage = (): File => {
    const dataURLtoFile = (dataurl: string, filename: string): File => {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    };
    return dataURLtoFile(redPng, 'image.png');
  };

  const getButton = (parent: HTMLElement, text: string): HTMLButtonElement =>
    Array.from(parent.querySelectorAll(`button`)).filter(e => e.innerHTML.trim().includes(text))[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiPhotoUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SiPhotoUploadComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should display placeholder', () => {
    componentRef.setInput('placeholderAltText', 'MX');
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('.photo-upload-placeholder')).nativeElement.textContent
    ).toContain('MX');
  });

  it('should have an upload button in edit mode', () => {
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons).toHaveSize(1);
    expect(buttons[0].nativeElement.innerHTML.trim()).toEqual('Upload photo');
  });

  it('should not have an upload button in readonly mode', () => {
    componentRef.setInput('readonly', true);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('button'))).toHaveSize(0);
  });

  it('should show photo in readonly mode', () => {
    componentRef.setInput('readonly', true);
    componentRef.setInput('sourcePhoto', redCropped);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('img'))!.attributes.src).toBeTruthy();
  });

  it('should have two buttons if a photo is applied in edit mode', () => {
    componentRef.setInput('sourcePhoto', redCropped);
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons).toHaveSize(2);

    expect(buttons[0].nativeElement.innerHTML.trim()).toEqual('Change');
    expect(buttons[1].nativeElement.innerHTML.trim()).toEqual('Remove');
  });

  it('should remove photo if remove button is clicked', async () => {
    componentRef.setInput('sourcePhoto', redCropped);

    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons).toHaveSize(2);
    expect(buttons[1].nativeElement.innerHTML.trim()).toEqual('Remove');
    buttons[1].nativeElement.click();

    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.croppedPhoto()).toBeUndefined();
    expect(fixture.debugElement.queryAll(By.css('button'))).toHaveSize(1);
    expect(fixture.debugElement.query(By.css('img'))).toBeFalsy();
  });

  it('should show image in crop modal', async () => {
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input[type="file"]'));
    spyOn(input.nativeElement, 'click').and.callFake(() => {
      input.triggerEventHandler('change', {
        target: {
          files: [generateImage()]
        }
      });
    });
    mockFileReader(redPng);

    fixture.debugElement.query(By.css('button'))!.nativeElement.click();

    fixture.detectChanges();
    await fixture.whenStable();

    const modal = document.querySelector('si-modal');
    expect(modal).toBeTruthy();
    expect(modal?.querySelector('img')).toBeTruthy();
  });

  it('should apply photo', async () => {
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input[type="file"]'));
    spyOn(input.nativeElement, 'click').and.callFake(() => {
      input.triggerEventHandler('change', {
        target: {
          files: [generateImage()]
        }
      });
    });
    mockFileReader(redPng);

    fixture.debugElement.query(By.css('button'))!.nativeElement.click();

    fixture.detectChanges();
    await fixture.whenStable();

    getButton(document.querySelector('si-modal')!, 'Apply').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('img'))!.attributes.src).toBeTruthy();
  });

  it('should apply photo without modal when disabledCropping = true', async () => {
    componentRef.setInput('disabledCropping', true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input[type="file"]'));
    spyOn(input.nativeElement, 'click').and.callFake(() => {
      input.triggerEventHandler('change', {
        target: {
          files: [generateImage()]
        }
      });
    });
    mockFileReader(redPng);

    fixture.debugElement.query(By.css('button'))!.nativeElement.click();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('img'))!.attributes.src).toBeTruthy();
  });

  it('should show an error if a file is to big and remove it on photo change again', async () => {
    fixture.detectChanges();
    componentRef.setInput('maxFileSize', 2);

    const input = fixture.debugElement.query(By.css('input[type="file"]'));
    spyOn(input.nativeElement, 'click').and.callFake(() => {
      input.triggerEventHandler('change', {
        target: {
          files: [generateImage()]
        }
      });
    });
    fixture.debugElement.query(By.css('button'))!.nativeElement.click();

    fixture.detectChanges();
    await fixture.whenStable();

    let errorMessage = fixture.debugElement.query(By.css('span.text-danger'))!;
    expect(errorMessage.nativeElement.innerHTML.trim()).toEqual(
      'The actual file size 0.002 MB exceeds the 0.001953125 MB limit.'
    );

    componentRef.setInput('maxFileSize', 2048);
    componentRef.setInput('sourcePhoto', redPng);
    fixture.detectChanges();

    errorMessage = fixture.debugElement.query(By.css('span.text-danger'));
    expect(errorMessage).toBeNull();
  });

  it('should show an error if the mime type is not allowed', async () => {
    componentRef.setInput('acceptedUploadFormats', '.svg, .bmp');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input[type="file"]'));
    spyOn(input.nativeElement, 'click').and.callFake(() => {
      input.triggerEventHandler('change', {
        target: {
          files: [generateImage()]
        }
      });
    });
    fixture.debugElement.query(By.css('button'))!.nativeElement.click();

    fixture.detectChanges();
    await fixture.whenStable();

    const errorMessage = fixture.debugElement.query(By.css('span.text-danger'))!;
    expect(errorMessage.nativeElement.innerHTML.trim()).toEqual(
      'The image file is not valid. Please upload a PNG or JP(E)G.'
    );
  });
});
