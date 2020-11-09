# open-tutor-api

## Usage

TODO: fill in

## Running Tests

```
make test
```

## Development

# Required Software

- node 12
- npm
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

To build/push a work-in-progress tag of `opentutor-dialog` for the current commit in your branch

- find the `approve-build-and-push` workflow for your commit in [circleci](https://circleci.com/gh/ICTLearningSciences/workflows/opentutor-dialog)
- approve the workflow
- this will create a tag like `https://hub.docker.com/opentutor-dialog:${COMMIT_SHA}`

To build/push a pre-release semver tag of `opentutor-dialog` for the current commit in your branch

- create a [github release](https://github.com/ICTLearningSciences/opentutor-dialog/releases/new) **from your development branch** with tag format `/^\d+\.\d+\.\d+(-[a-z\d\-.]+)?$/` (e.g. `1.0.0-alpha.1`)
- this trigger a circleci workflow that should build and push a docker image with the same tag as the git tag, e.g. `uscictdocker/opentutor-dialog:1.0.0-alpha.1`
- You can monitor your workflow in [circleci](https://circleci.com/gh/ICTLearningSciences/workflows/opentutor-dialog)

Once your changes are approved and merged to main, you should create a release tag in semver format as follows:

- create a [github release](https://github.com/ICTLearningSciences/opentutor-dialog/releases/new) **from main** with tag format `/^\d+\.\d+\.\d$/` (e.g. `1.0.0`)
- this trigger a circleci workflow that should build and push a docker image with the same tag as the git tag, e.g. `uscictdocker/opentutor-dialog:1.0.0`
- You can monitor your workflow in [circleci](https://circleci.com/gh/ICTLearningSciences/workflows/opentutor-dialog)