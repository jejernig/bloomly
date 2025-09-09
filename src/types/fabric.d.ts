// Fabric.js type extensions for custom properties

import 'fabric';

declare global {
  namespace fabric {
    interface FabricObject {
      id?: string;
    }
    
    interface Object {
      id?: string;
    }
  }
}

// Augment the fabric module
declare module 'fabric' {
  namespace fabric {
    interface FabricObject {
      id?: string;
    }
    
    interface Object {
      id?: string;
    }
  }
}

export {};