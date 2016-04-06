(function (root) {
    function S2G(options) {
        this.options = options || {};
        this.initialize();
    }

    S2G.NodeTypes = {
        Rectangle: "rect",
        Ellipse: "ellipse",
        Polygon: "polygon",
        Polyline: "path",
        Metadata: "metadata"
    };

    var proto = S2G.prototype;

    proto.initialize = function() {
        this.x2js = new X2JS({stripWhitespaces : true});
    };

    proto.parseSvgText = function(svgText) {
        let featureList = [];

        if (!svgText) {
            return featureList;
        }

        let svg_object = this.x2js.xml_str2json(svgText);
        if (!svg_object || !svg_object.svg) {
            console.warn('Invalid SVG text.');
            return featureList;
        }

        let svg_data = svg_object.svg;
        let svg_props = this._getSvgProps(svg_data);

        Object.keys(svg_data).map(function(key, index) {
            switch (key) {
                case S2G.NodeTypes.Rectangle:
                case S2G.NodeTypes.Ellipse:
                case S2G.NodeTypes.Polygon:
                case S2G.NodeTypes.Polyline:
                    let feature = new S2GFeature(svg_props);
                    feature.parse(key, svg_data[key]);
                    featureList.push(feature);
                    break;
            }
        }.bind(this));

        return featureList;
    };

    proto._getSvgProps = function(svgData) {
        let svgProps = {};
        let svgMetadata = {};
        Object.keys(svgData).map(function(key, index) {
            switch (key) {
                case S2G.NodeTypes.Rectangle:
                case S2G.NodeTypes.Ellipse:
                case S2G.NodeTypes.Polygon:
                case S2G.NodeTypes.Polyline:
                    // Ingore shape properties
                    break;
                case S2G.NodeTypes.Metadata:
                    svgMetadata = Object.assign({}, svgMetadata, svgData[key]);
                    break;
                default:
                    svgProps = Object.assign({}, svgProps, svgData[key]);
                    break;

            }
        });

        return { svgProps, svgMetadata };
    };

    root.S2G = S2G;

})(window || self);
