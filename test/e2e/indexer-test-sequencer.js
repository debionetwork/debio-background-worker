const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {    
    const testsArray = Array.from(tests);
    
    const sequence = [];
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('indexer/events/service-request/service-request-claimed.spec.ts');
    }));

    return sequence;
  }
}

module.exports = CustomSequencer;