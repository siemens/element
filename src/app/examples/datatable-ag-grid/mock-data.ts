/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { delay, Observable, of } from 'rxjs';

export type CarDefinition = {
  id: number;
  make: string;
  model: string;
  price: number;
  electric: boolean;
  dateOfManufacture: string;
};

export const sampleRowData = [
  {
    id: 1,
    make: 'Tesla',
    model: 'Model Y',
    price: 64950,
    electric: true,
    dateOfManufacture: '2023-01-01'
  },
  {
    id: 2,
    make: 'Ford',
    model: 'F-Series',
    price: 33850,
    electric: false,
    dateOfManufacture: '2022-01-01'
  },
  {
    id: 3,
    make: 'Toyota',
    model: 'Corolla',
    price: 29600,
    electric: false,
    dateOfManufacture: '2024-01-01'
  },
  {
    id: 4,
    make: 'Chevrolet',
    model: 'Silverado',
    price: 28900,
    electric: false,
    dateOfManufacture: '2025-01-01'
  },
  {
    id: 5,
    make: 'Honda',
    model: 'Civic',
    price: 22750,
    electric: false,
    dateOfManufacture: '2021-01-01'
  },
  {
    id: 6,
    make: 'Nissan',
    model: 'Leaf',
    price: 27400,
    electric: true,
    dateOfManufacture: '2020-01-01'
  },
  {
    id: 7,
    make: 'BMW',
    model: 'i3',
    price: 44450,
    electric: true,
    dateOfManufacture: '2021-01-01'
  },
  {
    id: 8,
    make: 'Hyundai',
    model: 'Kona Electric',
    price: 34900,
    electric: true,
    dateOfManufacture: '2023-01-01'
  },
  {
    id: 9,
    make: 'Volkswagen',
    model: 'ID.4',
    price: 39900,
    electric: true,
    dateOfManufacture: '2022-01-01'
  },
  {
    id: 10,
    make: 'Audi',
    model: 'e-tron',
    price: 65900,
    electric: true,
    dateOfManufacture: '2024-01-01'
  },
  {
    id: 11,
    make: 'Mercedes-Benz',
    model: 'EQC',
    price: 69900,
    electric: true,
    dateOfManufacture: '2023-01-01'
  },
  {
    id: 12,
    make: 'Porsche',
    model: 'Taycan',
    price: 103800,
    electric: true,
    dateOfManufacture: '2025-01-01'
  },
  {
    id: 13,
    make: 'Rivian',
    model: 'R1T',
    price: 67900,
    electric: true,
    dateOfManufacture: '2025-01-01'
  },
  {
    id: 14,
    make: 'Tesla',
    model: 'Model X',
    price: 62950,
    electric: true,
    dateOfManufacture: '2023-01-01'
  },
  {
    id: 15,
    make: 'Tesla',
    model: 'Cybertruck',
    price: 120000,
    electric: true,
    dateOfManufacture: '2025-01-01'
  }
];

export const getSampleServerData = (): Observable<CarDefinition[]> => {
  const isWebDriver = navigator.webdriver ? 0 : 3000;
  return of(sampleRowData).pipe(delay(isWebDriver * Math.random()));
};
