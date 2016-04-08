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
            case NodeTypes.Polygon:
               return new S2GPolygon();
            case NodeTypes.Polyline:
               return new S2GPolyline();
        }
    }

    _getNodeProps(svgData) {
        let svgNodeProps = {};
        let svgNodeMetadata = {};

        Object.keys(svgData).map((key, index) => {
            if (key === NodeTypes.Metadata) {
                Object.assign(svgNodeMetadata, svgData[key]);
            } else if (svgData[key].constructor == String) {
                Object.assign(svgNodeProps, { [key]: svgData[key] });
            }
        });

        return { svgNodeProps, svgNodeMetadata };
    }
};
