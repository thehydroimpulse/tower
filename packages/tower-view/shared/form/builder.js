var __defineProperty = function(clazz, key, value) {
  if (typeof clazz.__defineProperty == 'function') return clazz.__defineProperty(key, value);
  return clazz.prototype[key] = value;
},
  __hasProp = {}.hasOwnProperty,
  __extends =   function(child, parent) {
    if (typeof parent.__extend == 'function') return parent.__extend(child);
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } 
    function ctor() { this.constructor = child; } 
    ctor.prototype = parent.prototype; 
    child.prototype = new ctor; 
    child.__super__ = parent.prototype; 
    if (typeof parent.extended == 'function') parent.extended(child); 
    return child; 
},
  __slice = [].slice;

Tower.ViewFormBuilder = (function(_super) {
  var ViewFormBuilder;

  ViewFormBuilder = __extends(ViewFormBuilder, _super);

  function ViewFormBuilder(args, options) {
    if (options == null) {
      options = {};
    }
    this.template = options.template;
    this.model = options.model;
    this.attribute = options.attribute;
    this.parentIndex = options.parentIndex;
    this.index = options.index;
    this.tabindex = options.tabindex;
    this.accessKeys = options.accessKeys;
    this.live = options.live;
  }

  __defineProperty(ViewFormBuilder,  "defaultOptions", function(options) {
    if (options == null) {
      options = {};
    }
    options.model || (options.model = this.model);
    options.index || (options.index = this.index);
    options.attribute || (options.attribute = this.attribute);
    options.template || (options.template = this.template);
    return options;
  });

  __defineProperty(ViewFormBuilder,  "fieldset", function() {
    var args, block, options;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    block = args.pop();
    options = this.defaultOptions(_.extractOptions(args));
    options.label || (options.label = args.shift());
    options.live = this.live;
    return new Tower.ViewFormFieldset([], options).render(block);
  });

  __defineProperty(ViewFormBuilder,  "fields", function() {
    var args, attribute, block, options,
      _this = this;
    args = _.args(arguments);
    block = _.extractBlock(args);
    options = _.extractOptions(args);
    options.as = "fields";
    options.label || (options.label = false);
    attribute = args.shift() || this.attribute;
    return this.field(attribute, options, function(_field) {
      return _this.fieldset(block);
    });
  });

  __defineProperty(ViewFormBuilder,  "fieldsFor", function() {
    var attrName, attribute, index, keys, macro, options, subObject, subParent;
    options = args.extractOptions;
    attribute = args.shift;
    macro = model.macroFor(attribute);
    attrName = nil;
    if (options.as === "object") {
      attrName = attribute.toS;
    } else {
      attrName = Tower.View.renameNestedAttributes ? "" + attribute + "_attributes" : attribute.toS;
    }
    subParent = model.object;
    subObject = args.shift;
    index = options["delete"]("index");
    if (!((index.present != null) && typeof index === "string")) {
      if ((subObject.blank != null) && (index.present != null)) {
        subObject = subParent.send(attribute)[index];
      } else if ((index.blank != null) && (subObject.present != null) && macro === "hasMany") {
        index = subParent.send(attribute).index(subObject);
      }
    }
    subObject || (subObject = model["default"](attribute) || model.toS.camelize.constantize["new"]);
    keys = [model.keys, attrName];
    options.merge({
      template: template,
      model: model,
      parentIndex: index,
      accessKeys: accessKeys,
      tabindex: tabindex,
      live: this.live
    });
    return new Tower.ViewFormBuilder(options).render(block);
  });

  __defineProperty(ViewFormBuilder,  "field", function() {
    var args, attributeName, block, defaults, last, options;
    args = _.args(arguments);
    last = args[args.length - 1];
    if (last === null || last === void 0) {
      args.pop();
    }
    block = _.extractBlock(args);
    options = _.extractOptions(args);
    attributeName = args.shift() || "attribute.name";
    defaults = {
      template: this.template,
      model: this.model,
      attribute: attributeName,
      parentIndex: this.parentIndex,
      index: this.index,
      fieldHTML: options.fieldHTML || {},
      inputHTML: options.inputHTML || {},
      labelHTML: options.labelHTML || {},
      errorHTML: options.errorHTML || {},
      hintHtml: options.hintHtml || {},
      live: this.live
    };
    return new Tower.ViewFormField([], _.extend(defaults, options)).render(block);
  });

  __defineProperty(ViewFormBuilder,  "button", function() {
    var args, block, options;
    args = _.args(arguments);
    block = _.extractBlock(args);
    options = _.extractOptions(args);
    options.as || (options.as = "submit");
    options.value = args.shift() || "Submit";
    if (options.as === "submit") {
      options["class"] = Tower.View.submitFieldsetClass;
    }
    return this.field(options.value, options, block);
  });

  __defineProperty(ViewFormBuilder,  "submit", ViewFormBuilder.prototype.button);

  __defineProperty(ViewFormBuilder,  "partial", function(path, options) {
    if (options == null) {
      options = {};
    }
    return this.template.render({
      partial: path,
      locals: options.merge({
        fields: self
      })
    });
  });

  __defineProperty(ViewFormBuilder,  "tag", function() {
    var args, key;
    key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return this.template.tag(key, args);
  });

  __defineProperty(ViewFormBuilder,  "render", function(block) {
    return block(this);
  });

  return ViewFormBuilder;

})(Tower.ViewComponent);