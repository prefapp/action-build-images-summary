class Build {
  build_args
  flavor
  image_repo
  image_tag
  image_type
  registry
  repository
  version
  workflow_run_id
  workflow_run_url

  constructor(args = {}) {
    for (const key of [
      'flavor',
      'image_type',
      'registry',
      'repository',
      'image_tag'
    ]) {
      if (!args[key]) {
        throw new Error(`Build needs a ${key} arg`)
      }
    }

    this.build_args = args.build_args
    this.flavor = args.flavor
    this.image_repo = args.image_repo
    this.image_tag = args.image_tag
    this.image_type = args.image_type
    this.registry = args.registry
    this.repository = args.repository
    this.version = args.version
    this.workflow_run_id = args.workflow_run_id
    this.workflow_run_url = args.workflow_run_url
  }

  get id() {
    return `${this.flavor}-${this.image_type}-${this.registry}-${this.repository}-${this.image_tag}`
  }

  asMap() {
    const map = {}

    for (const key of [
      'build_args',
      'flavor',
      'image_repo',
      'image_tag',
      'image_type',
      'registry',
      'repository',
      'version',
      'workflow_run_id',
      'workflow_run_url'
    ]) {
      map[key] = this[key]
    }

    return map
  }
}

module.exports = {
  Build
}
