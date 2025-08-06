# About

[//]: # (This (including the ":") is needed for search because "about" is a stopword.)
<!-- markdownlint-disable MD033-->
<h2 style="display: none">About:</h2>
<!-- markdownlint-emable MD033-->

The About Page provides detailed information about the product.

## Usage ---

The About Page is a part of an overarching concept to fulfil legal guidelines
beside of providing additional information about the product (e.g. version).

## Code ---

The component has 3 modes which can be selected using the `licenseInfo`
parameter.

- [`api`](#license-via-api) (preferred): License texts are lazy loaded
  separately for each component. Requires a service to provide license data.
  With the parameter `licenseInfo.icon` you can set a custom license file icon.
- [`text`](#license-text): Plain text input to dump all license texts
- [`iframe`](#license-iframe) (avoid): Embedded page to display the licenses
  from another source.

### Usage

```ts
import { SiAboutComponent } from '@spike-rabbit/element-ng/about';

@Component({
  imports: [SiAboutComponent,...]
})
```

Please use the appropriate input properties for the legal artifact links like
`Corporate Information` or `Acceptable Use Policy`. This ensures the same order
in all applications.

### License via API

The API variant allows fast and neat navigation through the different license
files. By clicking on the subsystems and components, the license details are
loaded lazily via API and revealed when loaded.

Just set the `licenseInfo.api` parameter to the API endpoint which provides the
license data.

<si-docs-component example="si-about/si-about-api" height="500"></si-docs-component>

#### License data format

The JSON based API supported by the about dialog is
structured into three levels of endpoints:

1. **Endpoint:** `/api/licenses/`
    - **MIME Type**: `application/json`
    - **Description**: Top-level index listing all subsystems
    - **Result**:
      ```json
      [
          { "name": "OS", "href": "/api/licenses/os/"},
          { "name": "Dummy", "href": "/api/licenses/Dummy/"}
      ]
      ```

2. **Endpoint:** `/api/licenses/<subsystem>`
    - **MIME Type**: `application/json`
    - **Description**: Subsystem-level index listing all components
    - **Result**:
      ```json
      [
          { "name": "boost 1.66", "href": "/api/licenses/os/boost_1.66.copyright"}
      ]
      ```

3. **Endpoint:** `/api/licenses/<subsystem>/<component>`
    - **MIME Type**: `text/plain`
    - **Description**: Literal content of the component’s copyright or acknowledgement file
    - **Result**:
      ```text
      Boost copyright text
      ```

### License Text

Use the `licenseInfo.text` parameter to display the provided license text as
plain text.

<si-docs-component example="si-about/si-about-text" height="500"></si-docs-component>

### License Introduction Text and API

If your application requires showing a disclaimer in addition to the component 
licenses provided via API, you can combine the parameters `licenseInfo.text` and `licenseInfo.api`.

<si-docs-component example="si-about/si-about-text-api" height="500"></si-docs-component>

### License Iframe

You can also use a URL in the `licenseInfo.iframe` parameter to show an embedded
page containing license information.

<si-docs-component example="si-about/si-about-iframe" height="500"></si-docs-component>

<si-docs-api component="SiAboutComponent"></si-docs-api>

<si-docs-types></si-docs-types>
