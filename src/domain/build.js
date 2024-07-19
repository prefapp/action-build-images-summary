class Build {
  #build_args
  #flavor
  #image_repo
  #image_tag
  #image_type
  #registry
  #repository
  #version
  #workflow_run_id
  #workflow_run_url

  constructor(args = {}) {
    for (key of ['#flavor', '#image_type', '#registry', '#repository']) {
      if (!args[key]) {
        throw `Build needs a ${key} arg`
      }
    }

    this.#build_args = this.#build_args
    this.#flavor = this.#flavor
    this.#image_repo = this.#image_repo
    this.#image_tag = this.#image_tag
    this.#image_type = this.#image_type
    this.#registry = this.#registry
    this.#repository = this.#repository
    this.#version = this.#version
    this.#workflow_run_id = this.#workflow_run_id
    this.#workflow_run_url = this.#workflow_run_url
  }

  get id() {
    return `${this.#flavor}-${this.#image_type}-${this.#registry}-${this.#repository}`
  }
}

module.exports = {
  Build
}
