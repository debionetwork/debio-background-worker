const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {    
    const testsArray = Array.from(tests);
    
    const sequence = [];
    // service request
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/service-request-events.spec.ts');
    }));

    // labs
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/labs-events.spec.ts');
    }));

    // certification
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/certification-events.spec.ts');
    }));

    // service
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/service-events.spec.ts');
    }));

    // genetic testing
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/genetic-testing-events.spec.ts');
    }));

    // order
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/orders-events.spec.ts');
    }));

    // genetic analyst
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/genetic-analyst-events.spec.ts');
    }));

    // genetic analyst service
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/genetic-analyst-service-events.spec.ts');
    }));

    // genetic analyst qualification
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/genetic-analyst-qualification-events.spec.ts');
    }));

    // genetic data
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/genetic-data-events.spec.ts');
    }));

    // genetic analyst service
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/genetic-analysis-events.spec.ts');
    }));

    // genetic analyst qualification
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/genetic-analysis-order-events.spec.ts');
    }));

    return sequence;
  }
}

module.exports = CustomSequencer;