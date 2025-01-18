import { Summary, Rule, Report, Result, ElementTest } from "./types";

function addValuesToSummary(summary: Summary, report: Report) {
  summary.passed += report.metadata.passed;
  summary.failed += report.metadata.failed;
  summary.warning += report.metadata.warning;
  summary.inapplicable += report.metadata.inapplicable;
}

function filterResults(result: Report, chatbotElement: HTMLElement): Report {
  let filteredAssertions: { [rule: string]: Rule } = {};
  let newMetadata = { passed: 0, failed: 0, warning: 0, inapplicable: 0 };

  for (const [ruleCode, rule] of Object.entries(result.assertions)) {
    const targetElement = rule.metadata.target.element;
    const targetElements = Array.isArray(targetElement)
      ? targetElement
      : [targetElement];
    console.log(targetElements);
    const isRelevant = targetElements.some((element) => {
      // Check if element is a valid selector
      try {
        if (chatbotElement.querySelector(element) !== null) {
          return true;
        }
      } catch (e) {
        console.warn(`Invalid selector: ${element}`);
        console.log(targetElement);
      }
      return false;
    });

    if (isRelevant) {
      let filteredResults: Result[] = [];
      (rule.results as Result[]).forEach((result) => {
        let resultFiltered = result;
        let elements: ElementTest[];

        elements = (result.elements as ElementTest[]).filter((element) => {
          if (chatbotElement.querySelector(element.pointer) !== null) {
            return element;
          }
        });

        if (elements.length === 0) return;
        resultFiltered.elements = elements as [];
        filteredResults.push(resultFiltered);
      });

      filteredAssertions[ruleCode] = rule;
      filteredAssertions[ruleCode].results = filteredResults;

      // Update the new metadata
      newMetadata.passed += rule.metadata.passed > 0 ? 1 : 0;
      newMetadata.failed += rule.metadata.failed > 0 ? 1 : 0;
      newMetadata.warning += rule.metadata.warning > 0 ? 1 : 0;
      newMetadata.inapplicable += rule.metadata.inapplicable > 0 ? 1 : 0;
    }
  }

  // Create a new report object with updated assertions and metadata
  return {
    ...result,
    assertions: filteredAssertions,
    metadata: newMetadata,
  };
}

export { addValuesToSummary, filterResults };
