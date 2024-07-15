const { CheckRunHandler } = require('../src/application/check-run-handler')
const { GhHelper } = require('../src/infrastructure/gh-helper')
const { TextHelper } = require('../src/infrastructure/text-helper')

const fs = require('fs')
const path = require('path')

describe('application/CheckRunManager class', () => {
  it('can set the right output without lastSummary', async () => {
    // Get faked lastSummary
    const newSummary = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'check-run-manager', 'lastSummary.md'),
      'utf8'
    )

    // Build a fake GhHelper
    const fakeGhHelper = new GhHelper({
      cli: {
        request: jest.fn().mockResolvedValue({
          data: {
            check_runs: [
              {
                name: 'test-workflow',
                output: {
                  summary: false
                }
              }
            ]
          }
        })
      }
    })

    const expectedSummary = newSummary

    // Instantiate CheckRunManager
    const handler = new CheckRunHandler({
      ghHelper: fakeGhHelper,
      textHelper: new TextHelper(),
      owner: 'test-owner',
      repo: 'test-repo',
      workflowName: 'test-workflow',
      ref: 'test-ref'
    })

    const finalSummary = await handler.getMergedSummaries(newSummary)

    expect(finalSummary).toBe(expectedSummary)
  })
})
