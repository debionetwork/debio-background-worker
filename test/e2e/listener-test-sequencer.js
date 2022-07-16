const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {    
    const testsArray = Array.from(tests);
    
    const sequence = [];
    // Labs
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/labs/stake-successful.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/labs/unstake-successful.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/labs/update-verification-status.spec.ts');
    }));

    // Lab Services
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/services/service-created.spec.ts');
    }));

    // Order
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/orders/order-failed.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/orders/order-fulfilled.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/orders/order-paid.spec.ts');
    }));

    // Service Request
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/service-request/service-request-excess.spec.ts')
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/service-request/service-request-claimed.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/service-request/service-request-partial.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/service-request/service-request-staking-amount-refunded.spec.ts');
    }));

    // Genetic Testing
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-testing/data-staked.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-testing/dna-sample-rejected.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-testing/dna-sample-result-ready.spec.ts');
    }));

    // Genetic Analyst
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-registered.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-verification-status.spec.ts');
    }));

    // Genetic Analysis
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analysis/genetic-analysis-rejected.spec.ts');
    }));

    // Genetic Analysis Order
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-created.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-paid.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-fulfilled.spec.ts');
    }));

    // Genetic Analyst Service
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-analyst-service/genetic-analyst-service-created.spec.ts');
    }));

    return sequence;
  }
}

module.exports = CustomSequencer;