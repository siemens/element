/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-file-uploader', () => {
  const example = 'si-file-uploader/si-file-uploader';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    // so we don't waste time waiting
    await page.getByLabel('No delay').check();

    await si.runVisualAndA11yTests('initial');

    // Create an empty buffer.
    const buffer = Buffer.from('');

    // Create the DataTransfer and File
    const dataTransfer = await page.evaluateHandle(data => {
      const dt = new DataTransfer();

      // Loop through all the files.
      [
        'src/assets/images/test-file-for-vrt.txt',
        'src/assets/images/simpl-44x44.png',
        'src/assets/images/simpl-logo.svg',
        'src/assets/images/siemens-healthineers-logo.svg'
      ].forEach(fileName => {
        // Convert the buffer to a hex array
        const file = new File([data.toString('hex')], fileName.split('/').at(-1) ?? fileName, {
          type: fileName.endsWith('png') || fileName.endsWith('svg') ? 'image/*' : 'text/plain'
        });
        dt.items.add(file);
      });
      return dt;
    }, buffer);

    // Now dispatch
    await page.locator('.drag-and-drop').dispatchEvent('drop', { dataTransfer });

    await si.runVisualAndA11yTests('added');

    await page.locator('.btn-primary').getByText('Upload').click();

    await si.runVisualAndA11yTests('uploaded');
  });
});
