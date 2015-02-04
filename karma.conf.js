module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      'src/lfr.js',
      'src/object/object.js',
      'src/array/array.js',
      'src/string/string.js',
      'src/html/html.js',
      'src/promise/Promise.js',
      'src/disposable/Disposable.js',
      'src/structs/Trie.js',
      'src/structs/WildcardTrie.js',
      'src/events/EventHandle.js',
      'src/events/DomEventHandle.js',
      'src/events/EventHandler.js',
      'src/events/EventEmitter.js',
      'src/events/EventEmitterProxy.js',
      'src/dom/dom.js',
      'src/attribute/Attribute.js',
      'src/net/Transport.js',
      'src/net/XhrTransport.js',
      'src/net/WebSocketTransport.js',
      'src/webchannel/WebChannel.js',
      'src/component/Component.js',
      'src/component/SoyComponent.js',
      'test/html/fixture/*.html',
      'test/**/*.js'
    ],

    preprocessors: {
      'src/!(promise)/**/*.js': ['coverage'],
      'test/html/fixture/*.html': ['html2js']
    },

    reporters: ['coverage', 'progress'],

    coverageReporter: {
      reporters: [
        {
          type : 'text-summary'
        },
        {
          type : 'html'
        },
        {
          type: 'lcov',
          subdir: 'lcov'
        },
      ]
    }
  });
};
