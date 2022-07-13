const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {    
    const testsArray = Array.from(tests);
    
    const sequence = [];
    // service request
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/service-request/service-request-claimed.spec.ts');
    }));

    // labs
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/labs/lab-registered.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/labs/lab-update-verification-status.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/labs/lab-updated.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/labs/lab-deregistered.spec.ts');
    }));

    return sequence;
  }
}

module.exports = CustomSequencer;