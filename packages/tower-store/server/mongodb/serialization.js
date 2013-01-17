var _;

_ = Tower._;

Tower.StoreMongodbSerialization = {
  DATA_TYPES: {
    id: 'id',
    reference: 'reference',
    binary: 'binary',
    array: 'array',
    hash: 'hash',
    boolean: 'boolean',
    integer: 'integer',
    decimal: 'float',
    float: 'float',
    long: 'long',
    bigint: 'long',
    date: 'datetime',
    time: 'datetime',
    datetime: 'datetime',
    timestamp: 'datetime',
    string: 'string',
    text: 'string'
  },
  serializeModel: function(attributes, saved) {
    var klass, model;
    if (saved == null) {
      saved = false;
    }
    if (attributes instanceof Tower.Model) {
      return attributes;
    }
    klass = Tower.constant(this.className);
    attributes.id || (attributes.id = attributes._id);
    delete attributes._id;
    model = klass["new"]();
    model.initialize(attributes, {
      isNew: !saved
    });
    return model;
  },
  generateId: function() {
    return new this.constructor.database.bson_serializer.ObjectID();
  },
  serializeAttributesForUpdate: function(attributes) {
    var key, operator, result, schema, value, _key, _value;
    result = {};
    schema = this.schema();
    for (key in attributes) {
      value = attributes[key];
      if (key === 'id') {
        continue;
      }
      operator = this.constructor.atomicModifiers[key];
      if (operator) {
        key = operator;
        result[key] || (result[key] = {});
        for (_key in value) {
          _value = value[_key];
          result[key][_key] = this.encode(schema[_key], _value, operator);
        }
      } else {
        result['$set'] || (result['$set'] = {});
        result['$set'][key] = this.encode(schema[key], value);
      }
    }
    for (operator in result) {
      value = result[operator];
      this._flattenObject(value);
    }
    return result;
  },
  _flattenObject: function(object) {
    var key, value;
    for (key in object) {
      value = object[key];
      this._flattenValue(object, key, value);
    }
    return object;
  },
  _flattenValue: function(host, key, value) {
    var _key, _results, _value;
    if (_.isHash(value)) {
      delete host[key];
      _results = [];
      for (_key in value) {
        _value = value[_key];
        _results.push(this._flattenValue(host, "" + key + "." + _key, _value));
      }
      return _results;
    } else {
      return host[key] = value;
    }
  },
  serializeAttributesForInsert: function(record) {
    var attributes, key, operator, realKey, result, schema, value;
    result = {};
    schema = this.schema();
    attributes = this.deserializeModel(record);
    for (key in attributes) {
      value = attributes[key];
      if (key === 'id' && value === void 0 || value === null) {
        continue;
      }
      realKey = key === 'id' ? '_id' : key;
      operator = this.constructor.atomicModifiers[key];
      if (!operator) {
        result[realKey] = this.encode(schema[key], value);
      }
    }
    return result;
  },
  deserializeAttributes: function(attributes) {
    var field, key, schema, value;
    schema = this.schema();
    for (key in attributes) {
      value = attributes[key];
      field = schema[key];
      if (field) {
        attributes[key] = this.decode(field, value);
      }
    }
    return attributes;
  },
  serializeConditions: function(cursor) {
    var field, key, operator, operators, query, result, schema, value, _key, _value;
    schema = this.schema();
    result = {};
    query = this.deserializeModel(cursor.conditions());
    operators = this.constructor.queryOperators;
    for (key in query) {
      value = query[key];
      field = schema[key];
      if (key === 'id') {
        key = '_id';
      }
      if (_.isRegExp(value)) {
        result[key] = value;
      } else if (_.isHash(value)) {
        result[key] = {};
        for (_key in value) {
          _value = value[_key];
          operator = operators[_key];
          if (operator === '$eq') {
            result[key] = this.encode(field, _value, _key);
          } else {
            if (operator) {
              _key = operator;
            }
            if (_key === '$in') {
              _value = _.castArray(_value);
            }
            if (_key === '$match') {
              _key = '$regex';
            }
            if (_key === '$regex' && _value instanceof Array) {
              _value = _value[0];
            }
            result[key][_key] = this.encode(field, _value, _key);
          }
        }
      } else {
        result[key] = this.encode(field, value);
      }
    }
    return result;
  },
  serializeOptions: function(cursor) {
    var fields, limit, offset, options, sort;
    limit = cursor.getCriteria('limit');
    sort = cursor.getCriteria('order');
    offset = cursor.getCriteria('offset');
    fields = cursor.getCriteria('fields');
    options = {};
    if (limit) {
      options.limit = limit;
    }
    if (fields && fields.length) {
      options.fields = fields;
    }
    if (sort.length) {
      options.sort = _.map(sort, function(set) {
        return [set[0] === 'id' ? '_id' : set[0], set[1] === 'asc' ? 1 : -1];
      });
    }
    if (offset) {
      options.skip = offset;
    }
    return options;
  },
  encode: function(field, value, operation) {
    var method, v;
    if (!field) {
      return value;
    }
    method = this["encode" + field.encodingType];
    if (_.isArray(value) && field.encodingType.toLowerCase() === 'string') {
      value = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          v = value[_i];
          _results.push(method.call(this, v, operation));
        }
        return _results;
      }).call(this);
    } else if (method) {
      value = method.call(this, value, operation);
    }
    if (operation === '$in' && !_.isArray(value)) {
      value = [value];
    }
    return value;
  },
  decode: function(field, value, operation) {
    var method;
    if (!field) {
      return value;
    }
    method = this["decode" + field.type];
    if (method) {
      value = method.call(this, value);
    }
    return value;
  },
  encodeString: function(value) {
    if (value) {
      return value.toString();
    } else {
      return value;
    }
  },
  encodeOrder: function(value) {},
  encodeDate: function(value) {
    return _.toDate(value);
  },
  encodeGeo: function(value) {
    return [value.lng, value.lat].reverse();
  },
  decodeGeo: function(value) {
    if (!value) {
      return value;
    }
    return {
      lat: value[1],
      lng: value[0]
    };
  },
  decodeDate: function(value) {
    return value;
  },
  encodeBoolean: function(value) {
    if (this.constructor.booleans.hasOwnProperty(value)) {
      return this.constructor.booleans[value];
    } else {
      throw new Error("" + (value.toString()) + " is not a boolean");
    }
  },
  encodeArray: function(value, operation) {
    if (!(operation || value === null || _.isArray(value))) {
      throw new Error("Value is not Array");
    }
    return value;
  },
  encodeFloat: function(value) {
    if (_.isBlank(value)) {
      return null;
    }
    try {
      return parseFloat(value);
    } catch (error) {
      return value;
    }
  },
  encodeInteger: function(value) {
    if (!value && value !== 0) {
      return null;
    }
    if (value.toString().match(/(^[-+]?[0-9]+$)|(\.0+)$/)) {
      return parseInt(value);
    } else {
      return parseFloat(value);
    }
  },
  encodeLocalized: function(value) {
    var object;
    object = {};
    return object[I18n.locale] = value.toString();
  },
  decodeLocalized: function(value) {
    return value[I18n.locale];
  },
  encodeNilClass: function(value) {
    return null;
  },
  decodeNilClass: function(value) {
    return null;
  },
  encodeId: function(value) {
    var i, id, item, result, _i, _len;
    if (!value) {
      return value;
    }
    if (_.isArray(value)) {
      result = [];
      for (i = _i = 0, _len = value.length; _i < _len; i = ++_i) {
        item = value[i];
        try {
          id = this._encodeId(item);
          result[i] = id;
        } catch (error) {
          id;

        }
      }
      return result;
    } else {
      return this._encodeId(value);
    }
  },
  _encodeId: function(value) {
    if (typeof value === 'number') {
      return value;
    }
    try {
      return this.constructor.database.bson_serializer.ObjectID(value);
    } catch (error) {
      return value;
    }
  },
  decodeId: function(value) {
    return value.toString();
  }
};

module.exports = Tower.StoreMongodbSerialization;