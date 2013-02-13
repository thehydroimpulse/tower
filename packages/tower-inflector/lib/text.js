function text(key) {
  return text.instances[key] || (text.instances[key] = new Text(key));
}

text.instances = {};

function Text(key) {
  this.inflections = [];
}

var TextPrototype = Text.prototype;

TextPrototype.inflection = function(string, options) {
  // could also push into an array and iterate through inflections, calling `test` to see if it matches
  this.inflections.push(new Inflection(string, options));

  return this;
}

// > 1
TextPrototype.many = function(string, options) {
  options || (options = {});
  options.count = 'many';

  return this.inflection(string, options);
}

// 0 or many
TextPrototype.other = function(string, options) {
  options || (options = {});
  options.count = 'other';

  return this.inflection(string, options);
}

TextPrototype.one = function() {
  options || (options = {});
  options.count = 'one';
  
  return this.inflection(string, options);
}

TextPrototype.zero = function() {
  
}

TextPrototype.blank = function() {
  
}

TextPrototype.past = function() {

}

TextPrototype.future = function() {

}

// actually does the translation
TextPrototype.translate = function(options) {
  var inflections = this.inflections
    , i = 0
    , n = inflections.length;

  while (i < n) {
    if (inflections[i].test(options))
      return inflections[i].translate(options);

    i++;
  }
}
