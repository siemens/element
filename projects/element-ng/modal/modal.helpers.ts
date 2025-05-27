/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ModalOptions } from './si-modal.service';

let idCounter = 1;

export const createModalConfig = (inputs?: { [key: string]: any }): ModalOptions => {
  if (inputs) {
    Object.keys(inputs).forEach(k => inputs![k] === undefined && delete inputs![k]);
  } else {
    inputs = {};
  }
  const config: ModalOptions<any> = {
    inputValues: inputs as { [key: string]: any },
    ignoreBackdropClick: true,
    keyboard: false,
    animated: true,
    class: 'modal-dialog-centered'
  };
  const id = `__si-modal-id-${idCounter++}`;
  config.inputValues!.titleId = id;
  config.ariaLabelledBy = id;
  return config;
};
