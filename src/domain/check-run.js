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
   *
   */
  get summary() {
    if (!this.#lastSummary) return this.#newSummary

    const lastBuilds = this.#extractBuildsFromSummary(this.#lastSummary)

    const newBuilds = this.#extractBuildsFromSummary(this.#newSummary)

    const mergedBuilds = this.#mergeBuilds(lastBuilds, newBuilds)

    return this.#dumpFinalSummary(mergedBuilds)
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
   *  registries: my-acr.azurecr.io
   * }
   * ]
   *
   * newBuilds = [
   * {
   * flavor: my-flavor-2
   * registries: my-acr.azurecr.io
   * }
   * ]
   *
   * Output:
   * mergedBuilds = [
   * {
   * flavor: my-flavor-2
   * registries: my-acr.azurecr.io
   * },
   * {
   * flavor: my-flavor
   * registries: my-acr.azurecr.io
   * }
   * ]
   */
  #mergeBuilds(lastBuilds, newBuilds) {
    try {
      console.info(`Merging builds for check run ${this.#name}`)

      const mergedBuilds = []

      // Iterate over lastBuilds and merge with newBuilds
      for (const lastBuild of lastBuilds) {
        // Check if lastBuild is in newBuilds, based on flavor and registries
        const newBuildMatch = this.#lastBuildIsContainedInNewBuilds(
          lastBuild,
          newBuilds
        )

        if (newBuildMatch) {
          console.info(
            `Match found for build ${newBuildMatch.flavor} in check run ${this.#name}, updating build.`
          )

          // Get index of newBuild in newBuilds
          const index = newBuilds.indexOf(newBuildMatch)

          // Remove newBuild from newBuilds and push it to mergedBuilds
          mergedBuilds.push(newBuilds.pop(index))
        } else {
          console.info(
            `No match found for build ${lastBuild.flavor} in check run ${this.#name}, keeping last build.`
          )

          // If newBuild is not found, push lastBuild to mergedBuilds,
          // in order to keep it in the summary.
          mergedBuilds.push(lastBuild)
        }
      }

      // Return mergedBuilds concatenated with remaining newBuilds
      return mergedBuilds.concat(newBuilds)
    } catch (error) {
      console.error(error)

      throw new Error('Error merging builds.')
    }
  }

  /**
   * This method is used to check if a build from the last summary is in the new builds
   * The comparison is based on the flavor and registries of the builds.
   * @returns {object | undefined} The new build that matches the last build, or undefined if no match is found
   */
  #lastBuildIsContainedInNewBuilds(lastBuild, newBuilds) {
    return newBuilds.find(
      newBuild =>
        newBuild.flavor + newBuild.registries ===
        lastBuild.flavor + lastBuild.registries
    )
  }

  /**
   * This method is used to get the builds from the summary
   * The summary is a string that contains the builds in yaml format.
   * @returns {Array} The builds extracted from the summary
   */
  #extractBuildsFromSummary(summary) {
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
  #dumpFinalSummary(builds) {
    try {
      const buildsYaml = this.#textHelper.dumpYaml(builds)

      const yamlDelimiter = '```yaml'

      const endDelimiter = '```'

      return `${yamlDelimiter}\n${buildsYaml}${endDelimiter}`
    } catch (error) {
      console.error(error)

      throw new Error('Error dumping final summary.')
    }
  }
}

module.exports = {
  CheckRun
}
