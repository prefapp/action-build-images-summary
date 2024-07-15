const { CheckRun } = require('../src/domain/check-run')

const { TextHelper } = require('../src/infrastructure/text-helper')

const fs = require('fs')

const path = require('path')

describe('domain/CheckRun class', () => {
  it('can get the name of the check run', async () => {

    const checkRun = new CheckRun({
      lastSummary: null,

      newSummary: null,

      name: 'test',

      textHelper: new TextHelper()
    })

    expect(checkRun.name).toBe('test')
  })
  
  it('can merge different summaries', async () => {
    const lastSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run', 'cases', 'summaries_are_different','lastSummary.md'),
      'utf8'
    )

    const newSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run', 'cases', 'summaries_are_different', 'newSummary.yaml'),
      'utf8'
    )

    const expectedSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run', 'cases', 'summaries_are_different', 'mergedSummary.md'),
      'utf8'
    )

    const checkRun = new CheckRun({
      lastSummary,

      newSummary,

      name: 'test',

      textHelper: new TextHelper()
    })

    expect(checkRun.summary).toBe(expectedSummary)

  })

  it('can merge equal summaries', async () => {
    const lastSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run', 'cases', 'summaries_are_equal', 'lastSummary.md'),
      'utf8'
    )

    const newSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run', 'cases', 'summaries_are_equal', 'newSummary.yaml'),
      'utf8'
    )

    const expectedSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run', 'cases', 'summaries_are_equal', 'mergedSummary.md'),
      'utf8'
    )

    const checkRun = new CheckRun({
      lastSummary,

      newSummary,

      name: 'test',

      textHelper: new TextHelper()
    })

    console.log(checkRun.summary)

    expect(checkRun.summary).toBe(expectedSummary)

  })

  it('can merge summaries without last summary', async () => {
    const lastSummary = null

    const newSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run', 'cases', 'summaries_are_different', 'newSummary.yaml'),
      'utf8'
    )

    const checkRun = new CheckRun({
      lastSummary,

      newSummary,

      name: 'test',

      textHelper: new TextHelper()
    })

    expect(checkRun.summary).toBe(newSummary)
  })

  it('throws an error if summary is wrong', async () => {

    const lastSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run', 'cases', 'last_summary_is_wrong', 'lastSummary.md'),
      'utf8'
    )

    const newSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run', 'cases', 'last_summary_is_wrong', 'newSummary.yaml'),
      'utf8'
    )

    const checkRun = new CheckRun({
      lastSummary,

      newSummary,

      name: 'test',

      textHelper: new TextHelper()
    })

    expect(() => checkRun.summary).toThrow(new Error('Error getting builds from summary.'))
  })
})
