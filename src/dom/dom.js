(function() {
  'use strict';

  lfr.dom = lfr.dom || {};

  /**
   * Adds the requested CSS classes to an element.
   * @param {!Element} element The element to add CSS classes to.
   * @param {!Array<string>} classes CSS classes to add.
   */
  lfr.dom.addClasses = function(element, classes) {
    classes.forEach(function(className) {
      element.classList.add(className);
    });
  };

  /**
   * Appends a child node with text or other nodes to a parent node. If
   * child is a HTML string it will be automatically converted to a document
   * fragment before appending it to the parent.
   * @param {!Element} parent The node to append nodes to.
   * @param {!Element|String} child The thing to append to the parent.
   * @return {!Element} The appended child.
   */
  lfr.dom.append = function(parent, child) {
    if (lfr.isString(child)) {
      child = lfr.dom.buildFragment(child);
    }
    return parent.appendChild(child);
  };

  /**
   * Helper for converting a HTML string into a document fragment.
   * @param {string} htmlString The HTML string to convert.
   * @return {!Element} The resulting document fragment.
   */
  lfr.dom.buildFragment = function(htmlString) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = '<br>' + htmlString;
    tempDiv.removeChild(tempDiv.firstChild);

    var fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  };

  /**
   * Listens to the specified event on the given DOM element, but only calls the
   * callback with the event when it triggered by elements that match the given
   * selector.
   * @param {!Element} element The container DOM element to listen to the event on.
   * @param {string} eventName The name of the event to listen to.
   * @param {string} selector The selector that matches the child elements that
   *   the event should be triggered for.
   * @param {!function(!Object)} callback Function to be called when the event is
   *   triggered. It will receive the normalized event object.
   * @return {!lfr.DomEventHandle} Can be used to remove the listener.
   */
  lfr.dom.delegate = function(element, eventName, selector, callback) {
    return lfr.dom.on(
      element,
      eventName,
      lfr.bind(lfr.dom.handleDelegateEvent_, null, selector, callback)
    );
  };

  /**
   * This is called when an event is triggered by a delegate listener (see
   * `lfr.dom.delegate` for more details).
   * @param {string} selector The selector that matches the child elements that
   *   the event should be triggered for.
   * @param {!function(!Object)} callback Function to be called when the event is
   *   triggered. It will receive the normalized event object.
   * @param {!Event} event The event payload.
   * @return {boolean} False if at least one of the triggered callbacks returns false,
   *   or true otherwise.
   */
  lfr.dom.handleDelegateEvent_ = function(selector, callback, event) {
    lfr.dom.normalizeDelegateEvent_(event);

    var currentElement = event.target;
    var returnValue = true;

    while (currentElement && !event.stopped) {
      if (lfr.dom.match(currentElement, selector)) {
        event.delegateTarget = currentElement;
        returnValue &= callback(event);
      }
      currentElement = currentElement.parentNode;
    }

    return returnValue;
  };

  /**
   * Check if an element matches a given selector.
   * @param {Element} element
   * @param {string} selector
   * @return {boolean}
   */
  lfr.dom.match = function(element, selector) {
    if (!element || element.nodeType !== 1) {
      return false;
    }

    var p = Element.prototype;
    var m = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector;
    if (m) {
      return m.call(element, selector);
    }

    return lfr.dom.matchFallback_(element, selector);
  };

  /**
   * Check if an element matches a given selector, using an internal implementation
   * instead of calling existing javascript functions.
   * @param {Element} element
   * @param {string} selector
   * @return {boolean}
   * @protected
   */
  lfr.dom.matchFallback_ = function(element, selector) {
    var nodes = document.querySelectorAll(selector, element.parentNode);
    for (var i = 0; i < nodes.length; ++i) {
      if (nodes[i] === element) {
        return true;
      }
    }
    return false;
  };

  /**
   * Normalizes the event payload for delegate listeners.
   * @param {!Event} event
   */
  lfr.dom.normalizeDelegateEvent_ = function(event) {
    event.stopPropagation = lfr.dom.stopPropagation_;
    event.stopImmediatePropagation = lfr.dom.stopImmediatePropagation_;
  };

  /**
   * Listens to the specified event on the given DOM element. This function normalizes
   * DOM event payloads and functions so they'll work the same way on all supported
   * browsers.
   * @param {!Element} element The DOM element to listen to the event on.
   * @param {string} eventName The name of the event to listen to.
   * @param {!function(!Object)} callback Function to be called when the event is
   *   triggered. It will receive the normalized event object.
   * @return {!lfr.DomEventHandle} Can be used to remove the listener.
   */
  lfr.dom.on = function(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    return new lfr.DomEventHandle(element, eventName, callback);
  };

  /**
   * Removes all the child nodes on a DOM node.
   * @param {Element} node Element to remove children from.
   */
  lfr.dom.removeChildren = function(node) {
    var child;
    while ((child = node.firstChild)) {
      node.removeChild(child);
    }
  };

  /**
   * Removes the requested CSS classes from an element.
   * @param {!Element} element The element to remove CSS classes from.
   * @param {!Array<string>} classes CSS classes to remove.
   */
  lfr.dom.removeClasses = function(element, classes) {
    classes.forEach(function(className) {
      element.classList.remove(className);
    });
  };

  /**
   * The function that replaces `stopImmediatePropagation_` for events.
   * @protected
   */
  lfr.dom.stopImmediatePropagation_ = function() {
    this.stopped = true;
    Event.prototype.stopImmediatePropagation.call(this);
  };

  /**
   * The function that replaces `stopPropagation` for events.
   * @protected
   */
  lfr.dom.stopPropagation_ = function() {
    this.stopped = true;
    Event.prototype.stopPropagation.call(this);
  };

  /**
   * Checks if the given element supports the given event type.
   * @param {!Element} element The DOM element to check.
   * @param {string} eventName The name of the event to check.
   * @return {boolean}
   */
  lfr.dom.supportsEvent = function(element, eventName) {
    return 'on' + eventName in element;
  };

  /**
   * Converts the given argument to a DOM element. Strings are assumed to
   * be selectors, and so a matched element will be returned. If the arg
   * is already a DOM element it will be the return value.
   * @param {string|Element} selectorOrElement
   * @return {Element} The converted element, or null if none was found.
   */
  lfr.dom.toElement = function(selectorOrElement) {
    if (lfr.isElement(selectorOrElement)) {
      return selectorOrElement;
    } else if (lfr.isString(selectorOrElement)) {
      return document.querySelector(selectorOrElement);
    } else {
      return null;
    }
  };

  /**
   * Triggers the specified event on the given element.
   * NOTE: This should mostly be used for testing, not on real code.
   * @param {!Element} element The node that should trigger the event.
   * @param {string} eventName The name of the event to be triggred.
   * @param {Object=} opt_eventObj An object with data that should be on the
   *   triggered event's payload.
   */
  lfr.dom.triggerEvent = function(element, eventName, opt_eventObj) {
    var eventObj = document.createEvent('HTMLEvents');
    eventObj.initEvent(eventName, true, true);
    lfr.object.mixin(eventObj, opt_eventObj);
    element.dispatchEvent(eventObj);
  };
}());
