import S2GRectangle from './s2g-rectangle';
import S2GPolyline from './s2g-polyline';
import S2GPolygon from './s2g-polygon';
import { NodeTypes } from './s2g';

export default class S2GFeature {
    constructor(properties = {}) {
        this.type = 'Feature';
        this.geometry = {};
        this.properties = properties;
    }

    parse(shape, shapeSvgData) {
        // Insert node props
        let node_props = this._getNodeProps(shapeSvgData);
        this.properties = Object.assign(this.properties, node_props);

        let geo_shape = this._getShapeInstance(shape);
        if (geo_shape) {
            geo_shape.parse(shapeSvgData);
            this.geometry = geo_shape;
        }
    }

    _getShapeInstance(shape) {
        switch (shape) {
            case NodeTypes.Rectangle:
                return new S2GRectangle();
            case NodeTypes.Ellipse:
                console.warn('Unsupport shape: Ellipse');
                return null;
            case NodeTypes.Polygon:
               return new S2GPolygon();
            case NodeTypes.Polyline:
               return new S2GPolyline();
        }
    }

    _getNodeProps(svgData) {
        let metadata = NodeTypes.Metadata;

        let svgNodeProps = Object.assign({}, svgData);
        delete svgNodeProps.metadata;

        let svgNodeMetadata = Object.assign({}, svgData.metadata || {});
        return { svgNodeProps, svgNodeMetadata };
    }
};
