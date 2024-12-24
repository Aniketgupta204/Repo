class SharkFinManager {
  constructor({ config, layers, actions, cache, managers, utils, oyster}) {
      if (!layers || !actions || !utils || !oyster) {
          throw new Error('Missing required parameters in SharkFin constructor');
      }
      
      this.config = config;
      this.utils = utils;
      this.oyster = oyster;
      this.contentToken = managers?.contentToken;
      this.layers = layers;
      this.actions = actions;
      this.wildAccess = {};
      this.userAccess = {};
      
      if (Object.values(this.actions).includes(0)) { 
          throw Error("Don't use 0 as a rank"); 
      }

      this._addWilds();
  }

  async _checkInheritance({ layerConfig, layer, nodeId, variant, userId, action, isOwner, depth = 0 }) {
      // Check if inheritance is enabled
      if (!layerConfig.inherit) {
          return false;
      }

      // Add maximum depth check
      const MAX_DEPTH = 10;
      if (depth >= MAX_DEPTH) {
          console.warn('Maximum inheritance depth reached');
          return false;
      }

      console.log(`Checking inheritance for layer: ${layer}`);
      
      const parentLayer = this._getParentLayerPath({ layer });
      const parentId = nodeId ? this._getParentId({ nodeId }) : null;

      if (!parentLayer) {
          console.log(`Parent layer not found for: ${layer}`);
          return false;
      }

      const isGranted = await this.isGranted({
          layer: parentLayer,
          nodeId: parentId,
          variant,
          userId,
          action,
          isOwner,
          childLayer: layer,
          depth: depth + 1
      });

      return isGranted;
  }

  async isGranted({ layer, variant, userId, nodeId, action, isOwner, childLayer, depth = 0 }) {
      // Validate input parameters
      if (!layer || !action) {
          console.warn('Missing required parameters in isGranted');
          return false;
      }

      // Add maximum depth check
      const MAX_DEPTH = 10;
      if (depth >= MAX_DEPTH) {
          console.warn('Maximum inheritance depth reached');
          return false;
      }

      try {
          // Check if user is blocked
          if (userId && nodeId) {
              const isBlocked = await this.isUserBlocked({ userId, nodeId });
              if (isBlocked) {
                  console.log(`User ${userId} is blocked for node ${nodeId}`);
                  return false;
              }
          }

          // Get layer configuration
          const layerConfig = this._getLayerConfig({ layer, variant });
          if (!layerConfig || Object.keys(layerConfig).length === 0) {
              console.warn(`No configuration found for layer: ${layer}`);
              return false;
          }

          // Check inheritance
          const inheritanceResult = await this._checkInheritance({
              layerConfig,
              layer,
              nodeId,
              variant,
              userId,
              action,
              isOwner,
              depth
          });

          return inheritanceResult;
      } catch (error) {
          console.error('Error in isGranted:', error);
          return false;
      }
  }

  async isUserBlocked({ userId, nodeId }) {
      if (!userId || !nodeId) {
          console.warn('Missing userId or nodeId in isUserBlocked');
          return false;
      }

      try {
          const blockedNodeIds = await this.oyster.call('nav_relation', {
              relation: '_members',
              label: 'blocked',
              _id: `user:${userId}`,
              withScores: true,
          });
          
          if (!blockedNodeIds) {
              return false;
          }
          
          return Object.keys(blockedNodeIds).some(blockedNodeId => 
              nodeId.includes(blockedNodeId.split(':')[1])
          );
      } catch (error) {
          console.error('Error checking blocked status:', error);
          // Fail secure - if there's an error checking blocked status, deny access
          return true;
      }
  }

  _getLayerConfig({ layer, variant }) {
      if (!layer) {
          console.warn('Layer parameter is required');
          return {};
      }

      const defaultVariant = "_default";
      const variantKey = variant ? `_${variant}` : defaultVariant;

      const exactLayer = this.utils.getDeepValue(layer, this.layers);
      if (!exactLayer) {
          console.warn(`Layer ${layer} not found`);
          return {};
      }

      return exactLayer[variantKey] || exactLayer[defaultVariant] || {};
  }

  _getParentLayerPath({ layer }) {
      if (!layer) return null;
      const parts = layer.split('.');
      if (parts.length <= 1) return null;
      return parts.slice(0, -1).join('.');
  }

  _getParentId({ nodeId }) {
      if (!nodeId) return null;
      const parts = nodeId.split(':');
      if (parts.length <= 1) return null;
      return parts[0];
  }

  _addWilds() {
      // Implementation for adding wild access patterns
      // This method should be implemented based on your specific requirements
      console.log('Adding wild access patterns');
  }
}

module.exports = SharkFinManager;
