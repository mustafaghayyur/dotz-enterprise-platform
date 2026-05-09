/**
 * this library is in development.
 * non functional code.
 */

// Example of a safer approach to storing detached nodes
const detachedNodes = new WeakMap();

function storeNode(node) {
  // If the node is removed, the WeakMap won't prevent garbage collection
  detachedNodes.set(node, { /* meta-data */ });
  node.remove();
}