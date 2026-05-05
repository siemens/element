/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 *
 * Framework-agnostic native web component widgets for use in SiFlexibleDashboard.
 * Demonstrates that dashboard widgets can be implemented without any framework dependency.
 * No Shadow DOM — reuses CSS classes from the parent Angular application.
 */

interface WidgetConfig {
  id?: string;
  heading?: string;
  payload?: Record<string, unknown>;
}

// --- Native Note Widget ---

class NativeNoteWidget extends HTMLElement {
  private _config: WidgetConfig = {};
  private _editable = false;
  private messageEl!: HTMLParagraphElement;
  private editHintEl!: HTMLParagraphElement;

  get config(): WidgetConfig {
    return this._config;
  }

  set config(value: WidgetConfig) {
    this._config = value ?? {};
    this.render();
  }

  get editable(): boolean {
    return this._editable;
  }

  set editable(value: boolean) {
    this._editable = value;
    if (this.editHintEl) {
      this.editHintEl.hidden = !value;
    }
  }

  private render(): void {
    if (!this.messageEl) {
      return;
    }
    const message = (this.config?.payload?.message as string) ?? '';
    this.messageEl.textContent = message;
  }

  connectedCallback(): void {
    this.innerHTML = `
      <p class="message"></p>
      <p class="edit-hint" hidden>Click edit to configure this native web-component widget.</p>
    `;
    this.messageEl = this.querySelector('.message')!;
    this.editHintEl = this.querySelector('.edit-hint')!;
    this.editHintEl.hidden = !this._editable;
    this.render();
    this.dispatchEvent(
      new CustomEvent('configChange', {
        detail: {
          primaryActions: [
            {
              type: 'action',
              label: 'User',
              icon: 'element-user',
              action: () => alert('Custom primary action')
            }
          ],
          secondaryActions: [
            {
              type: 'action',
              label: 'Greenleaf',
              icon: 'element-greenleaf',
              action: () => alert('Custom secondary action')
            }
          ],
          primaryEditActions: [
            {
              type: 'action',
              label: 'Custom Action',
              icon: 'element-airquality-good',
              action: () => alert('Widget specific edit action')
            }
          ],
          secondaryEditActions: [
            {
              type: 'action',
              label: 'Light',
              icon: 'element-light-ceiling',
              action: () => alert('Widget specific secondary edit action')
            }
          ]
        }
      })
    );
  }
}

// --- Native Note Widget Editor ---

class NativeNoteWidgetEditor extends HTMLElement {
  private _config: WidgetConfig = {};
  private headingInput!: HTMLInputElement;
  private messageInput!: HTMLInputElement;

  get config(): WidgetConfig {
    return this._config;
  }

  set config(value: WidgetConfig) {
    this._config = value ?? {};
    this.render();
  }

  private render(): void {
    if (!this.headingInput) {
      return;
    }
    this.headingInput.value = this.config?.heading ?? '';
    this.messageInput.value = (this.config?.payload?.message as string) ?? '';
  }

  private onChange(): void {
    const heading = this.headingInput.value;
    const message = this.messageInput.value;

    this._config.heading = heading;
    this._config.payload ??= {};
    this._config.payload.message = message;

    this.dispatchEvent(new CustomEvent('configChange', { detail: this._config }));
    this.dispatchEvent(
      new CustomEvent('statusChanges', {
        detail: { invalid: heading.trim().length === 0, modified: true }
      })
    );
  }

  connectedCallback(): void {
    this.innerHTML = `
      <div class="mb-6">
        <label for="native-heading" class="form-label">Title</label>
        <input type="text" class="form-control" id="native-heading" />
      </div>
      <div class="mb-6">
        <label for="native-message" class="form-label">Message</label>
        <input type="text" class="form-control" id="native-message" />
      </div>
    `;
    this.headingInput = this.querySelector('#native-heading')!;
    this.messageInput = this.querySelector('#native-message')!;
    this.headingInput.addEventListener('input', () => this.onChange());
    this.messageInput.addEventListener('input', () => this.onChange());
    this.render();
  }
}

customElements.define('native-note-widget', NativeNoteWidget);
customElements.define('native-note-widget-editor', NativeNoteWidgetEditor);
