# Zoneless Support

Starting from Angular v21, Angular introduces zoneless mode, which allows applications to run without Zone.js. This change detection strategy improves performance by reducing the overhead of Zone.js and can lead to smaller bundle sizes.

## Library Compatibility

Element is fully compatible with zoneless mode. All components and directives are designed to work seamlessly in zoneless environments without requiring Zone.js for change detection.

## Manual Change Detection in Zoneless Mode

When using zoneless mode, Angular does not automatically trigger change detection on asynchronous operations. In certain use cases, you may need to manually call `markForCheck()` on the `ChangeDetectorRef` to ensure that the view is updated when data changes occur outside of Angular's typical change detection cycle.

### Common Scenarios Requiring markForCheck()

- Performing mutations on objects (e.g., changing properties of an object) without using signals will no longer update library component inputs automatically. In such cases, you must call `markForCheck()` to trigger change detection.

To use `markForCheck()`, inject `ChangeDetectorRef` into your component and call it when necessary:

```typescript
import { ChangeDetectorRef, inject } from '@angular/core';

private cdr = inject(ChangeDetectorRef);

someAsyncOperation() {
  // Perform operation
  this.someProperty = newValue;
  this.cdr.markForCheck(); // Trigger change detection
}
```

By following these guidelines, you can ensure that Element components works correctly in your zoneless
application.
