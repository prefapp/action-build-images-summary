```yaml
- build_args:
    BACKEND_URL: https://example.com
  flavor: my-flavour-1
  image_repo: my-org/my-repo
  image_tag: v1.1.0-pre
  image_type: snapshots
  manifest: {}
  registries: my-acr.azurecr.io
  repository: service/my-org/my-repo
  version: v1.1.0-pre
- build_args:
    BACKEND_URL: https://example.com
  flavor: my-flavour-4
  image_repo: my-org/my-repo
  image_tag: v1.1.0-pre
  image_type: snapshots
  manifest: {}
  registries: my-acr.azurecr.io
  repository: service/my-org/my-repo
  version: v1.1.0-pre
```