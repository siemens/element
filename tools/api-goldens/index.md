# API Goldens

This directory contains the script needed to generate and verify API goldens for the Element library.
This script is using [API Extractor](https://api-extractor.com/) internally.
Since the API Extractor is currently not supporting multiple entrypoints, it is called separately for each entrypoint.

The script patches the API Extractor to flag all protected members as `internal`.
This excludes them from the public API report.

See the [Developer Guide](../../DEVELOPER.md) for usage instructions.


## License

The source code in this folder is based on [dev-infra-private-build-tooling-builds](https://github.com/angular/dev-infra-private-build-tooling-builds/tree/main/bazel/api-golden).
We changed and adapted the code to our needs. 
At that point in time it was under _MIT License_ and _Copyright Google LLC_.
