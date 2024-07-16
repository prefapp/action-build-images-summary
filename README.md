# Action Build Images Summary Update

[![GitHub Super-Linter](https://github.com/prefapp/action-build-images-summary-update/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/prefapp/action-build-images-summary-update/actions/workflows/ci.yml/badge.svg)

## Usage

This GitHub Action focuses on managing the status of check runs in relation to
the process of building Docker images. The workflow sets a check run to a
pending state, builds Docker images, and then updates the check run status based
on the build outcome. The check run actions are dependent on the image build
action since the latter generates the results file needed to finalize the check
run status.

### Example

```yaml
steps:
  # First, we set the check-run to pending state
  - name: Set Pending Check Run
    id: check-run-pending
    uses: ./
    with:
      status: in_progress
      token: ${{ secrets.GITHUB_TOKEN }}
      summary_path: /tmp/build_images_results.yaml
      check_run_name: ${{ inputs.check_run_name }}
      ref: ${{ inputs.ref }}

  - name: Checkout repository to get config file
    uses: actions/checkout@v4
    with:
      path: config

  - name: Build images
    uses: prefapp/run-dagger-py@main
    id: build-images
    with:
      working_directory: build
      pyproject_path: .dagger
      workflow: build_images
      config_file: ../config/.github/build_images.yaml
      ref: 'feat/upload-results-artifacts'
      vars: |
        repo_name="${{ github.repository }}"
        flavors="${{ inputs.flavors }}"
        auth_strategy="${{ inputs.auth_strategy }}"
        snapshots_registry="${{ vars.DOCKER_REGISTRY_SNAPSHOTS }}"
        releases_registry="${{ vars.DOCKER_REGISTRY_RELEASES }}"
        output_results="build_images_results.yaml"
        type="${{ inputs.type }}"
        from="${{ steps.get-tag.outputs.tag }}"
        login_required="true"
        ref="v1"
        service_path="${{ fromJSON(vars.DOCKER_REGISTRIES_BASE_PATHS).services[inputs.type] }}"
      secrets: ${{ inputs.secrets }}

  # Complete the check with the outcome of the build images step
  - name: Set Outcome Check Run
    id: check-run-outcome
    if: always()
    uses: ./
    with:
      conclusion: ${{ steps.build-images.outcome }}
      token: ${{ secrets.GITHUB_TOKEN }}
      summary_path: '/tmp/build_images_results.yaml'
      check_run_name: ${{ inputs.check_run_name }}
      ref: ${{ inputs.ref }}
```

## Development

### 💻 Setup project on your local machine

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy. If you are using a version manager like
> [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), you can run `nodenv install` in the
> root of your repository to install the version specified in
> [`package.json`](./package.json). Otherwise, 20.x or later should work!

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the JavaScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   $ npm test

   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)

   ...
   ```

### 📐 Architecture

We use a minimal Hexagonal Architecture for best practices and separation of
concerns. When submitting a PR, please: keep core logic isolated, divide the
system into responsible layers, ensure business logic independence, use ports
and adapters, design for testability, utilize dependency injection, follow
coding standards, and write clear, maintainable code. This ensures a clean,
efficient, and scalable codebase.

![image](https://github.com/user-attachments/assets/34bc9fe4-9076-480b-8a31-e98e9df3467e)

You can find the following layers.

- **Domain**: `./src/domain`
  - CheckRun Entity
- **Application**: `./src/application`
  - CheckRunHandler
- **Infrastructure**: `./src/infrastructure`
  - Yaml package
  - Github Cli (octokit, core)
