(function(){
    function S2GFeature(properties){
        this.type = 'Feature';
        this.geometry = {};
        this.properties = Object.assign({}, properties);
    }

    var proto = S2GFeature.prototype;

    proto.parse = function(type, shapeSvgData) {
        // Insert node props
        let node_props = this._getNodeProps(shapeSvgData);
        this.properties = Object.assign(this.properties, node_props);

        let geo_shape = this._getShapeInstance(type);
        if (geo_shape) {
            geo_shape.parse(shapeSvgData);
            this.geometry = geo_shape;
        }
    };

    proto._getShapeInstance = function(type) {
        switch (type) {
            case S2G.NodeTypes.Rectangle:
                return new S2GRectangle();
            case S2G.NodeTypes.Ellipse:
                console.warn('Unsupport shape: Ellipse');
                return null;
            case S2G.NodeTypes.Polygon:
                console.warn('Unsupport shape: Polygon');
                return null;
            case S2G.NodeTypes.Polyline:
                console.warn('Unsupport shape: Polyline');
                return null;
        }
    };

    proto._getNodeProps = function(svgData) {
        let svgNodeProps = {};
        let svgNodeMetadata = {};
        Object.keys(svgData).map(function(key, index) {
            if (key === S2G.NodeTypes.Metadata) {
                svgNodeMetadata = Object.assign({}, svgNodeMetadata, svgData[key]);
            } else {
                svgNodeProps = Object.assign({}, svgNodeProps, svgData[key]);
            }
        });
        return { svgNodeProps, svgNodeMetadata };
    };

})();
