import "@testing-library/jest-dom";

// jsdom does not implement scrollIntoView; polyfill it so components that call
// messagesEndRef.current?.scrollIntoView(...) don't throw.
// Guard: Element is only defined in browser/jsdom environments, not in node.
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = () => {};
}
