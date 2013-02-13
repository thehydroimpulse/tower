function Inflection(string, options) {
  options || (options = {});

  //this.count = options.count || 'one';
  this.tense = options.tense || 'present';
  this.key = this.count + ':' + this.tense;
  this.string = string;

  this.options = options;
}

var InflectionPrototype = Inflection.prototype;

InflectionPrototype.test = function(options) {
  // TODO: can make this much more robust
  return (this.count == options.count) && (this.tense == options.tense);
}

InflectionPrototype.translate = function(options) {
  // TODO
  return this.string.replace('x', options);
}
