# IP Input

## Usage ---

### When to use

- For allowing users to enter IP-Addresses.
- When validation for IP-Addresses are required.

### Best Practices for IP Input

- Ensure the input field is wide enough to accommodate different IP-Address formats.

## Code ---

The directives are an enhanced to the HTML input field specifically for IPv4 and IPv6 addresses.

**Features:**

- Validation - Provide forms input validation
- Input Masking - Improved user experience by enforcing correct formatting
- CIDR Support - Optional support for Classless Inter-Domain Routing (CIDR) notation (like 192.168.0.1/24)

### IPv4 address

```ts
...
import { SiIp4InputDirective } from '@siemens/element-ng/ip-input';

@Component({
  template: `<input type="text" class="form-control" siIpV4 />`,
  imports: [SiIp4InputDirective, ...]
})
```

### IPv6 address

```ts
...
import { SiIp6InputDirective } from '@siemens/element-ng/ip-input';

@Component({
  template: `<input type="text" class="form-control" siIpV6 />`,
  imports: [SiIp6InputDirective, ...]
})
```

<si-docs-component example="si-ip-input/si-ip-input" height="300"></si-docs-component>

<si-docs-api directive="SiIp4InputDirective"></si-docs-api>

<si-docs-api directive="SiIp6InputDirective"></si-docs-api>

<si-docs-types></si-docs-types>
