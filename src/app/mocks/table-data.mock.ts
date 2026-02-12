/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

/**
 * Table data interface representing a corporate employee
 */
export interface TableData {
  id: number;
  name: string;
  role: string;
  company: string;
  age?: number;
  dateOfJoining?: Date;
}

/**
 * Service class for managing table data
 */
@Injectable({ providedIn: 'root' })
export class TableDataService {
  private readonly roles = ['Engineer', 'Installer', 'Manager', 'Designer', 'Analyst'];

  private generateRow(index: number): TableData {
    return {
      id: index,
      name: 'Max Meier ' + index,
      role: this.getRole(index),
      company: this.getCompany(index),
      age: this.getAge(index),
      dateOfJoining: this.getDateOfJoining(index)
    };
  }

  private getRole(index: number): string {
    return this.roles[index % this.roles.length];
  }

  private getCompany(index: number): string {
    return 'Great Company ' + (index % 5);
  }

  private getAge(index: number): number {
    // Generate realistic ages for corporate employees (22-65 years)
    return 22 + (index % 44);
  }

  private getDateOfJoining(index: number): Date {
    const daysAgo = (index * 37) % (365 * 10); // Spread dates across 10 years
    const joiningDate = new Date('2026-01-05');
    joiningDate.setDate(joiningDate.getDate() - daysAgo);
    return joiningDate;
  }

  /**
   * Generate multiple rows of table data
   */
  public generateRows(numberOfRows: number): TableData[] {
    return Array.from({ length: numberOfRows }, (_, index) => this.generateRow(index));
  }

  /**
   * Get multiple rows with optional delay for simulating async data fetching
   */
  public getRows(numberOfRows: number): Observable<TableData[]> {
    return of(this.generateRows(numberOfRows)).pipe(
      delay(this.optionalDelay(3000 * Math.random()))
    );
  }

  private optionalDelay(ms: number): number {
    return navigator.webdriver ? 0 : ms;
  }
}
