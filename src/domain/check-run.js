/**
 * This class is used to represent a check run, and it's part of the domain layer.
 * This a core class that is used to manage the check runs in the application,
 * and it is agnostic of the infrastructure layer. This means that it does not depend on
 * any external libraries or frameworks.
 *
 * It is responsible for get the summary of the check run, and merge the builds from the last summary.
 */

const { Build } = require('./build')

class CheckRun {
  #lastSummary
  #newSummary
  #name
  #textHelper

  constructor({ lastSummary, newSummary, name, textHelper }) {
    this.#lastSummary = lastSummary
    this.#newSummary = newSummary
    this.#name = name
    this.#textHelper = textHelper
  }

  get name() {
    return this.#name
  }

  /**
   * This method is used to get the summary of the check run
   * The summary is a string that contains the builds in yaml format.
   * @returns {string} The summary with the builds in yaml format,
   * merged from the last summary and the new summary.
   */
  get summary() {
    if (!this.#lastSummary || this.#lastSummary === 'Pending...')
      return this.#dumpFinalSummary(this.#newSummary)

    const lastBuilds = this.#extractBuildsFromLastSummary(this.#lastSummary)

    const newBuilds = this.#parseNewBuildsFromNewSummary(this.#newSummary)

    const mergedBuilds = this.#mergeBuilds(lastBuilds, newBuilds)

    return this.#dumpFinalSummary(mergedBuilds)
  }

  /**
   * This method is used to get the last summary of the check run
   */
  get lastSummary() {
    return this.#extractYamlCodeFromMarkdown(this.#lastSummary)
  }

  /**
   * This method is used to merge the builds from the last summary with the new builds
   * The comparison is based on the flavor and registries of the builds.
   * @returns {Array} The merged builds
   *
   * Example:
   *
   * Input:
   * lastBuilds = [
   * {
   *  flavor: my-flavor
   *  image_type: snapshots
   * }
   * ]
   *
   * newBuilds = [
   * {
   * flavor: my-flavor-2
   * image_type: snapshots
   * }
   * ]
   *
   * Output:
   * mergedBuilds = [
   * {
   * flavor: my-flavor-2
   * image_type: snapshots
   * },
   * {
   * flavor: my-flavor
   * image_type: snapshots
   * }
   * ]
   */
  #mergeBuilds(lastBuilds, newBuilds) {
    const lastBuildsMap = {}
    const newBuildsMap = {}

    lastBuilds.map(build => {
      const buildObj = new Build(build)

      console.dir(buildObj.asMap())

      lastBuildsMap[buildObj.id] = buildObj
    })

    newBuilds.map(build => {
      const buildObj = new Build(build)

      newBuildsMap[buildObj.id] = buildObj
    })

    const finalMap = Object.values({
      ...lastBuildsMap,

      ...newBuildsMap
    }).map(build => build.asMap())

    return this.#textHelper.dumpYaml(finalMap)
  }

  /**
   * This method is used to check if a build from the last summary is in the new builds
   * The comparison is based on the flavor and registries of the builds.
   * @returns {object | undefined} The new build that matches the last build, or undefined if no match is found
   */
  #lastBuildIsContainedInNewBuilds(lastBuild, newBuilds) {
    return newBuilds.find(
      newBuild =>
        newBuild.flavor + newBuild.image_type ===
        lastBuild.flavor + lastBuild.image_type
    )
  }

  /**
   * This method is used to get the builds from the summary
   * The summary is a string that contains the builds in yaml format.
   * @returns {Array} The builds extracted from the summary
   */
  #extractBuildsFromLastSummary(summary) {
    try {
      const yamlText = this.#extractYamlCodeFromMarkdown(summary)

      return this.#textHelper.parseYaml(yamlText)
    } catch (error) {
      console.error(error)

      throw new Error('Error getting builds from summary.')
    }
  }

  /**
   * This method is used to get the builds from the summary
   * The summary is a string that contains the builds in yaml format.
   * @returns {Array} The builds extracted from the summary
   */
  #parseNewBuildsFromNewSummary() {
    try {
      return this.#textHelper.parseYaml(this.#newSummary)
    } catch (error) {
      console.error(error)

      throw new Error('Error getting builds from new summary.')
    }
  }

  /**
   * This method is used to get the builds from the summary
   * The summary is a string that contains the builds in yaml format,
   * but it is contained within a code block, in a markdown format.
   * Example:
   * ```yaml
   * - build_args:
          BACK_URL: https://example.com
      flavor: my-flavor
      image_repo: my-org/my-repo
      image_tag: v1.1.0-pre
      image_type: snapshots
      manifest: {}
      registries: my-acr.azurecr.io
      repository: service/my-org/my-repo
      version: v1.1.0-pre
    * ```
    * @returns {string} The yaml code block extracted from the markdown summary 
    */
  #extractYamlCodeFromMarkdown(text) {
    console.info(`Extracting yaml code from markdown summary`)
    console.info(text)
    const yamlDelimiter = '```yaml'

    const codeDelimiter = '```'

    const yamlStartIndex = text.indexOf(yamlDelimiter)

    if (yamlStartIndex === -1)
      throw new Error(`No YAML code block ${yamlDelimiter} found in summary`)

    const yamlEndIndex = text.indexOf(
      codeDelimiter,
      yamlStartIndex + yamlDelimiter.length
    )

    if (yamlEndIndex === -1)
      throw new Error(`No code block end ${codeDelimiter} found in summary`)

    const yamlCode = text.slice(
      yamlStartIndex + yamlDelimiter.length,
      yamlEndIndex
    )

    return yamlCode.trim()
  }

  /**
   * This method is used to dump the final summary
   * The summary is a string that contains the builds in yaml format.
   * @returns {string} The final summary with the builds in yaml format,
   * contained within a code block, in a markdown format.
   */
  #dumpFinalSummary(buildsYaml) {
    try {
      const yamlDelimiter = '```yaml'

      const endDelimiter = '```'

      return `${yamlDelimiter}\n${buildsYaml}${endDelimiter}\n`
    } catch (error) {
      console.error(error)

      throw new Error('Error dumping final summary.')
    }
  }
}

module.exports = {
  CheckRun
}
