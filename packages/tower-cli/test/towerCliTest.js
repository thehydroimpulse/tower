var cli = require('..')
  , assert = require('chai').assert;

function argv(args) {
  return ['node', 'tower'].concat(args);
}

suite('towerCliTest', function() {
  test('tower info', function() {
    //var program = cli.info(argv(['info']));
  });

  test('tower server', function() {
    var program = cli.server(argv(['server']));
  });
});
