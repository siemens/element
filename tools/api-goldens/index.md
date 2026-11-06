# API Goldens

Runs [API Extractor](https://api-extractor.com/) once per entry point against built libraries.

- `--test`: validate goldens.
- `--accept`: update goldens.
- `--doc-model`: generate documentation models, optionally alongside `--test` or `--accept`.
- `--packages element-ng:native-charts-ng`: limit packages.

At least one operation is required. `--test` and `--accept` cannot be combined.

Models are written to `dist/api-docs/<package>/<subpath>/index.api.json`. They retain internal
Angular metadata that is excluded from public reports. Both outputs share one extraction.

## License

The source code in this folder is based on [dev-infra-private-build-tooling-builds](https://github.com/angular/dev-infra-private-build-tooling-builds/tree/main/bazel/api-golden).
We changed and adapted the code to our needs. 
At that point in time it was under _MIT License_ and _Copyright Google LLC_.
