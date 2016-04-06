var S2GNamespace = function (s) {
    var ns = typeof window !== "undefined" && window !== null ? window : self;

    var parts = s.split('.');
    for (var i = 0; i < parts.length; ++i) {
        ns[parts[i]] = ns[parts[i]] || {};
        ns = ns[parts[i]];
    }

    return ns;
};

S2GNamespace('Autodesk.BIM360.Convert');

(function (Namespace) {

    class S2G {
        constructor(options) {
            this.options = Object.assign({}, options);
            this.initialize();
        }

        initialize() {
            this.x2js = new X2JS({stripWhitespaces : true});
        }

        parseSvgText(svgText) {
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
                        let feature = new Namespace.S2GFeature(svg_props);
                        feature.parse(key, svg_data[key]);
                        featureList.push(feature);
                        break;
                }
            }.bind(this));

            return featureList;
        }

        _getSvgProps(svgData) {
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
                        let descriptor = Object.getOwnPropertyDescriptor(svgData, key);
                        Object.defineProperty(svgProps, key, descriptor);
                        break;
                }
            });

            return { svgProps, svgMetadata };
        }
    }

    // Static attribute for S2G
    S2G.NodeTypes = {
        Rectangle: "rect",
        Ellipse: "ellipse",
        Polygon: "polygon",
        Polyline: "path",
        Metadata: "metadata"
    };

    Namespace.S2G = S2G;

})(Autodesk.BIM360.Convert);
