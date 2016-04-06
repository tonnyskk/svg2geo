((Namespace) => {

    class S2GFeature {
        constructor(properties = {}) {
            this.type = 'Feature';
            this.geometry = {};
            this.properties = properties;
        }

        parse(type, shapeSvgData) {
            // Insert node props
            let node_props = this._getNodeProps(shapeSvgData);
            this.properties = Object.assign(this.properties, node_props);

            let geo_shape = this._getShapeInstance(type);
            if (geo_shape) {
                geo_shape.parse(shapeSvgData);
                this.geometry = geo_shape;
            }
        }

        _getShapeInstance(type) {
            switch (type) {
                case Namespace.S2G.NodeTypes.Rectangle:
                    return new Namespace.S2GRectangle();
                case Namespace.S2G.NodeTypes.Ellipse:
                    console.warn('Unsupport shape: Ellipse');
                    return null;
                case Namespace.S2G.NodeTypes.Polygon:
                    console.warn('Unsupport shape: Polygon');
                    return null;
                case Namespace.S2G.NodeTypes.Polyline:
                    console.warn('Unsupport shape: Polyline');
                    return null;
            }
        }

        _getNodeProps(svgData) {
            let metadata = Namespace.S2G.NodeTypes.Metadata;
            let svgNodeProps = Object.assign({}, svgData);
            delete svgNodeProps.metadata;

            let svgNodeMetadata = Object.assign({}, svgData.metadata || {});

            return { svgNodeProps, svgNodeMetadata };
        }
    }

    Namespace.S2GFeature = S2GFeature;

})(Autodesk.BIM360.Convert);
