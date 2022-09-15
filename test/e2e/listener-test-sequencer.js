const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {    
    const testsArray = Array.from(tests);
    
    const sequence = [];
    // Labs
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/labs/labs-events.spec.ts');
    }));

    // Lab Services
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/services/services-events.spec.ts');
    }));

    // Order
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/orders/orders-events.spec.ts');
    }));

    // Service Request
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/service-request/service-request-events.spec.ts')
    }));

    // Genetic Testing
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-testing/genetic-testing-events.spec.ts');
    }));

    // Genetic Analyst
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-events.spec.ts');
    }));

    // Genetic Analysis
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analysis/genetic-analysis-events.spec.ts');
    }));

    // Genetic Analysis Order
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-events.spec.ts');
    }));

    // Genetic Analyst Service
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analyst-service/genetic-analyst-service-events.spec.ts');
    }));

    return sequence;
  }
}

module.exports = CustomSequencer;