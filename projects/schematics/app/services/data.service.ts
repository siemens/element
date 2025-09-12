import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { SiNotificationService } from '@simpl/element-ng/notification';
import { SiDialogService } from '@simpl/element-ng/dialog';
import { SiLoadingService } from '@simpl/element-ng/loading';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataSubject = new BehaviorSubject<any[]>([]);
  public data$ = this.dataSubject.asObservable();

  constructor(
    private notificationService: SiNotificationService,
    private dialogService: SiDialogService,
    private loadingService: SiLoadingService
  ) {}

  async loadData(): Promise<void> {
    this.loadingService.show();
    try {
      // Simulate API call
      const data = await this.mockApiCall();
      this.dataSubject.next(data);
      this.notificationService.success('Data loaded successfully');
    } catch (error) {
      this.notificationService.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      this.loadingService.hide();
    }
  }

  async saveData(data: any): Promise<boolean> {
    const confirmed = await this.dialogService.confirm(
      'Save Data',
      'Are you sure you want to save this data?'
    );

    if (confirmed) {
      this.loadingService.show();
      try {
        await this.mockSaveCall(data);
        this.notificationService.success('Data saved successfully');
        return true;
      } catch (error) {
        this.notificationService.error('Failed to save data');
        return false;
      } finally {
        this.loadingService.hide();
      }
    }
    return false;
  }

  private mockApiCall(): Promise<any[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Item 1', description: 'First item' },
          { id: 2, name: 'Item 2', description: 'Second item' },
          { id: 3, name: 'Item 3', description: 'Third item' }
        ]);
      }, 1000);
    });
  }

  private mockSaveCall(data: any): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }
}
