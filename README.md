# opentutor-dialog

## Usage

microservice for managing a dialog in the opentutor app

## Running Tests

```
make test
```

## Development

# Required Software

- node 14 + npm
- make

Any changes made to this repo should be covered by tests. To run the existing tests:

```bash
make test
```

All pushed commits must also pass format and lint checks. To check all required tests before a commit:

```bash
make test-all
```

To fix formatting issues:

```bash
make format
```

To run the server locally:

```bash
make run
```

## Releasing Docker Images

Currently, this image is semantically versioned. When making changes that you want to test in another project, create a branch and PR and then you can release a test tag one of two ways:

To build/push a pre-release semver tag of `opentutor-dialog` for the current commit in your branch

- create a [github release](https://github.com/ICTLearningSciences/opentutor-dialog/releases/new) **from your development branch** with tag format `/^\d+\.\d+\.\d+(-[a-z\d\-.]+)?$/` (e.g. `1.0.0-alpha.1`)
- this trigger a github actions workflow that should build and push a docker image with the same tag as the git tag, e.g. `opentutor/opentutor-dialog:1.0.0-alpha.1`
- You can monitor your workflow in [github actions](https://github.com/ICTLearningSciences/opentutor-dialog/actions?query=workflow%3A%22build%2Fpub+candidate%22)

Once your changes are approved and merged to main, you should create a release tag in semver format as follows:

- create a [github release](https://github.com/ICTLearningSciences/opentutor-dialog/releases/new) **from main** with tag format `/^\d+\.\d+\.\d$/` (e.g. `1.0.0`)
- this trigger a github actions workflow that should build and push a docker image with the same tag as the git tag, e.g. `opentutor/opentutor-dialog:1.0.0`
- You can monitor your workflow in [github actions](https://github.com/ICTLearningSciences/opentutor-dialog/actions?query=workflow%3A%22build%2Fpub+release%22)
